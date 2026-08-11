import { db } from '../client';
import { trayRecords } from '../schema';
import { eq, desc, isNull } from 'drizzle-orm';
import type { TrayRecord } from '../schema';

export async function getCurrentTrayRecord() {
  const result = await db
    .select()
    .from(trayRecords)
    .where(isNull(trayRecords.endDate))
    .orderBy(desc(trayRecords.trayNumber))
    .limit(1);
  return result[0] ?? null;
}

export async function getTrayRecordByNumber(trayNumber: number) {
  const result = await db
    .select()
    .from(trayRecords)
    .where(eq(trayRecords.trayNumber, trayNumber))
    .limit(1);
  return result[0] ?? null;
}

export async function getAllTrayRecords() {
  return await db
    .select()
    .from(trayRecords)
    .orderBy(trayRecords.trayNumber);
}

export async function closeTrayRecord(trayNumber: number, endDate: Date) {
  await db
    .update(trayRecords)
    .set({ endDate })
    .where(eq(trayRecords.trayNumber, trayNumber));
}

export async function createTrayRecord(trayNumber: number, startDate: Date) {
  await db.insert(trayRecords).values({
    trayNumber,
    startDate,
    endDate: null,
    skipped: false,
    createdAt: new Date(),
  });
}

export async function advanceToTray(newTrayNumber: number) {
  // Close the current tray record
  const current = await getCurrentTrayRecord();
  if (current) {
    await closeTrayRecord(current.trayNumber, new Date());
  }
  // Create new tray record
  await createTrayRecord(newTrayNumber, new Date());
}