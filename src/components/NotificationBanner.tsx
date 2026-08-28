interface NotificationBannerProps {
  permission: NotificationPermission
  onRequest: () => void
}

export function NotificationBanner({ permission, onRequest }: NotificationBannerProps) {
  if (permission === 'granted') return null

  return (
    <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">
      <p className="font-medium">iOS 提示</p>
      <p className="mt-1 text-xs leading-relaxed">
        PWA 后台通知在 iPhone 上较弱，请同时配置「日历 + 快捷指令自动化」作为主提醒。开启通知可作为辅助。
      </p>
      {permission === 'default' && (
        <button
          type="button"
          onClick={onRequest}
          className="mt-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white"
        >
          开启通知
        </button>
      )}
    </div>
  )
}
