import { ExecutionContext, D1Database, R2Bucket } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  BACKUP_BUCKET: R2Bucket;
}

async function performBackup(env: Env): Promise<{ success: boolean; message: string; filename?: string; timestamp?: string; tableCount?: number; error?: string }> {
  try {
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;

    console.log(`Starting backup: ${filename}`);

    // Get all tables from the database
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all();

    console.log(`Found ${tables.results.length} tables to backup`);
    let sqlDump = '';

    // For each table, get schema and data
    for (const table of tables.results) {
      const tableName = table.name;
      console.log(`Processing table: ${tableName}`);

      // Get table schema
      const schema = await env.DB.prepare(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`
      ).bind(tableName).first();

      if (schema) {
        sqlDump += `${schema.sql};\n\n`;
      }

      // Get table data
      const data = await env.DB.prepare(`SELECT * FROM ${tableName}`).all();
      
      // Generate INSERT statements
      for (const row of data.results) {
        const columns = Object.keys(row);
        const values = Object.values(row).map(value => {
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          return value;
        });

        sqlDump += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sqlDump += '\n';
    }

    // Upload to R2
    await env.BACKUP_BUCKET.put(filename, sqlDump, {
      httpMetadata: {
        contentType: 'application/sql'
      },
      customMetadata: {
        timestamp: timestamp,
        tableCount: tables.results.length.toString(),
        backupType: 'scheduled'
      }
    });

    console.log(`Backup completed successfully: ${filename}`);

    return {
      success: true,
      message: 'Backup completed successfully',
      filename,
      timestamp,
      tableCount: tables.results.length
    };

  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      message: 'Backup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default {
  // HTTP request handler
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const result = await performBackup(env);
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Scheduled event handler
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Starting scheduled backup at ${new Date().toISOString()}`);
    const result = await performBackup(env);
    if (!result.success) {
      // Throw error to trigger retry mechanism
      throw new Error(`Scheduled backup failed: ${result.error}`);
    }
  }
}; 