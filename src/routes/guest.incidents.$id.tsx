import { createFileRoute } from "@tanstack/react-router";
import { IncidentDetail } from "@/components/stayfix/IncidentDetail";

export const Route = createFileRoute("/guest/incidents/$id")({
  component: () => <IncidentDetail id={Route.useParams().id} role="huesped" />,
});
