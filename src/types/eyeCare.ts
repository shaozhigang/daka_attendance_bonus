export interface EyeCareQuietHours {
  lunchStart: string
  lunchEnd: string
  afterWorkStop: boolean
  weekendsOff: boolean
}

export interface EyeCareSettings {
  enabled: boolean
  intervalMinutes: number
  durationSeconds: number
  quietHours: EyeCareQuietHours
}

export interface EyeCareDailyLog {
  date: string
  microCompleted: number
}

export interface EyeCareState {
  lastBreakAt: string
  pauseUntil?: string
  pausedDate?: string
  pendingReminderAt?: string
  escalationLevel: number
  dailyLogs: Record<string, EyeCareDailyLog>
}

export const DEFAULT_EYE_CARE_SETTINGS: EyeCareSettings = {
  enabled: false,
  intervalMinutes: 20,
  durationSeconds: 20,
  quietHours: {
    lunchStart: '12:00',
    lunchEnd: '13:30',
    afterWorkStop: true,
    weekendsOff: true,
  },
}

export const DEFAULT_EYE_CARE_STATE: EyeCareState = {
  lastBreakAt: new Date().toISOString(),
  escalationLevel: 0,
  dailyLogs: {},
}
