import { createFileRoute } from "@tanstack/react-router";
import { IncidentBrowser } from "@/components/stayfix/IncidentBrowser";
import { IncidentTable, PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/director/incidents/")({ component: Page });

function Page() {
  const { incidents } = useStayFix();
  const pending = incidents.filter((i) => i.status === "pendiente_validacion");
  return (
    <div>
      <PageHeader title="Incidencias" subtitle="Valida las resoluciones antes de cerrarlas." />
      <h2 className="mb-3 text-sm font-semibold">Pendientes de validación</h2>
      <IncidentTable items={pending} base="/director/incidents" />
      <h2 className="mb-3 mt-8 text-sm font-semibold">Todas</h2>
      <IncidentBrowser items={incidents} base="/director/incidents" />
    </div>
  );
}
