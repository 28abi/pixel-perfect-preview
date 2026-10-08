import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/stayfix/ui";
import { useStayFix } from "@/lib/stayfix/store";

export const Route = createFileRoute("/guest/stay")({ component: Stay });

function Stay() {
  const { me, stays, property } = useStayFix();
  const mine = stays.filter((s) => s.guestId === me.id).sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  const fmt = (d: string) => new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div>
      <PageHeader title="Mi estancia" />
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((s) => {
          const p = property(s.propertyId);
          const active = new Date(s.checkOut) > new Date();
          return (
            <div key={s.id} className="panel p-5">
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${active ? "text-ok" : "text-muted-foreground"}`}>{active ? "Activa" : "Finalizada"}</span>
              <h2 className="mt-1 text-lg font-semibold">{p.name}</h2>
              <p className="text-sm text-muted-foreground">{p.address}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Entrada</p><p className="font-medium">{fmt(s.checkIn)}</p></div>
                <div><p className="text-xs text-muted-foreground">Salida</p><p className="font-medium">{fmt(s.checkOut)}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
