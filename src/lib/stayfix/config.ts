// Configurable catalogs. Kept as plain data so they can later be loaded from the database.
export type PriorityId = "critica" | "alta" | "media" | "baja";
export type StatusId =
  | "nueva"
  | "asignada"
  | "en_proceso"
  | "resuelta"
  | "pendiente_validacion"
  | "cerrada";
export type CategoryId =
  | "acceso" | "agua" | "electricidad" | "plomeria" | "limpieza" | "ropa_cama"
  | "electrodomesticos" | "climatizacion" | "internet" | "gas" | "mantenimiento" | "otros";

export const PRIORITIES: { id: PriorityId; label: string; order: number; slaMinutes: number; color: string }[] = [
  { id: "critica", label: "Crítica", order: 1, slaMinutes: 30, color: "bg-p-critica" },
  { id: "alta", label: "Alta", order: 2, slaMinutes: 60, color: "bg-p-alta" },
  { id: "media", label: "Media", order: 3, slaMinutes: 240, color: "bg-p-media" },
  { id: "baja", label: "Baja", order: 4, slaMinutes: 1440, color: "bg-p-baja" },
];

export const STATUSES: { id: StatusId; label: string; color: string }[] = [
  { id: "nueva", label: "Nueva", color: "bg-s-nueva" },
  { id: "asignada", label: "Asignada", color: "bg-s-asignada" },
  { id: "en_proceso", label: "En proceso", color: "bg-s-proceso" },
  { id: "resuelta", label: "Resuelta", color: "bg-s-resuelta" },
  { id: "pendiente_validacion", label: "Pendiente de validación", color: "bg-s-validacion" },
  { id: "cerrada", label: "Cerrada", color: "bg-s-cerrada" },
];

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "acceso", label: "Acceso" },
  { id: "agua", label: "Falta de agua" },
  { id: "electricidad", label: "Electricidad" },
  { id: "plomeria", label: "Plomería" },
  { id: "limpieza", label: "Limpieza" },
  { id: "ropa_cama", label: "Ropa de cama" },
  { id: "electrodomesticos", label: "Electrodomésticos" },
  { id: "climatizacion", label: "Climatización" },
  { id: "internet", label: "Internet" },
  { id: "gas", label: "Gas" },
  { id: "mantenimiento", label: "Mantenimiento general" },
  { id: "otros", label: "Otros" },
];

export const priority = (id: PriorityId) => PRIORITIES.find((p) => p.id === id)!;
export const status = (id: StatusId) => STATUSES.find((s) => s.id === id)!;
export const category = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;
export const OPEN_STATUSES: StatusId[] = ["nueva", "asignada", "en_proceso"];
