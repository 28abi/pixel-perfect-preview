import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/stayfix/AppShell";

export const Route = createFileRoute("/guest")({
  ssr: false,
  head: () => ({ meta: [{ title: "StayFix · Huésped" }, { name: "description", content: "Reporta y consulta tus incidencias." }, { property: "og:title", content: "StayFix · Huésped" }, { property: "og:description", content: "Reporta y consulta tus incidencias." }] }),
  component: () => <AppShell role="huesped" />,
});
