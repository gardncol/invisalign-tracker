export type EventType = 'in' | 'out' | 'tray_change';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: number;
  totalTrays: number;
  changeFrequencyDays: number;
  currentTray: number;
  dailyGoalHours: number;
  awakeStart: string;  // "HH:mm"
  awakeEnd: string;    // "HH:mm"
  trayChangeTime: string;
  trayChangeDay: number; // -1 = no specific day, 0-6 = Sun-Sat
  notificationsEnabled: boolean;
  alarmsEnabled: boolean;
  alarmThresholdMinutes: number;
  escalationEnabled: boolean;
  themePreference: ThemePreference;
  isOnboarded: boolean;
}

export interface TrayEvent {
  id: number;
  type: EventType;
  timestamp: Date;
  trayNumber: number | null;
  createdAt: Date;
  modifiedAt: Date;
  isEdited: boolean;
}

export interface DaySummary {
  date: Date;
  totalWornHours: number;
  goalHours: number;
  metGoal: boolean;
  events: TrayEvent[];
}

export interface WeekSummary {
  weekStart: Date;
  weekEnd: Date;
  avgHoursPerDay: number;
  goalHours: number;
  compliancePct: number;
  daysMetGoal: number;
  totalDays: number;
}

export interface OnboardingData {
  totalTrays: number;
  changeFrequencyDays: number;
  currentTray: number;
  dailyGoalHours: number;
}

export type CurrentTrayState = 'in' | 'out' | 'unknown';