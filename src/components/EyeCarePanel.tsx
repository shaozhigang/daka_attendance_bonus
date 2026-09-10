interface EyeCarePanelProps {
  enabled: boolean
  completedToday: number
  targetToday: number
  countdown: string
  due: boolean
  paused: boolean
  quiet: boolean
  onConfirmBreak: () => void
  onPause30: () => void
  onPauseToday: () => void
  onResume: () => void
}

export function EyeCarePanel({
  enabled,
  completedToday,
  targetToday,
  countdown,
  due,
  paused,
  quiet,
  onConfirmBreak,
  onPause30,
  onPauseToday,
  onResume,
}: EyeCarePanelProps) {
  if (!enabled) {
    return (
      <section className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-sky-100">
        <p className="text-4xl">👁️</p>
        <p className="mt-2 text-sm text-slate-600">用眼提醒尚未开启</p>
        <p className="mt-1 text-xs text-slate-400">在下方打开开关并保存即可开始</p>
      </section>
    )
  }

  const statusText = paused
    ? '已暂停提醒'
    : quiet
      ? '静默时段（午休/下班后）'
      : due
        ? '该休息了！'
        : '距离下次提醒'

  const progress = targetToday > 0 ? Math.min(100, (completedToday / targetToday) * 100) : 0

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">今日进度</h2>
        {paused ? (
          <button
            type="button"
            onClick={onResume}
            className="rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky-700 ring-1 ring-sky-100"
          >
            恢复提醒
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause30}
            className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-100"
          >
            暂停 30 分
          </button>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400">{statusText}</p>
        {!paused && !quiet && (
          <p
            className={`mt-1 font-mono text-3xl font-semibold tracking-tight ${
              due ? 'text-sky-600' : 'text-slate-800'
            }`}
          >
            {due ? '现在' : countdown}
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>微休息</span>
          <span>
            {completedToday}
            {targetToday > 0 ? ` / ${targetToday}` : ''} 次
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sky-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onConfirmBreak}
        className="mt-4 w-full rounded-xl bg-sky-500 py-3 text-sm font-medium text-white active:bg-sky-600"
      >
        我休息了，重置计时
      </button>

      {!paused && (
        <button
          type="button"
          onClick={onPauseToday}
          className="mt-2 w-full py-1 text-xs text-slate-400 underline"
        >
          今日不再提醒
        </button>
      )}
    </section>
  )
}
