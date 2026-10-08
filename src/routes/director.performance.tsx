import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/stayfix/ui";
import { PRIORITIES } from "@/lib/stayfix/config";
import { computeMetrics } from "@/lib/stayfix/metrics";
import { useStayFix } from "@/lib/stayfix/store";
import { formatDuration, isOverdue, resolutionMinutes } from "@/lib/stayfix/workflow";

export const Route = createFileRoute("/director/performance")({ component: Page });

function Page() {
  const { incidents, users } = useStayFix();
  const m = computeMetrics(incidents);
  const guards = users.filter((u) => u.role === "guardia").map((g) => {
    const list = incidents.filter((i) => i.assigneeId === g.id && i.resolvedAt);
    const t = list.map((i) => resolutionMinutes(i)!);
    return { g, n: list.length, avg: t.length ? t.reduce((a, b) => a + b, 0) / t.length : null, within: list.filter((i) => !isOverdue(i)).length };
  });
  return (
    <div>
      <PageHeader title="Rendimiento" subtitle="Tiempos objetivo, cumplimiento por categoría y por responsable." />
      <section className="panel mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold">Tiempos objetivo (SLA) por prioridad</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRIORITIES.map((p) => (
            <div key={p.id} className="rounded-md border p-3">
              <p className="flex items-center gap-1.5 text-xs"><span className={`size-2 rounded-full ${p.color}`} />{p.label}</p>
              <p className="mt-1 font-mono text-lg font-semibold">{formatDuration(p.slaMinutes)}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Valores provisionales; podrán configurarse más adelante.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Table title="Por categoría" head={["Categoría", "Total", "Prom.", "En SLA"]}
          rows={[...m.byCategory].sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)).map((c) => [c.label, c.count, formatDuration(c.avg), c.withinPct == null ? "—" : `${Math.round(c.withinPct)}%`])} />
        <Table title="Por responsable" head={["Responsable", "Resueltas", "Prom.", "En SLA"]}
          rows={guards.map((x) => [x.g.name, x.n, formatDuration(x.avg), x.n ? `${Math.round((x.within / x.n) * 100)}%` : "—"])} />
      </div>
    </div>
  );
}

function Table({ title, head, rows }: { title: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <section className="panel overflow-hidden">
      <h2 className="border-b px-5 py-3 text-sm font-semibold">{title}</h2>
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs text-muted-foreground"><tr>{head.map((h, i) => <th key={h} className={`px-5 py-2 font-medium ${i ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
        <tbody className="divide-y">{rows.map((r) => <tr key={String(r[0])}>{r.map((c, i) => <td key={i} className={`px-5 py-2.5 ${i ? "text-right font-mono text-xs tabular" : ""}`}>{c}</td>)}</tr>)}</tbody>
      </table>
    </section>
  );
}
