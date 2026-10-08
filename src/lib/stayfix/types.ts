import type { CategoryId, PriorityId, StatusId } from "./config";

export type Role = "huesped" | "guardia" | "director";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  extraPhones: string[];
}

export interface Property { id: string; name: string; address: string }
export interface Stay { id: string; guestId: string; propertyId: string; checkIn: string; checkOut: string }

export type HistoryType =
  | "creada" | "asignada" | "reasignada" | "prioridad" | "estado" | "comentario"
  | "inicio" | "resolucion" | "validacion" | "rechazo" | "cierre" | "evidencia" | "categoria";

export interface HistoryEvent { id: string; type: HistoryType; userId: string; at: string; detail: string }
export interface Comment { id: string; userId: string; text: string; at: string }
export interface Evidence { id: string; name: string; userId: string; at: string }

/** Placeholder for a future AI assistant. It only suggests; humans decide. */
export interface AiSuggestion {
  category: CategoryId;
  priority: PriorityId;
  rationale: string;
  state: "pendiente" | "aceptada" | "descartada";
}

export interface Incident {
  id: string;
  number: string;
  guestId: string;
  stayId: string;
  propertyId: string;
  description: string;
  category: CategoryId;
  priority: PriorityId;
  status: StatusId;
  assigneeId: string | null;
  createdAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  resolution: string | null;
  validation: { userId: string; at: string; notes: string } | null;
  evidence: Evidence[];
  comments: Comment[];
  history: HistoryEvent[];
  ai: AiSuggestion | null;
}
