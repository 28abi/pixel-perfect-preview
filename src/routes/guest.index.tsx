import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { IncidentTable, PageHeader, StatCard } from "@/components/stayfix/ui";
import { OPEN_STATUSES } from "@/lib/stayfix/config";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/guest/")({ component: GuestHome });

function GuestHome() {
  const { me, incidents, stays, property } = useStayFix();
  const mine = incidents.filter((i) => i.guestId === me.id);
  const active = stays.find((s) => s.guestId === me.id && new Date(s.checkOut) > new Date());
  return (
    <div>
      <PageHeader
        title={`Hola, ${me.name.split(" ")[0]}`}
        subtitle={active ? `Estancia activa en ${property(active.propertyId).name}` : "No tienes una estancia activa"}
        action={<Link to="/guest/report" className="btn btn-signal"><PlusCircle className="size-4" /> Reportar incidencia</Link>}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Abiertas" value={mine.filter((i) => OPEN_STATUSES.includes(i.status)).length} tone="signal" />
        <StatCard label="En revisión" value={mine.filter((i) => i.status === "resuelta" || i.status === "pendiente_validacion").length} />
        <StatCard label="Cerradas" value={mine.filter((i) => i.status === "cerrada").length} tone="ok" />
      </div>
      <h2 className="mb-3 text-sm font-semibold">Incidencias recientes</h2>
      <IncidentTable items={mine.slice(0, 5)} base="/guest/incidents" showGuest={false} />
    </div>
  );
}
