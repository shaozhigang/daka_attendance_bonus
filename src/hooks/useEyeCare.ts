import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EyeCareSettings, EyeCareState } from '../types/eyeCare'
import { formatDateKey, loadSettings } from '../utils/date'
import {
  EYE_CARE_NOTIFICATIONS,
  estimateDailyTarget,
  formatCountdown,
  getTodayLog,
  isBreakDue,
  isEyeCarePaused,
  isEyeCareQuietNow,
  loadEyeCareSettings,
  loadEyeCareState,
  msUntilNextBreak,
  saveEyeCareSettings,
  saveEyeCareState,
} from '../utils/eyeCare'

const UI_TICK_MS = 1_000
const NOTIFY_TICK_MS = 15_000

export function useEyeCare() {
  const { clockInTime, clockOutTime } = loadSettings()
  const [settings, setSettingsState] = useState<EyeCareSettings>(loadEyeCareSettings)
  const [state, setStateState] = useState<EyeCareState>(loadEyeCareState)
  const [now, setNow] = useState(() => new Date())

  const persistState = useCallback((next: EyeCareState) => {
    setStateState(next)
    saveEyeCareState(next)
  }, [])

  const setSettings = useCallback((next: EyeCareSettings) => {
    setSettingsState(next)
    saveEyeCareSettings(next)
  }, [])

  const todayKey = formatDateKey(now)
  const todayLog = getTodayLog(state, todayKey)
  const paused = isEyeCarePaused(state, now)
  const quiet = isEyeCareQuietNow(settings, clockOutTime, now)

  const targetToday = useMemo(
    () =>
      estimateDailyTarget(
        settings.intervalMinutes,
        clockInTime,
        clockOutTime,
        settings.quietHours.lunchStart,
        settings.quietHours.lunchEnd,
      ),
    [settings, clockInTime, clockOutTime],
  )

  const msUntilNext = msUntilNextBreak(settings, state, clockOutTime, now)
  const countdown = formatCountdown(msUntilNext)
  const due = isBreakDue(settings, state, clockOutTime, now)

  const confirmBreak = useCallback(() => {
    const dateKey = formatDateKey()
    const log = getTodayLog(state, dateKey)
    persistState({
      ...state,
      lastBreakAt: new Date().toISOString(),
      pendingReminderAt: undefined,
      escalationLevel: 0,
      dailyLogs: {
        ...state.dailyLogs,
        [dateKey]: { date: dateKey, microCompleted: log.microCompleted + 1 },
      },
    })
  }, [persistState, state])

  const pauseForMinutes = useCallback(
    (minutes: number) => {
      const pauseUntil = new Date(Date.now() + minutes * 60_000).toISOString()
      persistState({
        ...state,
        pauseUntil,
        pausedDate: undefined,
        pendingReminderAt: undefined,
        escalationLevel: 0,
      })
    },
    [persistState, state],
  )

  const pauseUntilTomorrow = useCallback(() => {
    persistState({
      ...state,
      pauseUntil: undefined,
      pausedDate: formatDateKey(),
      pendingReminderAt: undefined,
      escalationLevel: 0,
    })
  }, [persistState, state])

  const resumeEarly = useCallback(() => {
    persistState({
      ...state,
      pauseUntil: undefined,
      pausedDate: undefined,
      lastBreakAt: new Date().toISOString(),
      pendingReminderAt: undefined,
      escalationLevel: 0,
    })
  }, [persistState, state])

  const sendEyeNotification = useCallback((title: string, body: string, urgent = false) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    new Notification(title, { body, icon: '/icons/icon.svg', tag: urgent ? 'eye-care-urgent' : 'eye-care' })
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), UI_TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!settings.enabled || paused || quiet) return

    const tick = () => {
      const current = new Date()
      if (!isBreakDue(settings, state, clockOutTime, current)) {
        if (state.pendingReminderAt) {
          const pendingMs = current.getTime() - new Date(state.pendingReminderAt).getTime()
          let nextLevel = state.escalationLevel
          let nextState = state

          if (pendingMs >= 5 * 60_000 && state.escalationLevel < 2) {
            sendEyeNotification(
              EYE_CARE_NOTIFICATIONS.escalation2.title,
              EYE_CARE_NOTIFICATIONS.escalation2.body,
              true,
            )
            nextLevel = 2
            nextState = { ...state, escalationLevel: 2 }
          } else if (pendingMs >= 2 * 60_000 && state.escalationLevel < 1) {
            sendEyeNotification(
              EYE_CARE_NOTIFICATIONS.escalation1.title,
              EYE_CARE_NOTIFICATIONS.escalation1.body,
            )
            nextLevel = 1
            nextState = { ...state, escalationLevel: 1 }
          }

          if (nextLevel !== state.escalationLevel) persistState(nextState)
        }
        return
      }

      if (state.pendingReminderAt) return

      sendEyeNotification(
        EYE_CARE_NOTIFICATIONS.primary.title,
        EYE_CARE_NOTIFICATIONS.primary.body,
      )
      persistState({
        ...state,
        pendingReminderAt: current.toISOString(),
        escalationLevel: 0,
      })
    }

    tick()
    const id = setInterval(tick, NOTIFY_TICK_MS)
    return () => clearInterval(id)
  }, [settings, state, clockOutTime, paused, quiet, persistState, sendEyeNotification])

  return {
    settings,
    setSettings,
    completedToday: todayLog.microCompleted,
    targetToday,
    countdown,
    msUntilNext,
    due,
    paused,
    quiet,
    confirmBreak,
    pauseForMinutes,
    pauseUntilTomorrow,
    resumeEarly,
  }
}
