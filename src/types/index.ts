export type EventType = 'in' | 'out' | 'tray_change';

export interface UserProfile {
  id: number;
  totalTrays: number;
  changeFrequencyDays: number;
  currentTray: number;
  dailyGoalHours: number;
  awakeStart: string;  // "HH:mm"
  awakeEnd: string;    // "HH:mm"
  trayChangeTime: string;
  notificationsEnabled: boolean;
  alarmThresholdMinutes: number;
  escalationEnabled: boolean;
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