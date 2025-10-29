#!/usr/bin/env node

/**
 * Script: Run Supabase Migrations
 * Description: รัน migration files จากโฟลเดอร์ supabase/migrations
 * Usage: node scripts/run-migrations.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Client } = pg;

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// For Supabase cloud, we need to handle SSL properly
if (process.env.POSTGRES_URL_NON_POOLING && process.env.POSTGRES_URL_NON_POOLING.includes('supabase')) {
  // Override NODE_TLS_REJECT_UNAUTHORIZED for Supabase connections
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

/**
 * Get all migration files sorted by filename
 */
function getMigrationFiles() {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    return files
      .filter((file) => file.endsWith('.sql'))
      .sort(); // Sort by filename (timestamp prefix)
  } catch (error) {
    console.error('❌ Error reading migrations directory:', error.message);
    process.exit(1);
  }
}

/**
 * Read SQL file content
 */
function readMigrationFile(filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading file ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Run single migration
 */
async function runMigration(client, filename, sql) {
  console.log(`\n🔄 Running migration: ${filename}`);
  console.log('─'.repeat(60));

  try {
    // Start transaction
    await client.query('BEGIN');

    // Execute migration SQL
    await client.query(sql);

    // Commit transaction
    await client.query('COMMIT');

    console.log(`✅ Migration completed: ${filename}`);
    return { success: true, filename };
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`Error: ${error.message}`);

    // Show more details for debugging
    if (error.position) {
      console.error(`Position: ${error.position}`);
    }
    if (error.hint) {
      console.error(`Hint: ${error.hint}`);
    }

    return { success: false, filename, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Supabase Migrations');
  console.log('='.repeat(60));

  // Validate configuration
  if (!config.connectionString) {
    console.error('❌ Error: POSTGRES_URL_NON_POOLING not found in .env.local');
    console.error('Please make sure .env.local exists and contains the connection string.');
    process.exit(1);
  }

  console.log(`📁 Migrations directory: ${MIGRATIONS_DIR}`);

  // Get migration files
  const migrationFiles = getMigrationFiles();

  if (migrationFiles.length === 0) {
    console.log('⚠️  No migration files found.');
    process.exit(0);
  }

  console.log(`📋 Found ${migrationFiles.length} migration file(s):`);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  // Create database client
  const client = new Client(config);

  try {
    // Connect to database
    console.log('\n🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to Supabase database');

    // Run migrations
    const results = [];
    for (const filename of migrationFiles) {
      const sql = readMigrationFile(filename);
      const result = await runMigration(client, filename, sql);
      results.push(result);

      // Stop if migration fails
      if (!result.success) {
        console.log('\n❌ Migration process stopped due to error.');
        break;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('─'.repeat(60));

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total: ${results.length}`);

    if (failed > 0) {
      console.log('\n⚠️  Some migrations failed. Please check the errors above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All migrations completed successfully!');
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await client.end();
    console.log('\n👋 Database connection closed.');
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
