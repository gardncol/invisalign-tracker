import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { sql } from 'drizzle-orm';
import { users, events, trayRecords } from './schema';

const expo = openDatabaseSync('invisalign-tracker.db');
export const db = drizzle(expo, { schema: { users, events, trayRecords } });

export async function initializeDatabase() {
  // Create tables with the full schema (IF NOT EXISTS)
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_trays INTEGER NOT NULL,
      change_frequency_days INTEGER NOT NULL,
      current_tray INTEGER NOT NULL DEFAULT 1,
      daily_goal_hours REAL NOT NULL DEFAULT 22,
      awake_start TEXT NOT NULL DEFAULT '07:00',
      awake_end TEXT NOT NULL DEFAULT '22:00',
      tray_change_time TEXT NOT NULL DEFAULT '22:00',
      tray_change_day INTEGER NOT NULL DEFAULT -1,
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      alarms_enabled INTEGER NOT NULL DEFAULT 1,
      alarm_threshold_minutes INTEGER NOT NULL DEFAULT 45,
      escalation_enabled INTEGER NOT NULL DEFAULT 1,
      theme_preference TEXT NOT NULL DEFAULT 'system',
      is_onboarded INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      tray_number INTEGER,
      created_at INTEGER NOT NULL,
      modified_at INTEGER NOT NULL,
      is_edited INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS tray_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tray_number INTEGER NOT NULL,
      start_date INTEGER NOT NULL,
      end_date INTEGER,
      skipped INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)
  `);
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)
  `);
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_tray_records_number ON tray_records(tray_number)
  `);

  // Migration: add new columns if they don't exist (for upgrades from v1.0)
  await migrateColumn('users', 'tray_change_day', 'INTEGER NOT NULL DEFAULT -1');
  await migrateColumn('users', 'alarms_enabled', 'INTEGER NOT NULL DEFAULT 1');
  await migrateColumn('users', 'theme_preference', "TEXT NOT NULL DEFAULT 'system'");
}

async function migrateColumn(table: string, column: string, definition: string) {
  try {
    await db.run(sql`ALTER TABLE ${sql.raw(table)} ADD COLUMN ${sql.raw(column)} ${sql.raw(definition)}`);
  } catch {
    // Column already exists — ignore
  }
}