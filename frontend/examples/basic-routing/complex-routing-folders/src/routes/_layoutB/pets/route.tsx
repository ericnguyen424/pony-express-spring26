import { Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import TitledSection from "../../../components/TitledSection.tsx";

export const Route = createFileRoute("/_layoutB/pets")({
  component: PetList,
});

function PetList() {
  return (
    <TitledSection id="pets" title="my pets">
      <ul className="flex flex-row space-x-4 border-b mb-4">
        <PetLink path="/chompers" text="chompers" />
        <PetLink path="/pondwater" text="pondwater" />
        <PetLink path="/cornpop" text="cornpop" />
        <PetLink path="/waffle-party" text="waffle party" />
      </ul>
      <Outlet />
    </TitledSection>
  );
}

function PetLink({ path, text }: { path: string; text: string }) {
  return (
    <Link
      to={"/pets" + path}
      className="px-2 py-1"
      activeProps={{
        className: "outline outline-fuchsia-500 shadow-fuchsia-600 shadow-md",
      }}
    >
      {text}
    </Link>
  );
}
