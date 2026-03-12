import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../data/tracker.db');

export const db = new sqlite3.Database(DB_PATH);

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Applications table
      db.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT DEFAULT 'applied',
          applied_date TEXT NOT NULL,
          deadline TEXT,
          notes TEXT,
          resume_version TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Jobs table (from scraping)
      db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT,
          url TEXT UNIQUE,
          source TEXT,
          posted_date TEXT,
          salary TEXT,
          description TEXT,
          keywords TEXT,
          seen INTEGER DEFAULT 0,
          match_score INTEGER DEFAULT NULL,
          matched_skills INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Resume versions
      db.run(`
        CREATE TABLE IF NOT EXISTS resume_versions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add columns to jobs table if they don't exist (migration)
      db.run(`PRAGMA table_info(jobs)`, (err, columns) => {
        if (!err && columns) {
          const columnNames = columns.map(c => c.name);
          
          if (!columnNames.includes('match_score')) {
            db.run(`ALTER TABLE jobs ADD COLUMN match_score INTEGER DEFAULT NULL`);
          }
          if (!columnNames.includes('matched_skills')) {
            db.run(`ALTER TABLE jobs ADD COLUMN matched_skills INTEGER DEFAULT 0`, (err) => {
              if (err) reject(err);
              else resolve();
            });
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    });
  });
}

export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
