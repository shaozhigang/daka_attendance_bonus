import { NavLink } from 'react-router-dom'
import { useEyeCareContext } from '../contexts/EyeCareContext'

const tabs = [
  { to: '/', label: '今日', icon: '🏠' },
  { to: '/eye-care', label: '护眼', icon: '👁️' },
  { to: '/stats', label: '统计', icon: '📊' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export function BottomNav() {
  const eyeCare = useEyeCareContext()
  const showBadge = eyeCare.settings.enabled && eyeCare.due && !eyeCare.paused && !eyeCare.quiet

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-emerald-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                isActive
                  ? tab.to === '/eye-care'
                    ? 'font-semibold text-sky-600'
                    : 'font-semibold text-emerald-600'
                  : 'text-slate-400'
              }`
            }
          >
            <span className="relative text-lg">
              {tab.icon}
              {tab.to === '/eye-care' && showBadge && (
                <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-sky-500" />
              )}
            </span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
