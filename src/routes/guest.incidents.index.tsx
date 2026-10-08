import { createFileRoute } from "@tanstack/react-router";
import { IncidentTable, PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/guest/incidents/")({ component: Page });

function Page() {
  const { me, incidents } = useStayFix();
  return (
    <div>
      <PageHeader title="Mis incidencias" subtitle="Consulta el estado y las actualizaciones de tus reportes." />
      <IncidentTable items={incidents.filter((i) => i.guestId === me.id)} base="/guest/incidents" showGuest={false} />
    </div>
  );
}
