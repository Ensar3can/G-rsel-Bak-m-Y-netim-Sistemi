import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Yükleniyor...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-navy-600" role="status">
      <Loader2 className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
      <Inbox className="mx-auto text-navy-400" />
      <p className="mt-3 font-semibold text-navy-800">{title}</p>
      {hint ? <p className="mt-1 text-sm text-navy-500">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle size={18} />
        Bir hata oluştu
      </div>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}
