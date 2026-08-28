import { MACHINE_LINES, MACHINE_PARTS } from '@/data/catalog';
import { MachineLineVisual } from '@/features/machines/MachineLineVisual';
import {
  emptyForm,
  FaultReportForm,
  validateFaultForm,
  type FaultFormValues,
} from '@/features/faults/FaultReportForm';
import { useAppStore } from '@/store/appStore';
import type { FaultCategory, FaultPriority, MachineSection } from '@/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function NewFaultPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.currentUser);
  const createFault = useAppStore((s) => s.createFault);
  const [lineId, setLineId] = useState(MACHINE_LINES[0].id);
  const [form, setForm] = useState<FaultFormValues>(emptyForm(MACHINE_LINES[0].id));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSelectSection = (section: MachineSection) => {
    setForm((f) => ({ ...f, sectionId: section.id, machineLineId: lineId }));
  };

  const onSelectPart = (partId: string) => {
    const part = MACHINE_PARTS.find((p) => p.id === partId);
    setForm((f) => ({
      ...f,
      partId,
      symptom: f.symptom || part?.typicalFailure || '',
    }));
  };

  const submit = async () => {
    const next = { ...form, machineLineId: lineId };
    const e = validateFaultForm(next);
    setErrors(e);
    if (Object.keys(e).length) return;
    const part = MACHINE_PARTS.find((p) => p.id === next.partId);
    const line = MACHINE_LINES.find((l) => l.id === lineId);
    const occurred = new Date(next.occurredAt).toISOString();
    const record = await createFault({
      title: `${line?.code} · ${part?.name} arızası`,
      machineLineId: lineId,
      sectionId: next.sectionId,
      partId: next.partId,
      category: next.category as FaultCategory,
      priority: next.priority as FaultPriority,
      description: next.description,
      symptom: next.symptom,
      productionStopped: next.productionStopped === 'yes',
      status: 'new',
      createdAt: occurred,
      occurredAt: occurred,
      createdBy: user.id,
      attachments: [
        {
          id: `att-${Date.now()}`,
          name: next.photoName || 'saha-foto.jpg',
          kind: 'photo',
          url: next.photoUrl || '/assets/machines/photo-placeholder.svg',
          createdAt: occurred,
        },
      ],
      maintenanceNotes: [],
      spareParts: [],
      estimatedCost: next.productionStopped === 'yes' ? 9000 : 2800,
      visualLocation: {
        lineId,
        sectionId: next.sectionId,
        partId: next.partId,
        hotspotX: 48,
        hotspotY: 42,
      },
    });
    navigate(`/arizalar/${record.id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Yeni arıza bildir</h2>
        <p className="text-navy-600">Önce hattı, ardından görsel üzerindeki bölümü ve parçayı seçin.</p>
      </div>
      <label className="block text-sm font-medium">
        Makine hattı
        <select
          className="mt-1 w-full max-w-md rounded-xl border border-navy-200 bg-white px-3 py-3 text-base"
          value={lineId}
          onChange={(e) => {
            setLineId(e.target.value);
            setForm((f) => ({ ...f, machineLineId: e.target.value }));
          }}
        >
          {MACHINE_LINES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name} ({l.hall})
            </option>
          ))}
        </select>
      </label>
      <MachineLineVisual
        selectedSectionId={form.sectionId}
        selectedPartId={form.partId}
        onSelectSection={onSelectSection}
        onSelectPart={onSelectPart}
      />
      <FaultReportForm
        values={{ ...form, machineLineId: lineId }}
        errors={errors}
        operatorName={user.name}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onSubmit={() => void submit()}
      />
    </div>
  );
}
