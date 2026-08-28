import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { FaultDetailPage } from '@/pages/FaultDetailPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { ManagementPage } from '@/pages/ManagementPage';
import { NewFaultPage } from '@/pages/NewFaultPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SystemPage } from '@/pages/SystemPage';
import { useAppStore } from '@/store/appStore';
import { useEffect, type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

function RoleGate({
  allow,
  children,
  unauthorized,
}: {
  allow: Array<'operator' | 'maintenance' | 'manager' | 'admin'>;
  children: ReactElement;
  unauthorized?: ReactElement;
}) {
  const role = useAppStore((s) => s.currentUser.role);
  if (!allow.includes(role) && role !== 'admin') {
    return unauthorized ?? <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

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
            <RoleGate allow={['admin']} unauthorized={<DashboardPage />}>
              <SystemPage />
            </RoleGate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
