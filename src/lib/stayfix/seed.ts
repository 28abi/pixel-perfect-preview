import type { CategoryId, PriorityId, StatusId } from "./config";
import type { Incident, Property, Stay, User } from "./types";

export const USERS: User[] = [
  { id: "g1", role: "huesped", name: "Laura Méndez Ortiz", email: "laura.mendez@correo.com", phone: "+52 55 1234 5678", extraPhones: ["+52 55 8765 4321"] },
  { id: "g2", role: "huesped", name: "Daniel Hoffmann", email: "d.hoffmann@mail.de", phone: "+49 151 2345 678", extraPhones: [] },
  { id: "g3", role: "huesped", name: "Sofía Ramírez", email: "sofia.rmz@correo.com", phone: "+52 33 9988 7766", extraPhones: [] },
  { id: "o1", role: "guardia", name: "Carlos Ruiz", email: "carlos.ruiz@stayfix.mx", phone: "+52 55 4000 1001", extraPhones: [] },
  { id: "o2", role: "guardia", name: "Mariana Vega", email: "mariana.vega@stayfix.mx", phone: "+52 55 4000 1002", extraPhones: [] },
  { id: "d1", role: "director", name: "Ana Torres", email: "ana.torres@stayfix.mx", phone: "+52 55 4000 2000", extraPhones: [] },
];

export const CURRENT_USER: Record<string, string> = { huesped: "g1", guardia: "o1", director: "d1" };

export const PROPERTIES: Property[] = [
  { id: "p1", name: "Casa Roma 214", address: "Colima 214, Roma Nte., CDMX" },
  { id: "p2", name: "Loft Condesa 8B", address: "Amsterdam 88, Condesa, CDMX" },
  { id: "p3", name: "Depto. Polanco 12", address: "Horacio 1200, Polanco, CDMX" },
  { id: "p4", name: "Suite Coyoacán", address: "Francisco Sosa 45, Coyoacán, CDMX" },
];

const day = 86400000;
const iso = (base: number, minAgo: number) => new Date(base - minAgo * 60000).toISOString();

export function buildSeed(now = Date.now()) {
  const stays: Stay[] = [
    { id: "s1", guestId: "g1", propertyId: "p1", checkIn: new Date(now - 2 * day).toISOString(), checkOut: new Date(now + 4 * day).toISOString() },
    { id: "s0", guestId: "g1", propertyId: "p3", checkIn: new Date(now - 60 * day).toISOString(), checkOut: new Date(now - 55 * day).toISOString() },
    { id: "s2", guestId: "g2", propertyId: "p2", checkIn: new Date(now - 1 * day).toISOString(), checkOut: new Date(now + 6 * day).toISOString() },
    { id: "s3", guestId: "g3", propertyId: "p4", checkIn: new Date(now - 3 * day).toISOString(), checkOut: new Date(now + 2 * day).toISOString() },
  ];

  type Row = [string, string, CategoryId, PriorityId, StatusId, string | null, number, number | null, string?];
  // [guest, stay, cat, prio, status, assignee, createdMinAgo, resolvedAfterMin, description]
  const rows: Row[] = [
    ["g2", "s2", "gas", "critica", "nueva", null, 12, null, "Huele a gas cerca de la estufa al entrar a la cocina."],
    ["g1", "s1", "agua", "alta", "asignada", "o2", 75, null, "No sale agua en la regadera ni en el lavabo del baño principal."],
    ["g3", "s3", "acceso", "alta", "en_proceso", "o1", 40, null, "La cerradura electrónica no reconoce el código de acceso."],
    ["g1", "s1", "internet", "media", "en_proceso", "o1", 320, null, "El WiFi se desconecta cada pocos minutos."],
    ["g2", "s2", "climatizacion", "media", "nueva", null, 95, null, "El aire acondicionado de la recámara no enfría."],
        ["g3", "s3", "ropa_cama", "baja", "resuelta", "o2", 600, 180, "Faltan toallas y una funda de almohada."],
    ["g1", "s1", "electrodomesticos", "media", "resuelta", "o1", 1500, 210, "La cafetera no enciende."],
    ["g2", "s2", "electricidad", "alta", "cerrada", "o1", 2900, 50, "Se fue la luz en la sala y el comedor."],
    ["g3", "s3", "plomeria", "media", "cerrada", "o2", 4300, 300, "El inodoro tiene una fuga constante."],
    ["g1", "s0", "limpieza", "baja", "cerrada", "o2", 82000, 600, "La terraza no estaba limpia a la llegada."],
    ["g2", "s2", "mantenimiento", "baja", "cerrada", "o1", 5800, 1800, "Una puerta del clóset está descolgada."],
    ["g3", "s3", "agua", "critica", "cerrada", "o1", 3600, 25, "Sin agua en todo el departamento."],
    ["g1", "s0", "climatizacion", "alta", "cerrada", "o2", 80000, 140, "La calefacción no funciona."],
    ["g2", "s2", "internet", "media", "cerrada", "o2", 7200, 200, "No hay señal de internet en toda la casa."],
    ["g3", "s3", "gas", "critica", "cerrada", "o1", 9000, 45, "El calentador no prende, posible problema de gas."],
    ["g1", "s1", "electrodomesticos", "baja", "asignada", "o2", 900, null, "El microondas hace un ruido extraño."],
  ];

  const incidents: Incident[] = rows.map((r, i) => {
    const [guestId, stayId, cat, prio, st, assignee, ago, resAfter, desc] = r;
    const stay = stays.find((s) => s.id === stayId)!;
    const created = iso(now, ago);
    const assignedAt = assignee ? iso(now, ago - Math.min(8, ago / 4)) : null;
    const startedAt = st !== "nueva" && st !== "asignada" ? iso(now, ago - Math.min(12, ago / 3)) : null;
    const resolvedAt = resAfter != null ? iso(now, ago - resAfter) : null;
    const closed = st === "cerrada";
    const closedAt = closed ? iso(now, ago - resAfter! - 30) : null;
    const history: Incident["history"] = [
      { id: `h${i}a`, type: "creada", userId: guestId, at: created, detail: "Incidencia reportada por el huésped" },
    ];
    if (assignee && assignedAt) history.push({ id: `h${i}b`, type: "asignada", userId: assignee, at: assignedAt, detail: `Asignada a ${USERS.find((u) => u.id === assignee)!.name}` });
    if (startedAt) history.push({ id: `h${i}c`, type: "inicio", userId: assignee!, at: startedAt, detail: "Inicio de atención" });
    if (resolvedAt) {
      history.push({ id: `h${i}d`, type: "resolucion", userId: assignee!, at: resolvedAt, detail: "Resolución registrada" });
      history.push({ id: `h${i}e`, type: "estado", userId: assignee!, at: resolvedAt, detail: "Enviada a validación" });
    }
    if (closedAt) {
      history.push({ id: `h${i}f`, type: "validacion", userId: "d1", at: closedAt, detail: "Resolución validada" });
      history.push({ id: `h${i}g`, type: "cierre", userId: "d1", at: closedAt, detail: "Incidencia cerrada" });
    }
    return {
      id: `inc${i + 1}`,
      number: `SF-${String(1000 + rows.length - i).padStart(4, "0")}`,
      guestId, stayId, propertyId: stay.propertyId,
      description: desc ?? "",
      category: cat, priority: prio, status: st,
      assigneeId: assignee, createdAt: created, assignedAt, startedAt, resolvedAt, closedAt,
      resolution: resolvedAt ? "Se revisó el problema en sitio y se corrigió. Se verificó con el huésped." : null,
      validation: closedAt ? { userId: "d1", at: closedAt, notes: "Conforme." } : null,
      evidence: resolvedAt ? [{ id: `e${i}`, name: "foto_resolucion.jpg", userId: assignee!, at: resolvedAt }] : [],
      comments: st === "en_proceso" ? [{ id: `c${i}`, userId: assignee!, text: "En camino a la propiedad.", at: startedAt! }] : [],
      history,
      ai: null,
    };
  });

  return { stays, incidents };
}
