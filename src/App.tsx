import { Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { EyeCareProvider } from './contexts/EyeCareContext'
import { EyeCarePage } from './pages/EyeCarePage'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from './pages/SettingsPage'
import { StatsPage } from './pages/StatsPage'

export default function App() {
  return (
    <EyeCareProvider>
      <div className="mx-auto min-h-dvh max-w-lg px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/eye-care" element={<EyeCarePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </EyeCareProvider>
  )
}
