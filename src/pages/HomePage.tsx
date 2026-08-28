import { BonusProgress } from '../components/BonusProgress'
import { NotificationBanner } from '../components/NotificationBanner'
import { StreakBadge } from '../components/StreakBadge'
import { TodayStatusCard } from '../components/TodayStatusCard'
import { useAttendance } from '../hooks/useAttendance'
import { useNotifications } from '../hooks/useNotifications'
import { formatDisplayDate, getUpcomingReminders } from '../utils/date'

export function HomePage() {
  const { settings, todayRecord, confirmClock, markRest, stats, streak } = useAttendance()
  const { permission, requestPermission } = useNotifications(settings.reminderEnabled)
  const upcoming = getUpcomingReminders()
  const isRest = todayRecord.status === 'rest'

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-emerald-800">全勤守护</h1>
          <p className="text-sm text-slate-500">{formatDisplayDate(new Date())}</p>
        </div>
        <StreakBadge days={streak} />
      </header>

      <NotificationBanner permission={permission} onRequest={requestPermission} />

      <BonusProgress
        secured={stats.securedBonus}
        total={settings.bonusAmount}
        fullDays={stats.fullDays}
        workdays={stats.workdays}
      />

      {isRest ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-emerald-100">
          <p className="text-slate-500">今日休息，无需打卡 🎉</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <TodayStatusCard
            label="上班打卡"
            targetTime={settings.clockInTime}
            record={todayRecord.clockIn}
            onConfirm={() => confirmClock('clockIn')}
          />
          <TodayStatusCard
            label="下班打卡"
            targetTime={settings.clockOutTime}
            record={todayRecord.clockOut}
            onConfirm={() => confirmClock('clockOut')}
          />
        </div>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
        <h2 className="mb-2 text-sm font-medium text-slate-700">📋 今日待提醒</h2>
        {upcoming.length === 0 ? (
          <p className="text-xs text-slate-400">今日提醒已全部触发</p>
        ) : (
          <ul className="space-y-1">
            {upcoming.map((item) => (
              <li key={item.time} className="text-xs text-slate-500">
                · {item.time} {item.slot}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isRest && (
        <button
          type="button"
          onClick={markRest}
          className="w-full rounded-xl py-2 text-xs text-slate-400 underline"
        >
          今天请假/休息，标记跳过
        </button>
      )}

      <p className="text-center text-xs text-slate-400">
        打完企业微信后，记得点「我已打卡」确认
      </p>
    </div>
  )
}
