import { MonthCalendar } from '../components/MonthCalendar'
import { useAttendance } from '../hooks/useAttendance'

export function StatsPage() {
  const { records, stats } = useAttendance()
  const now = new Date()

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-emerald-800">统计</h1>
        <p className="text-sm text-slate-500">
          {now.getFullYear()}年{now.getMonth() + 1}月
        </p>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
        <MonthCalendar year={now.getFullYear()} month={now.getMonth()} records={records} />
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="全勤" value={stats.fullDays} color="text-emerald-600" />
        <StatCard label="补卡" value={stats.makeupDays} color="text-amber-600" />
        <StatCard label="漏打" value={stats.missedDays} color="text-red-600" />
      </section>

      <section className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-emerald-100">
        <p>
          应出勤 <strong>{stats.workdays}</strong> 天，全勤率{' '}
          <strong>
            {stats.workdays > 0 ? Math.round((stats.fullDays / stats.workdays) * 100) : 0}%
          </strong>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          漏打 1 次即失去 ¥1000 全勤奖，务必每天 2 次都确认
        </p>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-emerald-100">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
