import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Section from "../../components/Section.tsx";
import Heading from "../../components/Heading.tsx";

export const Route = createFileRoute("/_layoutB/pet-name")({
  component: PetName,
});

export default function PetName() {
  const [name, setName] = useState<string>("chompers");

  const changeName = () => {
    if (name === "chompers") {
      setName("pondwater");
    } else if (name === "pondwater") {
      setName("augustus");
    } else if (name === "augustus") {
      setName("ned");
    } else setName("chompers");
  };

  return (
    <Section id="pet-name">
      <Heading>
        say hello to my cat {name}
      </Heading>
      <button
        type="button"
        onClick={changeName}
        className="border-2 border-amber-800 bg-amber-400 px-4 py-1 hover:cursor-pointer"
      >
        change pet name
      </button>
    </Section>
  );
}
