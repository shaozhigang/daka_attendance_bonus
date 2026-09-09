import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DayRecord, DayStatus, Settings } from '../types/attendance'
import { getDayStatus, resolveDayStatus } from '../utils/attendance'
import {
  countWorkdaysInMonth,
  formatDateKey,
  getMonthDays,
  isWeekday,
  loadRecords,
  loadSettings,
  saveRecords,
  saveSettings,
} from '../utils/date'

export function useAttendance() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const [records, setRecordsState] = useState<Record<string, DayRecord>>(loadRecords)
  const todayKey = formatDateKey()

  const todayRecord = useMemo(() => {
    const existing = records[todayKey]
    if (existing) return { ...existing, status: resolveDayStatus(existing) }
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

  const setDayStatus = useCallback(
    (dateKey: string, status: DayStatus) => {
      const current = records[dateKey] ?? { date: dateKey, status: 'normal' as const }
      const now = new Date().toISOString()

      let updated: DayRecord
      switch (status) {
        case 'normal':
          updated = {
            ...current,
            status: 'normal',
            clockIn: {
              confirmed: true,
              confirmedAt: current.clockIn?.confirmedAt ?? now,
            },
            clockOut: {
              confirmed: true,
              confirmedAt: current.clockOut?.confirmedAt ?? now,
            },
            manualOverride: true,
          }
          break
        case 'makeup':
          updated = { ...current, status: 'makeup', manualOverride: true }
          break
        case 'missed':
          updated = { ...current, status: 'missed', manualOverride: true }
          break
        case 'rest':
          updated = { date: dateKey, status: 'rest', manualOverride: true }
          break
      }

      persistRecords({ ...records, [dateKey]: updated })
    },
    [records, persistRecords],
  )

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

    getMonthDays(year, month).forEach((date) => {
      if (!isWeekday(date)) return
      if (formatDateKey(date) > todayKey) return

      const status = getDayStatus(date, records)
      if (status === 'rest' || status === 'pending') return
      if (status === 'makeup') makeupDays++
      else if (status === 'missed') missedDays++
      else if (status === 'normal') fullDays++
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
      if (!r || r.status === 'rest' || r.manualOverride) return
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
    setDayStatus,
    stats,
    streak,
  }
}
