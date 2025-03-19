import { ExecutionContext, D1Database, R2Bucket } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  BACKUP_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Generate timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql`;

      // Get all tables from the database
      const tables = await env.DB.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      ).all();

      let sqlDump = '';

      // For each table, get schema and data
      for (const table of tables.results) {
        const tableName = table.name;

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
          tableCount: tables.results.length.toString()
        }
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Backup completed successfully',
        filename: filename,
        timestamp: timestamp,
        tableCount: tables.results.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Backup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}; 