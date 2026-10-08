import { createFileRoute } from "@tanstack/react-router";
import { IncidentBrowser } from "@/components/stayfix/IncidentBrowser";
import { IncidentTable, PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/director/incidents/")({ component: Page });

function Page() {
  const { incidents } = useStayFix();
    return (
    <div>
      <PageHeader title="Incidencias" subtitle="Supervisa y da seguimiento a la operación." />
      <h2 className="mb-3 text-sm font-semibold">Todas</h2>
      <IncidentBrowser items={incidents} base="/director/incidents" />
    </div>
  );
}
