import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  BarChart3, ClipboardList, Gauge, History, Home, Hourglass, LogOut, Menu, PlusCircle, User, Wrench, BedDouble, ListChecks, X,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { useStayFix } from "@/lib/stayfix/store";
import type { Role } from "@/lib/stayfix/types";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; exact?: boolean };

export const NAV: Record<Role, NavItem[]> = {
  huesped: [
    { to: "/guest", label: "Inicio", icon: Home, exact: true },
    { to: "/guest/incidents", label: "Mis incidencias", icon: ClipboardList },
    { to: "/guest/report", label: "Reportar incidencia", icon: PlusCircle },
    { to: "/guest/stay", label: "Mi estancia", icon: BedDouble },
    { to: "/guest/profile", label: "Mi perfil", icon: User },
  ],
  guardia: [
    { to: "/guard", label: "Dashboard", icon: Gauge, exact: true },
    { to: "/guard/incidents", label: "Incidencias", icon: ClipboardList },
    { to: "/guard/mine", label: "Mis incidencias", icon: ListChecks },
    { to: "/guard/pending", label: "Pendientes", icon: Hourglass },
    { to: "/guard/profile", label: "Mi perfil", icon: User },
  ],
  director: [
    { to: "/director", label: "Dashboard ejecutivo", icon: Gauge, exact: true },
    { to: "/director/incidents", label: "Incidencias", icon: ClipboardList },
    { to: "/director/history", label: "Histórico", icon: History },
    { to: "/director/performance", label: "Rendimiento", icon: BarChart3 },
    { to: "/director/profile", label: "Mi perfil", icon: User },
  ],
};

export const ROLE_LABEL: Record<Role, string> = { huesped: "Huésped", guardia: "Guardia / Operador", director: "Director" };

export function AppShell({ role }: { role: Role }) {
  const { me, setRole, role: current } = useStayFix();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  if (current !== role) setTimeout(() => setRole(role));

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV[role].map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: !!n.exact }}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          activeProps={{ className: "!bg-sidebar-accent !text-sidebar-foreground font-medium" }}
        >
          <n.icon className="size-4" />
          {n.label}
        </Link>
      ))}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar p-4 text-sidebar-foreground">
      <Link to="/" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid size-8 place-items-center rounded-md bg-signal text-signal-foreground"><Wrench className="size-4" /></span>
        <span className="text-lg font-semibold tracking-tight">StayFix</span>
      </Link>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted">{ROLE_LABEL[role]}</p>
      {nav}
      <div className="mt-auto border-t border-sidebar-border pt-4">
        <p className="px-3 text-sm font-medium">{me.name}</p>
        <p className="px-3 text-xs text-sidebar-muted">{me.email}</p>
        <button onClick={() => navigate({ to: "/" })} className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <LogOut className="size-4" /> Cambiar de rol
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15.5rem_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      <header className="flex items-center justify-between border-b bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <span className="flex items-center gap-2 font-semibold"><Wrench className="size-4 text-signal" /> StayFix</span>
        <button onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu className="size-5" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            {sidebar}
            <button className="absolute right-3 top-4 text-sidebar-foreground" onClick={() => setOpen(false)} aria-label="Cerrar"><X className="size-5" /></button>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
