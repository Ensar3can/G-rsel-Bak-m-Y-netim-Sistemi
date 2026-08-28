import { AppLayout } from '@/components/layout/AppLayout';
import { ROLE_LABELS } from '@/data/catalog';
import { DashboardPage } from '@/pages/DashboardPage';
import { FaultDetailPage } from '@/pages/FaultDetailPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { ManagementPage } from '@/pages/ManagementPage';
import { NewFaultPage } from '@/pages/NewFaultPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SystemPage } from '@/pages/SystemPage';
import { useAppStore } from '@/store/appStore';
import type { Role } from '@/types';
import { Loader2 } from 'lucide-react';
import { useEffect, type ReactElement } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

function BootScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-yellow">Goodyear</p>
      <p className="mt-3 text-base text-navy-200">Sistem hazırlanıyor...</p>
      <Loader2 className="mt-5 animate-spin text-brand-yellow" size={28} aria-hidden />
    </div>
  );
}

function AccessDenied({ allow }: { allow: Role[] }) {
  const labels = allow.map((role) => ROLE_LABELS[role]).join(' / ');
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 text-center shadow-card">
      <h2 className="text-xl font-bold text-navy-900">Bu ekrana erişim yok</h2>
      <p className="mt-3 text-navy-700">Bu ekran {labels} görünümündedir.</p>
      <p className="mt-2 text-sm text-navy-600">
        Demo rolünü değiştirerek bu ekranı inceleyebilirsiniz.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-navy-900 px-4 font-semibold text-white"
      >
        Kontrol paneline dön
      </Link>
    </div>
  );
}

function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactElement;
}) {
  const role = useAppStore((s) => s.currentUser.role);
  if (!allow.includes(role) && role !== 'admin') {
    return <AccessDenied allow={allow} />;
  }
  return children;
}

export default function App() {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) return <BootScreen />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/yeni-ariza"
          element={
            <RoleGate allow={['operator', 'admin']}>
              <NewFaultPage />
            </RoleGate>
          }
        />
        <Route
          path="/bakim"
          element={
            <RoleGate allow={['maintenance', 'admin']}>
              <MaintenancePage />
            </RoleGate>
          }
        />
        <Route path="/arizalar/:id" element={<FaultDetailPage />} />
        <Route
          path="/raporlar"
          element={
            <RoleGate allow={['manager', 'admin']}>
              <ReportsPage />
            </RoleGate>
          }
        />
        <Route
          path="/yonetim"
          element={
            <RoleGate allow={['manager', 'admin']}>
              <ManagementPage />
            </RoleGate>
          }
        />
        <Route
          path="/sistem"
          element={
            <RoleGate allow={['admin']}>
              <SystemPage />
            </RoleGate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
