interface StreakBadgeProps {
  days: number
}

export function StreakBadge({ days }: StreakBadgeProps) {
  if (days <= 0) return null

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600 ring-1 ring-orange-100">
      <span>🔥</span>
      <span>连续全勤 {days} 天</span>
    </div>
  )
}
