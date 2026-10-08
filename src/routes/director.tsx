import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/stayfix/AppShell";

export const Route = createFileRoute("/director")({
  ssr: false,
  head: () => ({ meta: [{ title: "StayFix · Dirección" }, { name: "description", content: "Dashboard ejecutivo y validación de incidencias." }, { property: "og:title", content: "StayFix · Dirección" }, { property: "og:description", content: "Dashboard ejecutivo y validación de incidencias." }] }),
  component: () => <AppShell role="director" />,
});
