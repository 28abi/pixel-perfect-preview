import { createFileRoute } from "@tanstack/react-router";
import { IncidentBrowser } from "@/components/stayfix/IncidentBrowser";
import { PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/director/history")({ component: Page });

function Page() {
  const { incidents } = useStayFix();
  return (
    <div>
      <PageHeader title="Histórico" subtitle="Incidencias cerradas con su trazabilidad completa." />
      <IncidentBrowser items={incidents.filter((i) => i.status === "cerrada")} base="/director/incidents" />
    </div>
  );
}
