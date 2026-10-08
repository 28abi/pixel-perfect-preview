import { createFileRoute, Link } from "@tanstack/react-router";
import { BarList, PageHeader, PriorityBadge, StatCard } from "@/components/stayfix/ui";
import { category } from "@/lib/stayfix/config";
import { computeMetrics } from "@/lib/stayfix/metrics";
import { useStayFix } from "@/lib/stayfix/store";
import type { Incident } from "@/lib/stayfix/types";
import { ageMinutes, formatDuration, resolutionMinutes } from "@/lib/stayfix/workflow";

export const Route = createFileRoute("/director/")({ component: Exec });

function Exec() {
  const { incidents } = useStayFix();
  const m = computeMetrics(incidents);
  const pending = incidents.filter((i) => i.status === "pendiente_validacion");
  const slowest = [...m.byCategory].filter((c) => c.avg != null).sort((a, b) => b.avg! - a.avg!);
  return (
    <div>
      <PageHeader title="Dashboard ejecutivo" subtitle="Visión general del desempeño de mantenimiento." />
      {pending.length > 0 && (
        <Link to="/director/incidents" className="panel mb-6 flex items-center justify-between border-s-validacion bg-accent p-4 text-sm">
          <span><b>{pending.length}</b> incidencia(s) esperan tu validación.</span>
          <span className="font-medium text-primary">Revisar →</span>
        </Link>
      )}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={m.total} />
        <StatCard label="Abiertas" value={m.open} tone="signal" />
        <StatCard label="Resueltas" value={m.resolved} tone="ok" />
        <StatCard label="Prom. resolución" value={<span className="text-xl">{formatDuration(m.avgResolution)}</span>} />
        <StatCard label="Dentro de SLA" value={m.withinPct == null ? "—" : `${Math.round(m.withinPct)}%`} tone="ok" />
        <StatCard label="Fuera de SLA" value={m.overdue} tone="danger" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 text-sm font-semibold">Incidencias por categoría</h2>
          <BarList rows={[...m.byCategory].sort((a, b) => b.count - a.count).map((c) => ({ label: c.label, value: c.count }))} />
        </section>
        <section className="panel p-5">
          <h2 className="mb-1 text-sm font-semibold">Tiempo promedio de resolución por categoría</h2>
          <p className="mb-4 text-xs text-muted-foreground">Las primeras son las que más tardan.</p>
          <BarList rows={slowest.map((c, i) => ({ label: c.label, value: c.avg!, tone: i < 2 ? "bg-p-alta" : "bg-primary" }))} format={formatDuration} />
        </section>
        <MiniList title="Incidencias abiertas más antiguas" items={m.oldest} metric={(i) => formatDuration(ageMinutes(i))} />
        <MiniList title="Resueltas más rápido" items={m.fastest} metric={(i) => formatDuration(resolutionMinutes(i))} />
      </div>
    </div>
  );
}

function MiniList({ title, items, metric }: { title: string; items: Incident[]; metric: (i: Incident) => string }) {
  return (
    <section className="panel p-5">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <ul className="divide-y text-sm">
        {items.map((i) => (
          <li key={i.id}>
            <Link to="/director/incidents/$id" params={{ id: i.id }} className="flex items-center justify-between gap-3 py-2.5 hover:text-primary">
              <span className="flex items-center gap-3"><span className="font-mono text-xs font-semibold">{i.number}</span>{category(i.category).label}<PriorityBadge id={i.priority} /></span>
              <span className="font-mono text-xs tabular">{metric(i)}</span>
            </Link>
          </li>
        ))}
        {!items.length && <li className="py-2 text-muted-foreground">Sin datos.</li>}
      </ul>
    </section>
  );
}
