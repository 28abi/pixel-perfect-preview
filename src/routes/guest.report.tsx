import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Empty } from "@/components/stayfix/ui";
import { CATEGORIES, type CategoryId } from "@/lib/stayfix/config";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/guest/report")({ component: Report });

function Report() {
  const { me, stays, property, createIncident } = useStayFix();
  const navigate = useNavigate();
  const active = stays.filter((s) => s.guestId === me.id && new Date(s.checkOut) > new Date());
  const [stayId, setStayId] = useState(active[0]?.id ?? "");
  const [cat, setCat] = useState<CategoryId>("otros");
  const [desc, setDesc] = useState("");

  if (!active.length) return <Empty>Necesitas una estancia activa para reportar una incidencia.</Empty>;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Reportar incidencia" subtitle="Cuéntanos qué pasa. El equipo de operación lo revisará y asignará." />
      <form
        className="panel space-y-5 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
                    const inc = await createIncident({ stayId, description: desc.trim(), category: cat });

          toast.success(`Incidencia ${inc.number} registrada`);
          navigate({ to: "/guest/incidents/$id", params: { id: inc.id } });
        }}
      >
        <div>
          <label className="text-sm font-medium">Estancia</label>
          <select className="field mt-1.5" value={stayId} onChange={(e) => setStayId(e.target.value)}>
            {active.map((s) => <option key={s.id} value={s.id}>{property(s.propertyId).name} — hasta {new Date(s.checkOut).toLocaleDateString("es-MX")}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Tipo de problema <span className="font-normal text-muted-foreground">(opcional)</span></label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.id} onClick={() => setCat(c.id)}
                className={`rounded-full border px-3 py-1 text-xs ${cat === c.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                {c.id === "otros" ? "No estoy seguro / Otro" : c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Descripción del problema</label>
          <textarea className="field mt-1.5 min-h-32" required minLength={10} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej. No sale agua caliente en la regadera desde esta mañana." />
        </div>
        <button className="btn btn-signal w-full sm:w-auto" disabled={desc.trim().length < 10}>Enviar reporte</button>
      </form>
    </div>
  );
}
