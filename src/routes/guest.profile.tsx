import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "@/components/stayfix/Profile";

export const Route = createFileRoute("/guest/profile")({ component: Profile });
