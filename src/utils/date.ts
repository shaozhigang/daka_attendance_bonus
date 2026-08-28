const SETTINGS_KEY = 'daka-settings'
const RECORDS_KEY = 'daka-records'

import { DEFAULT_SETTINGS, type DayRecord, type Settings } from '../types/attendance'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadRecords(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveRecords(records: Record<string, DayRecord>): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

export function formatDisplayDate(date: Date): string {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getMonth() + 1}月${date.getDate()}日 周${weekdays[date.getDay()]}`
}

export function formatTime(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function getMonthDays(year: number, month: number): Date[] {
  const last = new Date(year, month + 1, 0)
  const days: Date[] = []
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  return days
}

export function countWorkdaysInMonth(year: number, month: number): number {
  return getMonthDays(year, month).filter(isWeekday).length
}

export function compareTime(a: string, b: string): number {
  const [ah, am] = a.split(':').map(Number)
  const [bh, bm] = b.split(':').map(Number)
  return ah * 60 + am - (bh * 60 + bm)
}

export function getUpcomingReminders(now: Date = new Date()): Array<{ slot: string; time: string }> {
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const slots = [
    { slot: '18:10 下班第一次提醒', time: '18:10' },
    { slot: '18:25 下班第二次提醒', time: '18:25' },
    { slot: '20:00 下班超时兜底', time: '20:00' },
    { slot: '22:00 今日审计', time: '22:00' },
  ]

  if (compareTime(current, '08:30') < 0) {
    return [
      { slot: '08:30 上班第一次提醒', time: '08:30' },
      { slot: '08:45 上班第二次提醒', time: '08:45' },
      ...slots,
    ]
  }
  if (compareTime(current, '18:10') < 0) {
    return [
      { slot: '08:52 上班超时兜底', time: '08:52' },
      ...slots,
    ]
  }
  return slots.filter((s) => compareTime(current, s.time) < 0)
}
