import { getMonthDays, isWeekday, formatDateKey } from '../utils/date'
import type { DayRecord } from '../types/attendance'

interface MonthCalendarProps {
  year: number
  month: number
  records: Record<string, DayRecord>
}

const STATUS_COLORS: Record<string, string> = {
  normal: 'bg-emerald-500',
  missed: 'bg-red-500',
  makeup: 'bg-amber-400',
  rest: 'bg-slate-200',
  pending: 'bg-slate-100 ring-1 ring-slate-200',
}

function getDayStatus(date: Date, records: Record<string, DayRecord>): string {
  if (!isWeekday(date)) return 'rest'
  const key = formatDateKey(date)
  const r = records[key]
  if (!r) {
    const todayKey = formatDateKey()
    if (key > todayKey) return 'rest'
    return 'pending'
  }
  if (r.status === 'rest') return 'rest'
  if (r.status === 'makeup') return 'makeup'
  if (r.status === 'missed') return 'missed'
  if (r.clockIn?.confirmed && r.clockOut?.confirmed) return 'normal'
  if (key === formatDateKey()) return 'pending'
  return 'missed'
}

export function MonthCalendar({ year, month, records }: MonthCalendarProps) {
  const days = getMonthDays(year, month)
  const firstDow = new Date(year, month, 1).getDay()
  const blanks = Array.from({ length: firstDow })

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.map((date) => {
          const status = getDayStatus(date, records)
          return (
            <div key={date.getDate()} className="flex flex-col items-center gap-0.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${STATUS_COLORS[status]} ${status === 'normal' || status === 'missed' || status === 'makeup' ? 'text-white' : 'text-slate-500'}`}
              >
                {date.getDate()}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <Legend color="bg-emerald-500" label="正常" />
        <Legend color="bg-amber-400" label="补卡" />
        <Legend color="bg-red-500" label="漏打" />
        <Legend color="bg-slate-200" label="休息" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-3 w-3 rounded ${color}`} />
      {label}
    </span>
  )
}
