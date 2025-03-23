const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

main(); 