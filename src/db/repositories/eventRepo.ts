import { db } from '../client';
import { events } from '../schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import type { EventType, TrayEvent } from '../../types';

interface CreateEventInput {
  type: EventType;
  timestamp: Date;
  trayNumber?: number;
}

function toTrayEvent(row: typeof events.$inferSelect): TrayEvent {
  return {
    id: row.id,
    type: row.type as EventType,
    timestamp: row.timestamp,
    trayNumber: row.trayNumber,
    createdAt: row.createdAt,
    modifiedAt: row.modifiedAt,
    isEdited: row.isEdited,
  };
}

export async function createEvent(input: CreateEventInput): Promise<number> {
  const now = new Date();
  const result = await db.insert(events).values({
    type: input.type,
    timestamp: input.timestamp,
    trayNumber: input.trayNumber ?? null,
    createdAt: now,
    modifiedAt: now,
    isEdited: false,
  });
  return result.lastInsertRowId as number;
}

export async function getEventsForDate(date: Date): Promise<TrayEvent[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select()
    .from(events)
    .where(and(gte(events.timestamp, start), lte(events.timestamp, end)))
    .orderBy(events.timestamp);

  return rows.map(toTrayEvent);
}

export async function getEventsInRange(start: Date, end: Date): Promise<TrayEvent[]> {
  const rows = await db
    .select()
    .from(events)
    .where(and(gte(events.timestamp, start), lte(events.timestamp, end)))
    .orderBy(events.timestamp);

  return rows.map(toTrayEvent);
}

export async function getLatestEvent(): Promise<TrayEvent | null> {
  const rows = await db
    .select()
    .from(events)
    .orderBy(desc(events.timestamp))
    .limit(1);
  return rows.length > 0 ? toTrayEvent(rows[0]) : null;
}

export async function updateEventTimestamp(
  eventId: number,
  newTimestamp: Date
): Promise<void> {
  await db
    .update(events)
    .set({
      timestamp: newTimestamp,
      modifiedAt: new Date(),
      isEdited: true,
    })
    .where(eq(events.id, eventId));
}

export async function deleteEvent(eventId: number): Promise<void> {
  await db.delete(events).where(eq(events.id, eventId));
}

export async function getLatestTrayChangeEvent(): Promise<TrayEvent | null> {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.type, 'tray_change'))
    .orderBy(desc(events.timestamp))
    .limit(1);
  return rows.length > 0 ? toTrayEvent(rows[0]) : null;
}