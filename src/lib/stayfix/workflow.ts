import type { StatusId } from "./config";
import { priority } from "./config";
import type { Incident, Role } from "./types";

/** Allowed transitions per role. Business rules live here so a backend can mirror them. */
export const TRANSITIONS: Record<StatusId, { to: StatusId; roles: Role[] }[]> = {
  nueva: [{ to: "asignada", roles: ["guardia", "director"] }],
  asignada: [{ to: "en_proceso", roles: ["guardia"] }],
  en_proceso: [{ to: "resuelta", roles: ["guardia"] }],
    resuelta: [
    { to: "cerrada", roles: ["guardia", "director"] },
    { to: "en_proceso", roles: ["guardia", "director"] },
  ],
  cerrada: [
    { to: "en_proceso", roles: ["guardia", "director"] },
  ],
};

export function canTransition(inc: Incident, to: StatusId, role: Role): string | null {
  const rule = TRANSITIONS[inc.status].find((t) => t.to === to);
  if (!rule || !rule.roles.includes(role)) return "Transición no permitida para este rol.";
  if ((to === "asignada" || to === "en_proceso" || to === "resuelta") && !inc.assigneeId)
    return "La incidencia necesita un responsable.";
  if (to === "resuelta" && !inc.resolution?.trim()) return "Registra la descripción de la resolución.";
    return null;
}

const mins = (a: string, b: string | number) => (new Date(b).getTime() - new Date(a).getTime()) / 60000;

export const slaMinutes = (inc: Incident) => priority(inc.priority).slaMinutes;
export const resolutionMinutes = (inc: Incident) => (inc.resolvedAt ? mins(inc.createdAt, inc.resolvedAt) : null);
export const ageMinutes = (inc: Incident, now = Date.now()) => mins(inc.createdAt, now);

/** Over SLA: unresolved and older than target, or resolved later than target. */
export function isOverdue(inc: Incident, now = Date.now()) {
  const r = resolutionMinutes(inc);
  return r != null ? r > slaMinutes(inc) : ageMinutes(inc, now) > slaMinutes(inc);
}

export function formatDuration(m: number | null) {
  if (m == null) return "—";
  if (m < 60) return `${Math.round(m)} min`;
  if (m < 1440) return `${Math.floor(m / 60)} h ${Math.round(m % 60)} min`;
  return `${Math.floor(m / 1440)} d ${Math.round((m % 1440) / 60)} h`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
