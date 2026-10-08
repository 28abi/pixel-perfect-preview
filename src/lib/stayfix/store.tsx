import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CategoryId, PriorityId, StatusId } from "./config";
import { category, priority, status } from "./config";
import { buildSeed, CURRENT_USER, PROPERTIES, USERS } from "./seed";
import type { HistoryType, Incident, Role, Stay, User } from "./types";
import { canTransition } from "./workflow";
import { requestAiClassification } from "./ai-classification";


// Local data layer. Every mutation goes through these actions so it can later be swapped for backend calls.
const KEY = "stayfix:v1";
type Data = { stays: Stay[]; incidents: Incident[] };

const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

interface Ctx {
  role: Role;
  setRole: (r: Role) => void;
  me: User;
  users: User[];
  stays: Stay[];
  incidents: Incident[];
  user: (id: string | null) => User | undefined;
  property: (id: string) => (typeof PROPERTIES)[number];
    createIncident: (input: { stayId: string; description: string; category: CategoryId }) => Promise<Incident>;

  assign: (id: string, userId: string) => void;
  setPriority: (id: string, p: PriorityId) => void;
    setCategory: (id: string, c: CategoryId) => void;
  applyAiSuggestion: (id: string, category: CategoryId, priority: PriorityId) => string | null;
  dismissAiSuggestion: (id: string) => string | null;
  transition: (id: string, to: StatusId) => string | null;
  saveResolution: (id: string, text: string) => void;
  validate: (id: string, notes: string) => void;
  reject: (id: string, notes: string) => void;
  addComment: (id: string, text: string) => void;
  addEvidence: (id: string, name: string) => void;
  resetDemo: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StayFixProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(() => buildSeed());
  const [role, setRoleState] = useState<Role>("huesped");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(JSON.parse(raw));
      const r = localStorage.getItem(KEY + ":role") as Role | null;
      if (r) setRoleState(r);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)); }, [data]);

  const setRole = (r: Role) => { setRoleState(r); localStorage.setItem(KEY + ":role", r); };
  const me = USERS.find((u) => u.id === CURRENT_USER[role])!;
  const user = useCallback((id: string | null) => USERS.find((u) => u.id === id), []);
  const property = useCallback((id: string) => PROPERTIES.find((p) => p.id === id)!, []);

  const mutate = useCallback(
    (id: string, fn: (i: Incident) => Incident, ev?: { type: HistoryType; detail: string }) => {
      setData((d) => ({
        ...d,
        incidents: d.incidents.map((i) => {
          if (i.id !== id) return i;
          const next = fn(i);
          return ev ? { ...next, history: [...next.history, { id: uid(), userId: me.id, at: nowIso(), ...ev }] } : next;
        }),
      }));
    },
    [me.id],
  );

  const value = useMemo<Ctx>(() => {
    const get = (id: string) => data.incidents.find((i) => i.id === id)!;
    return {
      role, setRole, me, users: USERS, stays: data.stays, incidents: data.incidents, user, property,
            createIncident: async ({ stayId, description, category: cat }) => {

        const stay = data.stays.find((s) => s.id === stayId)!;
        const max = Math.max(1000, ...data.incidents.map((i) => Number(i.number.slice(3))));
        const at = nowIso();
        const inc: Incident = {
          id: uid(), number: `SF-${max + 1}`, guestId: me.id, stayId, propertyId: stay.propertyId,
          description, category: cat, priority: "media", status: "nueva", assigneeId: null,
          createdAt: at, assignedAt: null, startedAt: null, resolvedAt: null, closedAt: null,
          resolution: null, validation: null, evidence: [], comments: [],
          history: [{ id: uid(), type: "creada", userId: me.id, at, detail: "Incidencia reportada por el huésped" }],
          ai: null, // future: automated suggestion of category/priority with rationale
        };
                setData((d) => ({ ...d, incidents: [inc, ...d.incidents] }));

        const suggestion = await requestAiClassification(description);
        if (suggestion) {
          const ai: Incident["ai"] = {
            category: suggestion.category,
            priority: suggestion.priority,
            rationale: suggestion.rationale,
            state: "pendiente",
          };
          setData((d) => ({
            ...d,
            incidents: d.incidents.map((item) => item.id === inc.id ? { ...item, ai } : item),
          }));
          return { ...inc, ai };
        }

        return inc;
      },

            assign: (id, userId) => {
        if (role === "guardia" && userId !== me.id) return "Un guardia solo puede asignarse la incidencia a sí mismo";
        if (role !== "director" && role !== "guardia") return "No tienes permiso para asignar incidencias";
        const assignee = USERS.find((u) => u.id === userId);
        if (!assignee || assignee.role !== "guardia") return "Solo se puede asignar a un guardia";
        const inc = get(id);
        const name = assignee.name;
        const re = !!inc.assigneeId;
        mutate(id, (i) => ({
          ...i, assigneeId: userId, assignedAt: nowIso(),
          status: i.status === "nueva" ? "asignada" : i.status,
        }), { type: re ? "reasignada" : "asignada", detail: re ? `Reasignada a ${name}` : `Asignada a ${name}` });
      },
            setPriority: (id, p) => mutate(id, (i) => ({ ...i, priority: p }), { type: "prioridad", detail: `Prioridad cambiada a ${priority(p).label}` }),
      setCategory: (id, c) => mutate(id, (i) => ({ ...i, category: c }), { type: "categoria", detail: `Categoría cambiada a ${category(c).label}` }),
      applyAiSuggestion: (id, nextCategory, nextPriority) => {
        if (role !== "director" && role !== "guardia") return "No tienes permiso para decidir sobre la sugerencia";
        const inc = get(id);
        if (!inc.ai || inc.ai.state !== "pendiente") return "La sugerencia ya no está pendiente";
        mutate(id, (i) => ({
          ...i,
          category: nextCategory,
          priority: nextPriority,
          ai: i.ai ? { ...i.ai, category: nextCategory, priority: nextPriority, state: "aceptada" } : null,
        }), { type: "categoria", detail: `Clasificación asistida aplicada: ${category(nextCategory).label} · ${priority(nextPriority).label}` });
        return null;
      },
      dismissAiSuggestion: (id) => {
        if (role !== "director" && role !== "guardia") return "No tienes permiso para descartar la sugerencia";
        const inc = get(id);
        if (!inc.ai || inc.ai.state !== "pendiente") return "La sugerencia ya no está pendiente";
        mutate(id, (i) => ({ ...i, ai: i.ai ? { ...i.ai, state: "descartada" } : null }));
        return null;
      },
      transition: (id, to) => {
        const err = canTransition(get(id), to, role);
        if (err) return err;
        const at = nowIso();
        mutate(id, (i) => ({
          ...i, status: to,
          startedAt: to === "en_proceso" && !i.startedAt ? at : i.startedAt,
          resolvedAt: to === "resuelta" ? at : i.resolvedAt,
          closedAt: to === "cerrada" ? at : i.closedAt,
        }), {
          type: to === "en_proceso" && !get(id).startedAt ? "inicio" : to === "cerrada" ? "cierre" : "estado",
          detail: `Estado: ${status(get(id).status).label} → ${status(to).label}`,
        });
        return null;
      },
      saveResolution: (id, text) => mutate(id, (i) => ({ ...i, resolution: text }), { type: "resolucion", detail: "Resolución registrada" }),
      validate: (id, notes) => {
        const at = nowIso();
        mutate(id, (i) => ({ ...i, validation: { userId: me.id, at, notes } }), { type: "validacion", detail: notes ? `Resolución validada: ${notes}` : "Resolución validada" });
        // Closing only happens after the validation record exists.
        mutate(id, (i) => (i.validation ? { ...i, status: "cerrada", closedAt: at } : i), { type: "cierre", detail: "Incidencia cerrada" });
      },
      reject: (id, notes) => mutate(id, (i) => ({ ...i, status: "en_proceso", validation: null, resolvedAt: null }), { type: "rechazo", detail: `Validación rechazada: ${notes || "sin notas"}` }),
      addComment: (id, text) => mutate(id, (i) => ({ ...i, comments: [...i.comments, { id: uid(), userId: me.id, text, at: nowIso() }] }), { type: "comentario", detail: text }),
      addEvidence: (id, name) => mutate(id, (i) => ({ ...i, evidence: [...i.evidence, { id: uid(), name, userId: me.id, at: nowIso() }] }), { type: "evidencia", detail: `Evidencia adjunta: ${name}` }),
      resetDemo: () => setData(buildSeed()),
    };
  }, [data, role, me, user, property, mutate]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStayFix() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStayFix outside provider");
  return c;
}
