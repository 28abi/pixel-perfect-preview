import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, CheckCircle2, Clock, Paperclip, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CATEGORIES, PRIORITIES, category, priority, status, type CategoryId, type PriorityId } from "@/lib/stayfix/config";
import { useStayFix } from "@/lib/stayfix/store";
import type { Role } from "@/lib/stayfix/types";
import { formatDate, formatDuration, resolutionMinutes, slaMinutes, TRANSITIONS } from "@/lib/stayfix/workflow";
import { Empty, PriorityBadge, SlaFlag, StatusBadge } from "./ui";

const BACK: Record<Role, string> = { huesped: "/guest/incidents", guardia: "/guard/incidents", director: "/director/incidents" };

export function IncidentDetail({ id, role }: { id: string; role: Role }) {
  const s = useStayFix();
  const inc = s.incidents.find((i) => i.id === id);
  const [comment, setComment] = useState("");
  const [resolution, setResolution] = useState(inc?.resolution ?? "");
      const [aiCategory, setAiCategory] = useState<CategoryId | null>(null);
  const [aiPriority, setAiPriority] = useState<PriorityId | null>(null);
  if (!inc) return <Empty>Incidencia no encontrada.</Empty>;

  const staff = role !== "huesped";
  const guest = s.user(inc.guestId)!;
  const prop = s.property(inc.propertyId);
  const guards = s.users.filter((u) => u.role === "guardia");
  const run = (fn: () => string | null | void, ok: string) => {
    const err = fn();
    if (err) toast.error(err); else toast.success(ok);
  };

    const transitions = TRANSITIONS[inc.status].filter((t) => t.roles.includes(role) && t.to !== "asignada");

  return (
    <div>
      <Link to={BACK[role]} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-primary">{inc.number}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{category(inc.category).label} · {prop.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge id={inc.status} /><PriorityBadge id={inc.priority} /><SlaFlag inc={inc} />
          </div>
        </div>
        {staff && (
          <div className="text-right text-xs text-muted-foreground">
            <p>Tiempo objetivo: <span className="font-mono text-foreground">{formatDuration(slaMinutes(inc))}</span></p>
            <p>Tiempo de resolución: <span className="font-mono text-foreground">{formatDuration(resolutionMinutes(inc))}</span></p>
          </div>
        )}
      </div>

      <StatusTrack current={inc.status} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold">Descripción</h2>
            <p className="mt-2 text-sm leading-relaxed">{inc.description}</p>
          </section>

          {/* Operator actions */}
          {role === "guardia" && inc.status !== "cerrada" && (
            <section className="panel space-y-4 p-5">
              <h2 className="text-sm font-semibold">Atención</h2>
              {!inc.assigneeId || inc.assigneeId !== s.me.id ? (
                <button className="btn btn-signal" onClick={() => run(() => s.assign(inc.id, s.me.id), "Te asignaste la incidencia")}>
                  {inc.assigneeId ? "Tomar incidencia (reasignar a mí)" : "Asignarme esta incidencia"}
                </button>
              ) : null}
              {(inc.status === "en_proceso" || inc.status === "resuelta") && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Descripción de la resolución</label>
                  <textarea className="field mt-1 min-h-24" value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Qué se encontró, qué se hizo y cómo se verificó." />
                  <button className="btn btn-outline mt-2" disabled={!resolution.trim()} onClick={() => run(() => s.saveResolution(inc.id, resolution.trim()), "Resolución guardada")}>Guardar resolución</button>
                </div>
              )}
              {transitions.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {transitions.map((t) => (
                    <button key={t.to} className="btn btn-primary" onClick={() => run(() => s.transition(inc.id, t.to), `Estado: ${status(t.to).label}`)}>
                      {t.to === "en_proceso" && inc.status === "resuelta" ? "Reabrir" : `Pasar a ${status(t.to).label}`}
                    </button>
                  ))}
                </div>
              )}
              <label className="btn btn-outline cursor-pointer">
                <Paperclip className="size-4" /> Adjuntar evidencia
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) run(() => s.addEvidence(inc.id, f.name), "Evidencia adjunta"); e.target.value = ""; }} />
              </label>
            </section>
          )}

          {/* Director validation */}
          {role === "director" && inc.status === "pendiente_validacion" && (
            <section className="panel space-y-3 border-s-validacion p-5">
              <h2 className="text-sm font-semibold">Validación de la resolución</h2>
              <p className="rounded-md bg-muted p-3 text-sm">{inc.resolution}</p>
              <textarea className="field min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas de validación (opcional para validar, requeridas para rechazar)" />
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={() => run(() => s.validate(inc.id, notes.trim()), "Incidencia validada y cerrada")}><CheckCircle2 className="size-4" /> Validar y cerrar</button>
                <button className="btn btn-outline" disabled={!notes.trim()} onClick={() => run(() => s.reject(inc.id, notes.trim()), "Devuelta a En proceso")}>Rechazar y devolver</button>
              </div>
            </section>
          )}

          {inc.resolution && !(role === "director" && inc.status === "pendiente_validacion") && role !== "guardia" && (
            <section className="panel p-5">
              <h2 className="text-sm font-semibold">Resolución</h2>
              <p className="mt-2 text-sm">{inc.resolution}</p>
              {inc.validation && <p className="mt-3 text-xs text-muted-foreground">Validada por {s.user(inc.validation.userId)?.name} · {formatDate(inc.validation.at)}</p>}
            </section>
          )}

          <section className="panel p-5">
            <h2 className="text-sm font-semibold">Comentarios</h2>
            <ul className="mt-3 space-y-3">
              {inc.comments.map((c) => (
                <li key={c.id} className="rounded-md bg-muted/60 p-3 text-sm">
                  <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{s.user(c.userId)?.name}</span> · {formatDate(c.at)}</p>
                  <p className="mt-1">{c.text}</p>
                </li>
              ))}
              {!inc.comments.length && <li className="text-sm text-muted-foreground">Sin comentarios.</li>}
            </ul>
            {inc.status !== "cerrada" && (
              <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!comment.trim()) return; s.addComment(inc.id, comment.trim()); setComment(""); }}>
                <input className="field" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un comentario…" />
                <button className="btn btn-primary" disabled={!comment.trim()}>Enviar</button>
              </form>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="text-sm font-semibold">Historial</h2>
            <ol className="relative mt-4 space-y-4 border-l pl-5">
              {[...inc.history].reverse().map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[1.6rem] top-1 size-2.5 rounded-full border-2 border-card bg-primary" />
                  <p className="text-sm">{h.detail}</p>
                  <p className="text-xs text-muted-foreground">{s.user(h.userId)?.name} · <span className="font-mono">{formatDate(h.at)}</span></p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="panel space-y-3 p-5 text-sm">
            <Info label="Huésped" value={guest.name} />
            {staff && <Info label="Contacto" value={`${guest.phone}${guest.extraPhones.length ? ` · ${guest.extraPhones.join(", ")}` : ""}`} />}
            <Info label="Propiedad" value={`${prop.name} — ${prop.address}`} />
            {staff ? (
              <>
                                <div>
                  <p className="text-xs text-muted-foreground">Responsable</p>
                  {role === "director" ? (
                    <select className="field mt-1" value={inc.assigneeId ?? ""} disabled={inc.status === "cerrada"} onChange={(e) => e.target.value && run(() => s.assign(inc.id, e.target.value), "Responsable actualizado")}>
                      <option value="">Sin asignar</option>
                      {guards.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  ) : (
                    <p className="font-medium">{s.user(inc.assigneeId)?.name ?? "Pendiente de asignar"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prioridad</p>
                  <select className="field mt-1" value={inc.priority} disabled={inc.status === "cerrada"} onChange={(e) => run(() => s.setPriority(inc.id, e.target.value as PriorityId), "Prioridad actualizada")}>
                    {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label} · SLA {formatDuration(p.slaMinutes)}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categoría</p>
                  <select className="field mt-1" value={inc.category} disabled={inc.status === "cerrada"} onChange={(e) => run(() => s.setCategory(inc.id, e.target.value as CategoryId), "Categoría actualizada")}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <Info label="Responsable" value={s.user(inc.assigneeId)?.name ?? "Pendiente de asignar"} />
            )}
          </section>

          <section className="panel space-y-2 p-5 text-xs">
            <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold"><Clock className="size-4" /> Tiempos</h2>
            <Time label="Creación" v={inc.createdAt} /><Time label="Asignación" v={inc.assignedAt} />
            <Time label="Inicio" v={inc.startedAt} /><Time label="Resolución" v={inc.resolvedAt} /><Time label="Cierre" v={inc.closedAt} />
          </section>

          <section className="panel p-5 text-sm">
            <h2 className="mb-2 flex items-center gap-1.5 font-semibold"><Paperclip className="size-4" /> Evidencia</h2>
            {inc.evidence.length ? (
              <ul className="space-y-1.5 text-xs">{inc.evidence.map((e) => <li key={e.id} className="flex justify-between gap-2"><span className="truncate font-medium">{e.name}</span><span className="text-muted-foreground">{formatDate(e.at)}</span></li>)}</ul>
            ) : <p className="text-xs text-muted-foreground">Sin evidencia.</p>}
          </section>

                    {staff && (
            <section className="panel border-dashed p-5 text-sm">
              <h2 className="flex items-center gap-1.5 font-semibold"><Sparkles className="size-4 text-signal" /> Sugerencia asistida</h2>
              {inc.ai ? (
                <div className="mt-2 space-y-3 text-xs">
                  <p>Categoría y prioridad sugeridas por IA. Revisa o modifica antes de aplicarlas.</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select className="field" value={aiCategory ?? inc.ai.category} disabled={inc.ai.state !== "pendiente" || inc.status === "cerrada"} onChange={(e) => setAiCategory(e.target.value as CategoryId)}>
                      {CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                    <select className="field" value={aiPriority ?? inc.ai.priority} disabled={inc.ai.state !== "pendiente" || inc.status === "cerrada"} onChange={(e) => setAiPriority(e.target.value as PriorityId)}>
                      {PRIORITIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                  <p className="text-muted-foreground">{inc.ai.rationale}</p>
                  {inc.ai.state === "pendiente" ? (
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary" disabled={inc.status === "cerrada"} onClick={() => run(() => s.applyAiSuggestion(inc.id, aiCategory ?? inc.ai!.category, aiPriority ?? inc.ai!.priority), "Clasificación aplicada")}>Aceptar y aplicar</button>
                      <button className="btn btn-outline" disabled={inc.status === "cerrada"} onClick={() => run(() => s.dismissAiSuggestion(inc.id), "Sugerencia descartada")}>Descartar</button>
                    </div>
                  ) : (
                    <p className="font-medium text-muted-foreground">{inc.ai.state === "aceptada" ? "Clasificación aplicada por una persona." : "Sugerencia descartada."}</p>
                  )}
                </div>
              ) : (
                <p className="mt-2 flex gap-2 text-xs text-muted-foreground"><Bot className="size-4 shrink-0" /> No hay sugerencia disponible. Solo asiste; las decisiones siempre las toma una persona.</p>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
function Time({ label, v }: { label: string; v: string | null }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-mono">{formatDate(v)}</span></div>;
}

const FLOW = ["nueva", "asignada", "en_proceso", "resuelta", "pendiente_validacion", "cerrada"] as const;
function StatusTrack({ current }: { current: (typeof FLOW)[number] }) {
  const idx = FLOW.indexOf(current);
  return (
    <ol className="grid grid-cols-3 gap-1 sm:grid-cols-6">
      {FLOW.map((f, i) => (
        <li key={f} className="text-[11px]">
          <span className={`block h-1.5 rounded-full ${i <= idx ? status(f).color : "bg-muted"}`} />
          <span className={`mt-1.5 block ${i === idx ? "font-semibold" : "text-muted-foreground"}`}>{status(f).label}</span>
        </li>
      ))}
    </ol>
  );
}
