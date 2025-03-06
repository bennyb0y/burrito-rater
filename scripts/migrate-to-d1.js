// This script exports data from SQLite and prepares it for import to Cloudflare D1
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting migration from SQLite to D1...');
  
  // Connect to SQLite database using Prisma
  const prisma = new PrismaClient();
  
  try {
    // Fetch all ratings from SQLite
    console.log('Fetching ratings from SQLite...');
    const ratings = await prisma.rating.findMany();
    console.log(`Found ${ratings.length} ratings to migrate.`);
    
    if (ratings.length === 0) {
      console.log('No ratings to migrate. Exiting.');
      return;
    }
    
    // Generate SQL insert statements for D1
    console.log('Generating SQL insert statements...');
    let sqlStatements = [];
    
    // Add a statement to delete all existing data (optional)
    sqlStatements.push('-- Delete existing data (optional, uncomment if needed)');
    sqlStatements.push('-- DELETE FROM Rating;');
    sqlStatements.push('');
    
    // Add insert statements for each rating
    for (const rating of ratings) {
      const columns = Object.keys(rating).join(', ');
      
      // Format values properly based on their type
      const values = Object.values(rating).map(value => {
        if (value === null || value === undefined) {
          return 'NULL';
        } else if (typeof value === 'string') {
          // Escape single quotes in strings
          return `'${value.replace(/'/g, "''")}'`;
        } else if (value instanceof Date) {
          return `'${value.toISOString()}'`;
        } else if (typeof value === 'boolean') {
          return value ? '1' : '0';
        } else {
          return value;
        }
      }).join(', ');
      
      sqlStatements.push(`INSERT INTO Rating (${columns}) VALUES (${values});`);
    }
    
    // Write SQL statements to a file
    const outputFile = path.join(__dirname, '../migration-data.sql');
    fs.writeFileSync(outputFile, sqlStatements.join('\n'));
    
    console.log(`Migration SQL file created at: ${outputFile}`);
    console.log('');
    console.log('To import this data to D1, run:');
    console.log('wrangler d1 execute your-database-name --file=migration-data.sql');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 