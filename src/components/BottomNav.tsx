import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '今日', icon: '🏠' },
  { to: '/stats', label: '统计', icon: '📊' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-emerald-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? 'font-semibold text-emerald-600' : 'text-slate-400'
              }`
            }
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
