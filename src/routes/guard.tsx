import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/stayfix/AppShell";

export const Route = createFileRoute("/guard")({
  ssr: false,
  head: () => ({ meta: [{ title: "StayFix · Operación" }, { name: "description", content: "Dashboard operativo de incidencias." }, { property: "og:title", content: "StayFix · Operación" }, { property: "og:description", content: "Dashboard operativo de incidencias." }] }),
  component: () => <AppShell role="guardia" />,
});
