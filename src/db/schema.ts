import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  totalTrays: integer('total_trays').notNull(),
  changeFrequencyDays: integer('change_frequency_days').notNull(),
  currentTray: integer('current_tray').notNull().default(1),
  dailyGoalHours: real('daily_goal_hours').notNull().default(22),
  awakeStart: text('awake_start').notNull().default('07:00'),
  awakeEnd: text('awake_end').notNull().default('22:00'),
  trayChangeTime: text('tray_change_time').notNull().default('22:00'),
  trayChangeDay: integer('tray_change_day').notNull().default(-1), // -1 = no specific day, 0-6 = Sun-Sat
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
  alarmsEnabled: integer('alarms_enabled', { mode: 'boolean' }).notNull().default(true),
  alarmThresholdMinutes: integer('alarm_threshold_minutes').notNull().default(45),
  escalationEnabled: integer('escalation_enabled', { mode: 'boolean' }).notNull().default(true),
  themePreference: text('theme_preference').notNull().default('system'), // 'light' | 'dark' | 'system'
  isOnboarded: integer('is_onboarded', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // 'in' | 'out' | 'tray_change'
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  trayNumber: integer('tray_number'), // null for in/out, set for tray_change
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  modifiedAt: integer('modified_at', { mode: 'timestamp' }).notNull(),
  isEdited: integer('is_edited', { mode: 'boolean' }).notNull().default(false),
});

export const trayRecords = sqliteTable('tray_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trayNumber: integer('tray_number').notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  skipped: integer('skipped', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type TrayRecord = typeof trayRecords.$inferSelect;
export type NewTrayRecord = typeof trayRecords.$inferInsert;

// Re-export with app-level names to avoid collision with DOM Event type
export type UserRow = User;
export type EventRow = Event;
export type TrayRecordRow = TrayRecord;