import { useCallback, useEffect, useState } from 'react'
import { REMINDER_SLOTS } from '../types/attendance'
import { compareTime, formatDateKey, isWeekday } from '../utils/date'

export function useNotifications(enabled: boolean) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false
    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }, [])

  const sendNotification = useCallback((title: string, body: string) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    new Notification(title, { body, icon: '/icons/icon.svg' })
  }, [])

  useEffect(() => {
    if (!enabled || permission !== 'granted') return

    const firedKey = 'daka-reminder-fired'
    const getFired = (): Record<string, boolean> => {
      try {
        return JSON.parse(localStorage.getItem(firedKey) ?? '{}')
      } catch {
        return {}
      }
    }

    const tick = () => {
      const now = new Date()
      if (!isWeekday(now)) return

      const dateKey = formatDateKey(now)
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const fired = getFired()

      for (const slot of REMINDER_SLOTS) {
        const fireId = `${dateKey}-${slot.id}`
        if (fired[fireId]) continue
        if (compareTime(time, slot.time) >= 0 && compareTime(time, addMinutes(slot.time, 2)) < 0) {
          sendNotification(
            slot.urgent ? '⚠️ 打卡提醒' : '⏰ 打卡提醒',
            slot.label,
          )
          fired[fireId] = true
          localStorage.setItem(firedKey, JSON.stringify(fired))
        }
      }
    }

    const id = setInterval(tick, 30_000)
    tick()
    return () => clearInterval(id)
  }, [enabled, permission, sendNotification])

  return { permission, requestPermission, sendNotification }
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
