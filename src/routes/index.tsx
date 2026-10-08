import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BedDouble, Briefcase, ShieldCheck, Wrench } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StayFix — Elige tu acceso" },
      { name: "description", content: "Accede a StayFix como huésped, guardia u operador, o director para gestionar incidencias." },
      { property: "og:title", content: "StayFix — Gestión de incidencias de mantenimiento" },
      { property: "og:description", content: "Reporte, asignación, resolución y validación de incidencias en un flujo trazable." },
    ],
  }),
  component: Index,
});

const ROLES = [
  { to: "/guest", title: "Huésped", desc: "Reporta un problema en tu estancia y sigue su avance.", icon: BedDouble },
  { to: "/guard", title: "Guardia / Operador", desc: "Atiende, resuelve y documenta incidencias en tiempo real.", icon: ShieldCheck },
  { to: "/director", title: "Director", desc: "Valida resoluciones y analiza tiempos y rendimiento.", icon: Briefcase },
] as const;

const FLOW = ["Reporte", "Registro", "Priorización", "Asignación", "Atención", "Resolución", "Validación", "Cierre"];

function Index() {
  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-signal text-signal-foreground"><Wrench className="size-5" /></span>
          <span className="text-xl font-semibold tracking-tight">StayFix</span>
        </div>
        <div className="my-auto py-14">
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Cada incidencia, registrada, atendida y validada.
          </h1>
          <ol className="mt-6 flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs text-sidebar-muted">
            {FLOW.map((f, i) => (
              <li key={f}>{f}{i < FLOW.length - 1 && <span className="ml-2 text-signal">→</span>}</li>
            ))}
          </ol>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {ROLES.map((r) => (
              <Link key={r.to} to={r.to} className="group rounded-lg border border-sidebar-border bg-sidebar-accent p-6 transition-colors hover:border-signal">
                <r.icon className="size-6 text-signal" />
                <h2 className="mt-4 text-lg font-semibold">{r.title}</h2>
                <p className="mt-1 text-sm text-sidebar-muted">{r.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-signal">Entrar <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-muted">Versión de demostración · los datos se guardan en este navegador.</p>
      </div>
    </div>
  );
}
