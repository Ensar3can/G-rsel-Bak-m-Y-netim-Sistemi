/** Uygulama genelindeki domain tipleri. */

export type Role = 'operator' | 'maintenance' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
  shift: string;
  department: string;
}

export interface MachineLine {
  id: string;
  code: string;
  name: string;
  hall: string;
  description: string;
}

export interface MachineSection {
  id: string;
  lineId: string;
  code: 'raw' | 'process' | 'quality';
  name: string;
  shortName: string;
  description: string;
  /** Merkezi görsel yolu — gerçek fotoğraflar sonradan buradan değiştirilir. */
  imageKey: string;
}

export interface MachinePart {
  id: string;
  name: string;
  code: string;
  typicalFailure: string;
}

export type FaultStatus =
  | 'new'
  | 'reviewing'
  | 'waiting_parts'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type FaultPriority = 'low' | 'medium' | 'high' | 'critical';

export type FaultCategory =
  | 'mechanical'
  | 'electrical'
  | 'sensor'
  | 'hydraulic'
  | 'software'
  | 'safety'
  | 'other';

export interface Attachment {
  id: string;
  name: string;
  kind: 'photo' | 'audio' | 'document';
  /** Demo: data URL veya SVG placeholder */
  url: string;
  createdAt: string;
}

export interface MaintenanceNote {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface SparePartUsage {
  id: string;
  sparePartId: string;
  quantity: number;
  unitCost: number;
}

export interface StatusChange {
  status: FaultStatus;
  at: string;
  by: string;
  note?: string;
}

export interface VisualLocation {
  lineId: string;
  sectionId: string;
  partId: string;
  hotspotX: number;
  hotspotY: number;
}

export interface FaultRecord {
  id: string;
  title: string;
  machineLineId: string;
  sectionId: string;
  partId: string;
  category: FaultCategory;
  priority: FaultPriority;
  description: string;
  symptom: string;
  productionStopped: boolean;
  status: FaultStatus;
  createdAt: string;
  updatedAt: string;
  occurredAt: string;
  createdBy: string;
  assignedTo?: string;
  attachments: Attachment[];
  maintenanceNotes: MaintenanceNote[];
  rootCause?: string;
  estimatedRepairMinutes?: number;
  actualRepairMinutes?: number;
  estimatedCompletionAt?: string;
  spareParts: SparePartUsage[];
  estimatedCost: number;
  visualLocation: VisualLocation;
  statusHistory: StatusChange[];
  resolutionSummary?: string;
  aiRecommendations?: AIRecommendation;
}

export interface MaintenanceAction {
  id: string;
  faultId: string;
  type: 'claim' | 'status' | 'note' | 'parts' | 'root_cause' | 'eta' | 'close';
  by: string;
  at: string;
  payload?: string;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  stock: number;
}

export interface CostTierRecommendation {
  title: string;
  costLevel: 'low' | 'medium' | 'high';
  estimatedCost: number;
  durationHint: string;
  materials: string[];
  benefit: string;
  riskOrLimitation: string;
  productionImpact?: string;
}

export interface AIRecommendation {
  id: string;
  generatedAt: string;
  confidence: number;
  possibleCauses: string[];
  checklist: string[];
  suggestedParts: string[];
  similarFaultInsights: string[];
  economic: CostTierRecommendation;
  balanced: CostTierRecommendation;
  guaranteed: CostTierRecommendation;
  disclaimer: string;
}

export interface Notification {
  id: string;
  type:
    | 'new_critical'
    | 'claimed'
    | 'waiting'
    | 'closed'
    | 'overdue_critical'
    | 'new_fault';
  title: string;
  message: string;
  faultId?: string;
  createdAt: string;
  read: boolean;
}

export interface ReportFilter {
  from: string;
  to: string;
  period: 'weekly' | 'monthly' | 'custom';
  machineLineId?: string;
  sectionId?: string;
  category?: FaultCategory;
  priority?: FaultPriority;
  status?: FaultStatus;
}

export interface AIContext {
  similarFaults: FaultRecord[];
  catalogParts: MachinePart[];
}

/** İleride OpenAI / şirket içi model bağlamak için sözleşme. */
export interface IAIRecommendationService {
  getRecommendations(fault: FaultRecord, context: AIContext): Promise<AIRecommendation>;
}
