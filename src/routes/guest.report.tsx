import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Empty } from "@/components/stayfix/ui";
import { CATEGORIES, type CategoryId } from "@/lib/stayfix/config";
import { useStayFix } from "@/lib/stayfix/store";
import { compressPhoto, validatePhoto } from "@/lib/stayfix/photo";

export const Route = createFileRoute("/guest/report")({ component: Report });

function Report() {
  const { me, stays, property, createIncident } = useStayFix();
  const navigate = useNavigate();
  const active = stays.filter((s) => s.guestId === me.id && new Date(s.checkOut) > new Date());
  const [stayId, setStayId] = useState(active[0]?.id ?? "");
  const [cat, setCat] = useState<CategoryId>("otros");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<{ name: string; dataUrl: string } | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [sending, setSending] = useState(false);

  if (!active.length) return <Empty>Necesitas una estancia activa para reportar una incidencia.</Empty>;

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    const err = validatePhoto(file);
    if (err) { toast.error(err); return; }
    setPhotoBusy(true);
    try { setPhoto({ name: file.name, dataUrl: await compressPhoto(file) }); }
    catch { toast.error("No se pudo procesar la imagen. Intenta con otra."); }
    finally { setPhotoBusy(false); }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Reportar incidencia" subtitle="Cuéntanos qué pasa. El equipo de operación lo revisará y asignará." />
      <form
        className="panel space-y-5 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setSending(true);
          try {
            const inc = await createIncident({ stayId, description: desc.trim(), category: cat, photo: photo ?? undefined });
            toast.success(`Incidencia ${inc.number} registrada`);
            navigate({ to: "/guest/incidents/$id", params: { id: inc.id } });
          } catch (err) {
            toast.error(err instanceof Error && err.message === "STORAGE_FULL"
              ? "No hay espacio suficiente para guardar la fotografía. Quítala o elige otra e intenta de nuevo."
              : "No se pudo registrar la incidencia. Intenta de nuevo.");
          } finally { setSending(false); }
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
        <div>
          <label className="text-sm font-medium">Evidencia fotográfica <span className="font-normal text-muted-foreground">(opcional)</span></label>
          <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG o WebP, máximo 5 MB.</p>
          {photo ? (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
              <img src={photo.dataUrl} alt="Vista previa de la evidencia" className="max-h-56 w-full rounded-md border object-cover sm:w-64" />
              <div className="flex flex-wrap gap-2">
                <label className="btn btn-outline cursor-pointer">
                  Reemplazar
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                <button type="button" className="btn btn-danger" onClick={() => setPhoto(null)}>Eliminar</button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              <label className="btn btn-outline cursor-pointer">
                {photoBusy ? "Procesando…" : "Elegir imagen"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={photoBusy} onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              <label className="btn btn-outline cursor-pointer">
                Tomar foto
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" disabled={photoBusy} onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            </div>
          )}
        </div>
        <button className="btn btn-signal w-full sm:w-auto" disabled={desc.trim().length < 10 || photoBusy || sending}>{sending ? "Enviando…" : "Enviar reporte"}</button>
      </form>
    </div>
  );
}
