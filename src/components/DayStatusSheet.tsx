import { DAY_STATUS_OPTIONS, type DayStatus } from '../types/attendance'
import type { DisplayStatus } from '../utils/attendance'
import { formatDisplayDate } from '../utils/date'

interface DayStatusSheetProps {
  date: Date
  currentStatus: DisplayStatus
  onSelect: (status: DayStatus) => void
  onClose: () => void
}

export function DayStatusSheet({ date, currentStatus, onSelect, onClose }: DayStatusSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="关闭"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-t-2xl bg-white p-5 pb-8 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-emerald-800">修改打卡状态</h2>
          <p className="text-sm text-slate-500">{formatDisplayDate(date)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {DAY_STATUS_OPTIONS.map((option) => {
            const selected = currentStatus === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left ring-1 transition ${
                  selected
                    ? 'bg-emerald-50 ring-emerald-400'
                    : 'bg-white ring-slate-200 active:bg-slate-50'
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded ${option.color}`} />
                <span className={`text-sm font-medium ${selected ? 'text-emerald-800' : 'text-slate-700'}`}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>

        {currentStatus === 'pending' && (
          <p className="mt-3 text-xs text-amber-600">当前待确认，请选择实际打卡情况</p>
        )}

        <p className="mt-4 text-xs text-slate-400">
          修正仅影响本 App 统计，请以企业微信记录为准
        </p>
      </div>
    </div>
  )
}
