import type { EyeCareSettings } from '../types/eyeCare'

interface EyeCareSettingsSectionProps {
  settings: EyeCareSettings
  completedToday: number
  targetToday: number
  countdown: string
  onChange: (next: EyeCareSettings) => void
}

export function EyeCareSettingsSection({
  settings,
  completedToday,
  targetToday,
  countdown,
  onChange,
}: EyeCareSettingsSectionProps) {
  const updateQuiet = (key: keyof EyeCareSettings['quietHours'], value: boolean | string) => {
    onChange({
      ...settings,
      quietHours: { ...settings.quietHours, [key]: value },
    })
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100">
      <h2 className="text-sm font-medium text-slate-700">👁️ 用眼守护</h2>

      <Toggle
        label="开启用眼提醒"
        checked={settings.enabled}
        onChange={(v) => onChange({ ...settings, enabled: v })}
      />

      {settings.enabled && (
        <>
          <div className="rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-800">
            微休息间隔 {settings.intervalMinutes} 分钟 · 建议休息 {settings.durationSeconds} 秒
          </div>
          <p className="text-xs text-slate-500">
            今日 {completedToday}
            {targetToday > 0 ? ` / ${targetToday}` : ''} 次 · 下次 {countdown}
          </p>

          <h3 className="pt-1 text-xs font-medium text-slate-500">静默时段</h3>
          <Field label="午休开始">
            <input
              type="time"
              value={settings.quietHours.lunchStart}
              onChange={(e) => updateQuiet('lunchStart', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="午休结束">
            <input
              type="time"
              value={settings.quietHours.lunchEnd}
              onChange={(e) => updateQuiet('lunchEnd', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
          <Toggle
            label="下班后不提醒"
            checked={settings.quietHours.afterWorkStop}
            onChange={(v) => updateQuiet('afterWorkStop', v)}
          />
          <Toggle
            label="周末不提醒"
            checked={settings.quietHours.weekendsOff}
            onChange={(v) => updateQuiet('weekendsOff', v)}
          />
        </>
      )}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600">{label}</span>
      {children}
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-sky-500"
      />
    </label>
  )
}
