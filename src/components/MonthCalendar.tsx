import { getMonthDays } from '../utils/date'
import { getDayStatus, isDayEditable, type DisplayStatus } from '../utils/attendance'
import type { DayRecord } from '../types/attendance'

interface MonthCalendarProps {
  year: number
  month: number
  records: Record<string, DayRecord>
  onDayClick?: (date: Date, status: DisplayStatus) => void
}

const STATUS_COLORS: Record<string, string> = {
  normal: 'bg-emerald-500',
  missed: 'bg-red-500',
  makeup: 'bg-amber-400',
  rest: 'bg-slate-200',
  pending: 'bg-slate-100 ring-1 ring-slate-200',
}

export function MonthCalendar({ year, month, records, onDayClick }: MonthCalendarProps) {
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
          const editable = isDayEditable(date)
          const filled = status === 'normal' || status === 'missed' || status === 'makeup'

          return (
            <div key={date.getDate()} className="flex flex-col items-center gap-0.5">
              <button
                type="button"
                disabled={!editable}
                onClick={() => editable && onDayClick?.(date, status)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${STATUS_COLORS[status]} ${filled ? 'text-white' : 'text-slate-500'} ${editable ? 'cursor-pointer active:scale-95' : 'cursor-default opacity-80'}`}
              >
                {date.getDate()}
              </button>
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
      {onDayClick && (
        <p className="mt-2 text-xs text-slate-400">点击工作日可修改状态</p>
      )}
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
