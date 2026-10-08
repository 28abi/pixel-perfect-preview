import { createFileRoute } from "@tanstack/react-router";
import { IncidentTable, PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/guard/pending")({ component: Page });

function Page() {
  const { incidents } = useStayFix();
  return (
    <div>
            <PageHeader title="Pendientes" subtitle="Incidencias sin asignar y pendientes de atención." />
      <h2 className="mb-3 text-sm font-semibold">Sin asignar</h2>
      <IncidentTable items={incidents.filter((i) => !i.assigneeId && i.status !== "cerrada")} base="/guard/incidents" />
            <h2 className="mb-3 mt-8 text-sm font-semibold">Resueltas</h2>
      <IncidentTable items={incidents.filter((i) => i.status === "resuelta")} base="/guard/incidents" />
    </div>
  );
}
