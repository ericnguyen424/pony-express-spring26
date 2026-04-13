import { createFileRoute } from "@tanstack/react-router";
import TitledSection from "../../components/TitledSection.tsx";

export const Route = createFileRoute("/_layoutB/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TitledSection id="welcome" title="this application is very cool" />;
}
