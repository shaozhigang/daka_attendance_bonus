import { useState } from 'react'
import { checkForUpdate, clearCacheAndReload } from '../utils/appUpdate'

type Status = 'idle' | 'checking' | 'clearing' | 'done' | 'error'

export function AppUpdateSection() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const handleCheckUpdate = async () => {
    setStatus('checking')
    setMessage('')
    try {
      const result = await checkForUpdate()
      if (result === 'unsupported') {
        setMessage('当前环境不支持自动更新，请使用下方「清理缓存」')
        setStatus('idle')
        return
      }
      if (result === 'updated') {
        setMessage('发现新版本，正在刷新…')
        window.location.reload()
        return
      }
      setMessage('已是最新版本')
      setStatus('done')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 2500)
    } catch {
      setMessage('检查失败，请尝试清理缓存')
      setStatus('error')
    }
  }

  const handleClearCache = async () => {
    setStatus('clearing')
    setMessage('正在清理缓存…')
    try {
      await clearCacheAndReload()
    } catch {
      setMessage('清理失败，请关闭 App 后重新打开')
      setStatus('error')
    }
  }

  const busy = status === 'checking' || status === 'clearing'

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
      <div>
        <h2 className="text-sm font-medium text-slate-700">应用更新</h2>
        <p className="mt-1 text-xs text-slate-400">
          版本 {__APP_VERSION__} · 若功能未更新，请清理缓存
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleCheckUpdate}
          className="flex-1 rounded-xl border border-emerald-200 py-2.5 text-sm font-medium text-emerald-700 active:bg-emerald-50 disabled:opacity-50"
        >
          {status === 'checking' ? '检查中…' : '检查更新'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleClearCache}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 active:bg-slate-50 disabled:opacity-50"
        >
          {status === 'clearing' ? '清理中…' : '清理缓存并刷新'}
        </button>
      </div>

      {message && (
        <p
          className={`text-xs ${status === 'error' ? 'text-red-500' : status === 'done' ? 'text-emerald-600' : 'text-slate-500'}`}
        >
          {message}
        </p>
      )}
    </section>
  )
}
