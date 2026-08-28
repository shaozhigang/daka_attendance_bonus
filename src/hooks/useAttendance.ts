import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DayRecord, Settings } from '../types/attendance'
import {
  countWorkdaysInMonth,
  formatDateKey,
  isWeekday,
  loadRecords,
  loadSettings,
  saveRecords,
  saveSettings,
} from '../utils/date'

function deriveStatus(record: DayRecord): DayRecord['status'] {
  if (record.status === 'rest' || record.status === 'makeup') return record.status
  const inOk = record.clockIn?.confirmed
  const outOk = record.clockOut?.confirmed
  if (inOk && outOk) return 'normal'
  return record.status === 'missed' ? 'missed' : 'normal'
}

export function useAttendance() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const [records, setRecordsState] = useState<Record<string, DayRecord>>(loadRecords)
  const todayKey = formatDateKey()

  const todayRecord = useMemo(() => {
    const existing = records[todayKey]
    if (existing) return { ...existing, status: deriveStatus(existing) }
    return {
      date: todayKey,
      status: isWeekday(new Date()) ? ('normal' as const) : ('rest' as const),
    }
  }, [records, todayKey])

  const persistRecords = useCallback((next: Record<string, DayRecord>) => {
    setRecordsState(next)
    saveRecords(next)
  }, [])

  const confirmClock = useCallback(
    (type: 'clockIn' | 'clockOut') => {
      const now = new Date().toISOString()
      const current = records[todayKey] ?? {
        date: todayKey,
        status: 'normal' as const,
      }
      const updated: DayRecord = {
        ...current,
        [type]: { confirmed: true, confirmedAt: now },
        status: 'normal',
      }
      persistRecords({ ...records, [todayKey]: updated })
    },
    [records, todayKey, persistRecords],
  )

  const markRest = useCallback(() => {
    persistRecords({
      ...records,
      [todayKey]: { date: todayKey, status: 'rest' },
    })
  }, [records, todayKey, persistRecords])

  const markMissed = useCallback(() => {
    const current = records[todayKey] ?? { date: todayKey, status: 'normal' as const }
    persistRecords({
      ...records,
      [todayKey]: { ...current, status: 'missed' },
    })
  }, [records, todayKey, persistRecords])

  const setSettings = useCallback((next: Settings) => {
    setSettingsState(next)
    saveSettings(next)
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const workdays = countWorkdaysInMonth(year, month)

    let fullDays = 0
    let makeupDays = 0
    let missedDays = 0

    Object.values(records).forEach((r) => {
      const d = new Date(r.date)
      if (d.getFullYear() !== year || d.getMonth() !== month) return
      if (!isWeekday(d)) return
      if (r.status === 'rest') return
      if (r.status === 'makeup') makeupDays++
      else if (r.status === 'missed') missedDays++
      else if (r.clockIn?.confirmed && r.clockOut?.confirmed) fullDays++
    })

    const securedBonus = Math.round((fullDays / Math.max(workdays, 1)) * settings.bonusAmount)
    return { workdays, fullDays, makeupDays, missedDays, securedBonus }
  }, [records, settings.bonusAmount])

  const streak = useMemo(() => {
    let count = 0
    const cursor = new Date()
    while (count < 365) {
      if (!isWeekday(cursor)) {
        cursor.setDate(cursor.getDate() - 1)
        continue
      }
      const key = formatDateKey(cursor)
      const r = records[key]
      if (!r || r.status === 'rest') break
      if (r.status === 'missed' || !r.clockIn?.confirmed || !r.clockOut?.confirmed) break
      count++
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }, [records])

  // Auto-mark missed at 22:05 if audit enabled and not fully confirmed
  useEffect(() => {
    const check = () => {
      const now = new Date()
      if (!isWeekday(now)) return
      const h = now.getHours()
      const m = now.getMinutes()
      if (h !== 22 || m > 10) return

      const key = formatDateKey(now)
      const r = records[key]
      if (!r || r.status === 'rest') return
      const complete = r.clockIn?.confirmed && r.clockOut?.confirmed
      if (!complete && r.status !== 'missed') {
        persistRecords({
          ...records,
          [key]: { ...r, status: 'missed' },
        })
      }
    }
    const id = setInterval(check, 60_000)
    check()
    return () => clearInterval(id)
  }, [records, persistRecords])

  return {
    settings,
    setSettings,
    records,
    todayRecord,
    todayKey,
    confirmClock,
    markRest,
    markMissed,
    stats,
    streak,
  }
}
