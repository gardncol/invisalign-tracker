export const APP_NAME = 'Tray Tracker';

export const DEFAULT_GOAL_HOURS = 22;
export const MIN_GOAL_HOURS = 18;
export const MAX_GOAL_HOURS = 22;

export const DEFAULT_AWAKE_START = '07:00';
export const DEFAULT_AWAKE_END = '22:00';
export const DEFAULT_TRAY_CHANGE_TIME = '22:00';
export const DEFAULT_ALARM_THRESHOLD_MIN = 45;

export const COMMON_CHANGE_FREQUENCIES = [7, 10, 14];

export const NOTIFICATION_IDS = {
  TRAY_CHANGE: 'tray-change-reminder',
  ALARM_THRESHOLD: 'put-back-in-alarm',
  ALARM_ESCALATION: 'alarm-escalation',
  ALARM_GOAL_RISK: 'alarm-goal-risk',
  OVERNIGHT_PROMPT: 'overnight-prompt',
} as const;

export const STORAGE_KEYS = {
  IS_ONBOARDED: 'is_onboarded',
} as const;