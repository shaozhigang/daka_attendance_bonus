import type { DayRecord, DayStatus } from '../types/attendance'
import { formatDateKey, isWeekday } from './date'

export type DisplayStatus = DayStatus | 'pending'

export function getDayStatus(date: Date, records: Record<string, DayRecord>): DisplayStatus {
  if (!isWeekday(date)) return 'rest'
  const key = formatDateKey(date)
  const r = records[key]
  if (!r) {
    const todayKey = formatDateKey()
    if (key > todayKey) return 'rest'
    return 'pending'
  }
  if (r.manualOverride || r.status === 'rest' || r.status === 'makeup' || r.status === 'missed') {
    return r.status
  }
  if (r.clockIn?.confirmed && r.clockOut?.confirmed) return 'normal'
  if (key === formatDateKey()) return 'pending'
  return 'missed'
}

export function isDayEditable(date: Date): boolean {
  if (!isWeekday(date)) return false
  const todayKey = formatDateKey()
  const key = formatDateKey(date)
  return key <= todayKey
}

export function resolveDayStatus(record: DayRecord): DayStatus {
  if (record.manualOverride) return record.status
  if (record.status === 'rest' || record.status === 'makeup') return record.status
  const inOk = record.clockIn?.confirmed
  const outOk = record.clockOut?.confirmed
  if (inOk && outOk) return 'normal'
  return record.status === 'missed' ? 'missed' : 'normal'
}
