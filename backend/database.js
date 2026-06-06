const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

let pgPool = null;
let sqliteDb = null;
const isLocal = config.database.useLocal;

if (!isLocal) {
  console.log('Database Client: Using PostgreSQL (Production Mode)');
  pgPool = new Pool({
    connectionString: config.database.postgresUrl,
    ssl: config.database.postgresUrl.includes('sslmode=require') 
      ? { rejectUnauthorized: false } 
      : false
  });
  
  // Handle unexpected errors on idle pool clients to prevent server crashes
  pgPool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });
} else {
  console.log(`Database Client: Using SQLite fallback at ${config.database.sqlitePath} (Local Mode)`);
  sqliteDb = new sqlite3.Database(config.database.sqlitePath);
}

/**
 * Execute a query with parameters
 * Converts PostgreSQL $1, $2 placeholders to SQLite ? placeholders if running locally
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!isLocal) {
      pgPool.query(sql, params)
        .then(res => resolve(res.rows))
        .catch(err => reject(err));
    } else {
      // SQLite uses '?' instead of '$1', '$2'
      const sqliteSql = sql.replace(/\$\d+/g, '?');
      
      sqliteDb.all(sqliteSql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }
  });
}

/**
 * Initialize Database Schemas
 */
async function initDb() {
  const usersTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id ${isLocal ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'SERIAL PRIMARY KEY'},
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const filesTableSql = `
    CREATE TABLE IF NOT EXISTS files (
      id VARCHAR(255) PRIMARY KEY,
      user_id INTEGER NOT NULL,
      filename VARCHAR(255) NOT NULL,
      file_key VARCHAR(255) NOT NULL,
      file_size BIGINT NOT NULL,
      mime_type VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending',
      share_token VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      one_time_download BOOLEAN DEFAULT FALSE,
      password_hash VARCHAR(255) DEFAULT NULL,
      download_count INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  try {
    await query(usersTableSql);
    await query(filesTableSql);

    // Apply incremental migrations for existing tables
    await addColumnIfMissing('files', 'one_time_download', 'BOOLEAN', 'FALSE');
    await addColumnIfMissing('files', 'password_hash', 'VARCHAR(255)', 'NULL');
    await addColumnIfMissing('files', 'download_count', 'INTEGER', '0');

    console.log('Database tables verified/initialized.');
  } catch (err) {
    console.error('Error initializing database tables:', err);
    process.exit(1);
  }
}

/**
 * Migration helper to alter tables and catch duplicate column errors
 */
async function addColumnIfMissing(table, column, type, defaultValue) {
  try {
    await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type} DEFAULT ${defaultValue}`);
    console.log(`Database Migration: Added column '${column}' to table '${table}'`);
  } catch (err) {
    // Suppress errors since the column already exists in normal subsequent runs
  }
}

module.exports = {
  query,
  initDb,
  isLocal
};
