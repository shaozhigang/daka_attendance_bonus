import { Link } from 'react-router-dom'

interface EyeCareEntryCardProps {
  enabled: boolean
  completedToday: number
  targetToday: number
  countdown: string
  due: boolean
  paused: boolean
  quiet: boolean
}

export function EyeCareEntryCard({
  enabled,
  completedToday,
  targetToday,
  countdown,
  due,
  paused,
  quiet,
}: EyeCareEntryCardProps) {
  const statusText = !enabled
    ? '尚未开启，去设置护眼提醒'
    : paused
      ? '已暂停'
      : quiet
        ? '静默时段'
        : due
          ? '该休息了'
          : `下次 ${countdown}`

  return (
    <Link
      to="/eye-care"
      className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100 active:bg-sky-50/50"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700">👁️ 用眼守护</p>
        <p
          className={`mt-0.5 truncate text-xs ${due && enabled && !paused && !quiet ? 'font-medium text-sky-600' : 'text-slate-400'}`}
        >
          {statusText}
        </p>
        {enabled && (
          <p className="mt-1 text-xs text-slate-400">
            今日 {completedToday}
            {targetToday > 0 ? ` / ${targetToday}` : ''} 次
          </p>
        )}
      </div>
      <span className="ml-3 shrink-0 text-slate-300">›</span>
    </Link>
  )
}
