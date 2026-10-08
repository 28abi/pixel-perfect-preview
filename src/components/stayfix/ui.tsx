import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { category, priority, status, type PriorityId, type StatusId } from "@/lib/stayfix/config";
import { useStayFix } from "@/lib/stayfix/store";
import type { Incident } from "@/lib/stayfix/types";
import { ageMinutes, formatDate, formatDuration, isOverdue, OPEN_HELPER } from "./helpers";

export function PriorityBadge({ id }: { id: PriorityId }) {
  const p = priority(id);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`size-2 rounded-full ${p.color}`} />
      {p.label}
    </span>
  );
}

export function StatusBadge({ id }: { id: StatusId }) {
  const s = status(id);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5 text-xs font-medium whitespace-nowrap">
      <span className={`size-1.5 rounded-full ${s.color}`} />
      {s.label}
    </span>
  );
}

export function SlaFlag({ inc }: { inc: Incident }) {
  if (!isOverdue(inc)) return null;
  return <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">Fuera de SLA</span>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: "danger" | "signal" | "ok" }) {
  const bar = tone === "danger" ? "bg-destructive" : tone === "signal" ? "bg-signal" : tone === "ok" ? "bg-ok" : "bg-primary";
  return (
    <div className="panel relative overflow-hidden p-4">
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="panel p-10 text-center text-sm text-muted-foreground">{children}</div>;
}

type Base = "/guest/incidents" | "/guard/incidents" | "/director/incidents";

export function IncidentTable({ items, base, showGuest = true }: { items: Incident[]; base: Base; showGuest?: boolean }) {
  const { user, property } = useStayFix();
  if (!items.length) return <Empty>No hay incidencias en esta vista.</Empty>;
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">No.</th>
            <th className="px-4 py-2.5 font-medium">Incidencia</th>
            <th className="px-4 py-2.5 font-medium">Prioridad</th>
            <th className="px-4 py-2.5 font-medium">Estado</th>
            {showGuest && <th className="px-4 py-2.5 font-medium">Responsable</th>}
            <th className="px-4 py-2.5 font-medium">Antigüedad</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((i) => (
            <tr key={i.id} className="hover:bg-muted/40">
              <td className="px-4 py-3 font-mono text-xs">
                <Link to={`${base}/$id`} params={{ id: i.id }} className="font-semibold text-primary hover:underline">{i.number}</Link>
              </td>
              <td className="max-w-sm px-4 py-3">
                <Link to={`${base}/$id`} params={{ id: i.id }} className="block">
                  <span className="font-medium">{category(i.category).label}</span>
                  <span className="text-muted-foreground"> · {property(i.propertyId).name}</span>
                  <p className="truncate text-xs text-muted-foreground">{i.description}</p>
                </Link>
              </td>
              <td className="px-4 py-3"><PriorityBadge id={i.priority} /></td>
              <td className="px-4 py-3"><div className="flex flex-wrap items-center gap-1.5"><StatusBadge id={i.status} /><SlaFlag inc={i} /></div></td>
              {showGuest && <td className="px-4 py-3 text-xs">{user(i.assigneeId)?.name ?? <span className="text-muted-foreground">Sin asignar</span>}</td>}
              <td className="px-4 py-3 font-mono text-xs tabular text-muted-foreground" title={formatDate(i.createdAt)}>
                {i.status === "cerrada" ? formatDate(i.closedAt) : formatDuration(ageMinutes(i))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BarList({ rows, format = (n: number) => String(n) }: { rows: { label: string; value: number; tone?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[8.5rem_1fr_4.5rem] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{r.label}</span>
          <span className="h-2.5 rounded-full bg-muted">
            <span className={`block h-full rounded-full ${r.tone ?? "bg-primary"}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="text-right font-mono text-xs tabular">{format(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export { OPEN_HELPER };
