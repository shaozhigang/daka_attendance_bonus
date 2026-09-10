import {
  DEFAULT_EYE_CARE_SETTINGS,
  DEFAULT_EYE_CARE_STATE,
  type EyeCareDailyLog,
  type EyeCareSettings,
  type EyeCareState,
} from '../types/eyeCare'
import { compareTime, formatDateKey, isWeekday } from './date'

const SETTINGS_KEY = 'daka-eye-care-settings'
const STATE_KEY = 'daka-eye-care-state'

export function loadEyeCareSettings(): EyeCareSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_EYE_CARE_SETTINGS
    const parsed = JSON.parse(raw) as Partial<EyeCareSettings>
    return {
      ...DEFAULT_EYE_CARE_SETTINGS,
      ...parsed,
      quietHours: {
        ...DEFAULT_EYE_CARE_SETTINGS.quietHours,
        ...parsed.quietHours,
      },
    }
  } catch {
    return DEFAULT_EYE_CARE_SETTINGS
  }
}

export function saveEyeCareSettings(settings: EyeCareSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadEyeCareState(): EyeCareState {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return { ...DEFAULT_EYE_CARE_STATE, lastBreakAt: new Date().toISOString() }
    const parsed = JSON.parse(raw) as EyeCareState
    return {
      ...DEFAULT_EYE_CARE_STATE,
      ...parsed,
      dailyLogs: parsed.dailyLogs ?? {},
    }
  } catch {
    return { ...DEFAULT_EYE_CARE_STATE, lastBreakAt: new Date().toISOString() }
  }
}

export function saveEyeCareState(state: EyeCareState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
}

export function formatTimeFromDate(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

export function isEyeCarePaused(state: EyeCareState, now: Date = new Date()): boolean {
  const dateKey = formatDateKey(now)
  if (state.pausedDate === dateKey) return true
  if (state.pauseUntil && new Date(state.pauseUntil) > now) return true
  return false
}

export function isEyeCareQuietNow(
  settings: EyeCareSettings,
  clockOutTime: string,
  now: Date = new Date(),
): boolean {
  const { quietHours } = settings
  if (quietHours.weekendsOff && !isWeekday(now)) return true

  const time = formatTimeFromDate(now)
  if (compareTime(time, quietHours.lunchStart) >= 0 && compareTime(time, quietHours.lunchEnd) < 0) {
    return true
  }
  if (quietHours.afterWorkStop && compareTime(time, clockOutTime) >= 0) return true
  return false
}

export function estimateDailyTarget(
  intervalMinutes: number,
  clockInTime: string,
  clockOutTime: string,
  lunchStart: string,
  lunchEnd: string,
): number {
  const morning = Math.max(0, minutesBetween(clockInTime, lunchStart))
  const afternoon = Math.max(0, minutesBetween(lunchEnd, clockOutTime))
  return Math.floor((morning + afternoon) / intervalMinutes)
}

export function getTodayLog(state: EyeCareState, dateKey: string = formatDateKey()): EyeCareDailyLog {
  return state.dailyLogs[dateKey] ?? { date: dateKey, microCompleted: 0 }
}

export function msUntilNextBreak(
  settings: EyeCareSettings,
  state: EyeCareState,
  clockOutTime: string,
  now: Date = new Date(),
): number | null {
  if (!settings.enabled || isEyeCarePaused(state, now) || isEyeCareQuietNow(settings, clockOutTime, now)) {
    return null
  }
  const last = new Date(state.lastBreakAt).getTime()
  const due = last + settings.intervalMinutes * 60_000
  return Math.max(0, due - now.getTime())
}

export function isBreakDue(
  settings: EyeCareSettings,
  state: EyeCareState,
  clockOutTime: string,
  now: Date = new Date(),
): boolean {
  const remaining = msUntilNextBreak(settings, state, clockOutTime, now)
  return remaining !== null && remaining <= 0
}

export function formatCountdown(ms: number | null): string {
  if (ms === null) return '—'
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  if (min <= 0) return `${sec} 秒`
  return `${min} 分 ${sec} 秒`
}

export const EYE_CARE_NOTIFICATIONS = {
  primary: {
    title: '👁️ 该让眼睛歇一下了',
    body: '看看 6 米外的物体，眨眼 10 次，约 20 秒',
  },
  escalation1: {
    title: '👁️ 还在忙吗？',
    body: '20 秒远眺即可，眼睛会感谢你',
  },
  escalation2: {
    title: '⚠️ 用眼超时',
    body: '已连续盯屏较久，请至少休息 1 分钟',
  },
} as const
