import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils/format';

export function ToastViewport() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto rounded-xl px-4 py-3 text-left text-sm font-medium shadow-card',
            t.tone === 'success' && 'bg-emerald-700 text-white',
            t.tone === 'info' && 'bg-navy-800 text-white',
            t.tone === 'warning' && 'bg-amber-500 text-navy-900',
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
