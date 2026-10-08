import { createFileRoute } from "@tanstack/react-router";
import { IncidentTable, PageHeader, StatCard } from "@/components/stayfix/ui";
import { priority } from "@/lib/stayfix/config";
import { useStayFix } from "@/lib/stayfix/store";
import { isOverdue } from "@/lib/stayfix/workflow";

export const Route = createFileRoute("/guard/")({ component: Dashboard });

function Dashboard() {
  const { incidents } = useStayFix();
  const open = incidents.filter((i) => i.status !== "cerrada");
  const active = open.filter((i) => i.status !== "pendiente_validacion" && i.status !== "resuelta");
  const queue = [...active].sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)) || priority(a.priority).order - priority(b.priority).order);
  return (
    <div>
      <PageHeader title="Dashboard operativo" subtitle="Atiende primero lo crítico y lo que está fuera de tiempo." />
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Críticas" value={active.filter((i) => i.priority === "critica").length} tone="danger" />
        <StatCard label="Alta prioridad" value={active.filter((i) => i.priority === "alta").length} tone="signal" />
        <StatCard label="Sin asignar" value={open.filter((i) => !i.assigneeId).length} />
        <StatCard label="En proceso" value={open.filter((i) => i.status === "en_proceso").length} />
        <StatCard label="Por validar" value={open.filter((i) => i.status === "pendiente_validacion").length} />
        <StatCard label="Fuera de SLA" value={active.filter((i) => isOverdue(i)).length} tone="danger" />
      </div>
      <h2 className="mb-3 text-sm font-semibold">Cola de atención</h2>
      <IncidentTable items={queue} base="/guard/incidents" />
    </div>
  );
}
