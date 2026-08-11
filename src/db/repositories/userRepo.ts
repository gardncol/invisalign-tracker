import { db } from '../client';
import { users, trayRecords } from '../schema';
import { eq } from 'drizzle-orm';
import type { OnboardingData, UserProfile } from '../../types';

function toUserProfile(row: typeof users.$inferSelect): UserProfile {
  return {
    id: row.id,
    totalTrays: row.totalTrays,
    changeFrequencyDays: row.changeFrequencyDays,
    currentTray: row.currentTray,
    dailyGoalHours: row.dailyGoalHours,
    awakeStart: row.awakeStart,
    awakeEnd: row.awakeEnd,
    trayChangeTime: row.trayChangeTime,
    trayChangeDay: row.trayChangeDay,
    notificationsEnabled: row.notificationsEnabled,
    alarmsEnabled: row.alarmsEnabled,
    alarmThresholdMinutes: row.alarmThresholdMinutes,
    escalationEnabled: row.escalationEnabled,
    themePreference: (row.themePreference as UserProfile['themePreference']) ?? 'system',
    isOnboarded: row.isOnboarded,
  };
}

export async function createUserFromOnboarding(data: OnboardingData): Promise<UserProfile> {
  const now = new Date();
  await db.insert(users).values({
    totalTrays: data.totalTrays,
    changeFrequencyDays: data.changeFrequencyDays,
    currentTray: data.currentTray,
    dailyGoalHours: data.dailyGoalHours,
    awakeStart: '07:00',
    awakeEnd: '22:00',
    trayChangeTime: '22:00',
    trayChangeDay: -1,
    notificationsEnabled: true,
    alarmsEnabled: true,
    alarmThresholdMinutes: 45,
    escalationEnabled: true,
    themePreference: 'system',
    isOnboarded: true,
    createdAt: now,
    updatedAt: now,
  });

  // Also create initial tray record for current tray
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (data.currentTray - 1) * data.changeFrequencyDays);
  await db.insert(trayRecords).values({
    trayNumber: data.currentTray,
    startDate: startDate,
    endDate: null,
    skipped: false,
    createdAt: now,
  });

  return (await getUser())!;
}

export async function getUser(): Promise<UserProfile | null> {
  const result = await db.select().from(users).limit(1);
  if (result.length === 0) return null;
  return toUserProfile(result[0]);
}

export async function updateUser(updates: Partial<UserProfile>): Promise<void> {
  await db
    .update(users)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, 1)); // Single-user app, always ID 1
}

export async function isOnboarded(): Promise<boolean> {
  const user = await getUser();
  return user?.isOnboarded ?? false;
}