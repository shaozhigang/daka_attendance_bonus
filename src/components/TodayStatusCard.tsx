import { formatTime } from '../utils/date'
import type { DayRecord } from '../types/attendance'

interface TodayStatusCardProps {
  label: string
  targetTime: string
  record?: DayRecord['clockIn']
  onConfirm: () => void
  disabled?: boolean
}

export function TodayStatusCard({
  label,
  targetTime,
  record,
  onConfirm,
  disabled,
}: TodayStatusCardProps) {
  const confirmed = record?.confirmed

  return (
    <div className="flex flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{targetTime}</p>
      <p className={`mt-2 text-sm font-medium ${confirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
        {confirmed ? `✅ 已确认 ${formatTime(record?.confirmedAt)}` : '⏳ 待确认'}
      </p>
      {!confirmed && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className="mt-3 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white active:bg-emerald-600 disabled:opacity-50"
        >
          我已{label}
        </button>
      )}
    </div>
  )
}
