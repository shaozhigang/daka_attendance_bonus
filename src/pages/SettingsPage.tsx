import { useState } from 'react'
import type { Settings } from '../types/attendance'
import { useAttendance } from '../hooks/useAttendance'

export function SettingsPage() {
  const { settings, setSettings } = useAttendance()
  const [draft, setDraft] = useState<Settings>(settings)
  const [saved, setSaved] = useState(false)

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setSaved(false)
  }

  const updateStrategy = (key: keyof Settings['reminderStrategy'], value: boolean) => {
    setDraft((d) => ({
      ...d,
      reminderStrategy: { ...d.reminderStrategy, [key]: value },
    }))
    setSaved(false)
  }

  const handleSave = () => {
    setSettings(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-emerald-800">设置</h1>
      </header>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
        <Field label="上班时间">
          <input
            type="time"
            value={draft.clockInTime}
            onChange={(e) => update('clockInTime', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="下班时间">
          <input
            type="time"
            value={draft.clockOutTime}
            onChange={(e) => update('clockOutTime', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="全勤奖金（元）">
          <input
            type="number"
            value={draft.bonusAmount}
            onChange={(e) => update('bonusAmount', Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
        <h2 className="text-sm font-medium text-slate-700">提醒策略</h2>
        <Toggle
          label="开启提醒"
          checked={draft.reminderEnabled}
          onChange={(v) => update('reminderEnabled', v)}
        />
        <Toggle
          label="提前 20 分钟"
          checked={draft.reminderStrategy.before20}
          onChange={(v) => updateStrategy('before20', v)}
        />
        <Toggle
          label="提前 5 分钟"
          checked={draft.reminderStrategy.before5}
          onChange={(v) => updateStrategy('before5', v)}
        />
        <Toggle
          label="超时后提醒"
          checked={draft.reminderStrategy.afterOverdue}
          onChange={(v) => updateStrategy('afterOverdue', v)}
        />
        <Toggle
          label="22:00 兜底审计"
          checked={draft.reminderStrategy.auditAt22}
          onChange={(v) => updateStrategy('auditAt22', v)}
        />
      </section>

      <section className="rounded-2xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-800 ring-1 ring-emerald-100">
        <p className="font-medium">iOS 用户必读</p>
        <p className="mt-1">
          iPhone 上 PWA 后台通知不可靠，请务必配置日历 + 快捷指令自动化（见 docs/plan-a-ios-quickstart.md）。
        </p>
      </section>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-emerald-500 py-3 font-medium text-white active:bg-emerald-600"
      >
        {saved ? '✓ 已保存' : '保存设置'}
      </button>
    </div>
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
        className="h-5 w-5 accent-emerald-500"
      />
    </label>
  )
}
