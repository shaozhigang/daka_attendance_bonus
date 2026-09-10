import { useState } from 'react'
import { EyeCarePanel } from '../components/EyeCarePanel'
import { EyeCareSettingsSection } from '../components/EyeCareSettingsSection'
import { useEyeCareContext } from '../contexts/EyeCareContext'
import type { EyeCareSettings } from '../types/eyeCare'

export function EyeCarePage() {
  const eyeCare = useEyeCareContext()
  const [draft, setDraft] = useState<EyeCareSettings>(eyeCare.settings)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    eyeCare.setSettings(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-sky-800">用眼守护</h1>
        <p className="text-sm text-slate-500">20-20-20 法则 · 每 20 分钟远眺 20 秒</p>
      </header>

      <EyeCarePanel
        enabled={eyeCare.settings.enabled}
        completedToday={eyeCare.completedToday}
        targetToday={eyeCare.targetToday}
        countdown={eyeCare.countdown}
        due={eyeCare.due}
        paused={eyeCare.paused}
        quiet={eyeCare.quiet}
        onConfirmBreak={eyeCare.confirmBreak}
        onPause30={() => eyeCare.pauseForMinutes(30)}
        onPauseToday={eyeCare.pauseUntilTomorrow}
        onResume={eyeCare.resumeEarly}
      />

      <EyeCareSettingsSection
        settings={draft}
        completedToday={eyeCare.completedToday}
        targetToday={eyeCare.targetToday}
        countdown={eyeCare.countdown}
        onChange={setDraft}
      />

      <section className="rounded-2xl bg-sky-50 p-4 text-xs leading-relaxed text-sky-800 ring-1 ring-sky-100">
        <p className="font-medium">为什么要休息？</p>
        <p className="mt-1">
          持续盯屏会降低眨眼频率，导致干涩、酸胀。每 20 分钟看 6 米外 20 秒，是最低成本的护眼习惯。
        </p>
      </section>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-sky-500 py-3 font-medium text-white active:bg-sky-600"
      >
        {saved ? '✓ 已保存' : '保存设置'}
      </button>
    </div>
  )
}
