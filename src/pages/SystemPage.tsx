import { USERS, ROLE_LABELS, MACHINE_LINES } from '@/data/catalog';
import { storage } from '@/services/storage';
import { useAppStore } from '@/store/appStore';

export function SystemPage() {
  const pushToast = useAppStore((s) => s.pushToast);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Sistem yönetimi</h2>
      <p className="text-navy-600">Kullanıcılar, hat kataloğu ve yerel veri sıfırlama.</p>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="font-semibold">Kullanıcılar</h3>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-navy-500">
              <th className="py-1">Ad</th>
              <th>Rol</th>
              <th>Vardiya</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="py-2">{u.name}</td>
                <td>{ROLE_LABELS[u.role]}</td>
                <td>{u.shift}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="font-semibold">Makine hatları</h3>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {MACHINE_LINES.map((l) => (
            <li key={l.id}>
              {l.code} · {l.name} · {l.hall}
            </li>
          ))}
        </ul>
      </section>
      <button
        type="button"
        className="rounded-xl bg-red-700 px-4 py-3 font-semibold text-white"
        onClick={() => {
          storage.clear();
          pushToast('Yerel veri temizlendi. Sayfa yenileniyor.', 'warning');
          window.setTimeout(() => window.location.reload(), 600);
        }}
      >
        localStorage verisini sıfırla
      </button>
    </div>
  );
}
