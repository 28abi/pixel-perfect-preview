import { createFileRoute } from "@tanstack/react-router";
import { IncidentBrowser } from "@/components/stayfix/IncidentBrowser";
import { PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/guard/incidents/")({ component: Page });

function Page() {
  const { incidents } = useStayFix();
  return (
    <div>
      <PageHeader title="Incidencias" subtitle="Todas las incidencias registradas." />
      <IncidentBrowser items={incidents} base="/guard/incidents" />
    </div>
  );
}
