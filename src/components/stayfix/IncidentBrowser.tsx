import { useMemo, useState } from "react";
import { CATEGORIES, PRIORITIES, STATUSES, priority } from "@/lib/stayfix/config";
import type { Incident } from "@/lib/stayfix/types";
import { IncidentTable } from "./ui";

/** Filterable incident list for staff roles. */
export function IncidentBrowser({ items, base }: { items: Incident[]; base: "/guard/incidents" | "/director/incidents" }) {
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [pr, setPr] = useState("");
  const [cat, setCat] = useState("");
  const list = useMemo(
    () =>
      items
        .filter((i) => (!st || i.status === st) && (!pr || i.priority === pr) && (!cat || i.category === cat))
        .filter((i) => !q || `${i.number} ${i.description}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => priority(a.priority).order - priority(b.priority).order || b.createdAt.localeCompare(a.createdAt)),
    [items, q, st, pr, cat],
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-4">
        <input className="field" placeholder="Buscar número o descripción" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field" value={st} onChange={(e) => setSt(e.target.value)}><option value="">Todos los estados</option>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        <select className="field" value={pr} onChange={(e) => setPr(e.target.value)}><option value="">Todas las prioridades</option>{PRIORITIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        <select className="field" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Todas las categorías</option>{CATEGORIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
      </div>
      <IncidentTable items={list} base={base} />
    </div>
  );
}
