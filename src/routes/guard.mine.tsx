import { createFileRoute } from "@tanstack/react-router";
import { IncidentTable, PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/guard/mine")({ component: Page });

function Page() {
  const { incidents, me } = useStayFix();
  const mine = incidents.filter((i) => i.assigneeId === me.id);
  return (
    <div>
      <PageHeader title="Mis incidencias" subtitle="Incidencias en las que eres responsable." />
      <h2 className="mb-3 text-sm font-semibold">Activas</h2>
      <IncidentTable items={mine.filter((i) => i.status !== "cerrada")} base="/guard/incidents" />
      <h2 className="mb-3 mt-8 text-sm font-semibold">Cerradas</h2>
      <IncidentTable items={mine.filter((i) => i.status === "cerrada")} base="/guard/incidents" />
    </div>
  );
}
