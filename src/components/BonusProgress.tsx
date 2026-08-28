interface BonusProgressProps {
  secured: number
  total: number
  fullDays: number
  workdays: number
}

export function BonusProgress({ secured, total, fullDays, workdays }: BonusProgressProps) {
  const pct = workdays > 0 ? Math.round((fullDays / workdays) * 100) : 0

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm text-slate-500">本月全勤奖</p>
        <p className="text-lg font-bold text-emerald-600">
          ¥{secured}
          <span className="text-sm font-normal text-slate-400"> / {total}</span>
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        全勤 {fullDays} / {workdays} 个工作日 · {pct}%
      </p>
    </section>
  )
}
