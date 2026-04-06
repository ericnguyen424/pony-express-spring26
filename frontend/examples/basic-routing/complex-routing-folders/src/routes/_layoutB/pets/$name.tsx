import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layoutB/pets/$name")({
  component: PetComponent,
});

function PetComponent() {
  const { name } = Route.useParams();
  const details = getPetDetails(name);

  return PetDetails(details);
}

interface Details {
  name: string;
  typ: string;
  age: number;
}

function PetDetails(details: Details) {
  return (
    <>
      <h2 className="text-2xl font-semibold text-center">{details.name}</h2>
      <table className="border-collapse border w-3/4 table-fixed mx-auto">
        <thead>
          <tr>
            <Col text="name" />
            <Col text="type" />
            <Col text="age" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <Cell text={details.name} />
            <Cell text={details.typ} />
            <Cell text={details.age} />
          </tr>
        </tbody>
      </table>
    </>
  );
}

function Col({ text }: { text: string }) {
  return <th className="border py-2">{text}</th>;
}

function Cell({ text }: { text: string | number }) {
  return <td className="border p-4 text-center">{text}</td>;
}

const getPetDetails = (name: string): Details => {
  if (name === "chompers") {
    return {
      name,
      typ: "cat",
      age: 4,
    };
  } else if (name === "pondwater") {
    return {
      name,
      typ: "cat",
      age: 2,
    };
  } else if (name === "cornpop") {
    return {
      name,
      typ: "turtle",
      age: 12,
    };
  } else if (name === "waffle-party") {
    return {
      name: "waffle party",
      typ: "dog",
      age: 3,
    };
  } else {
    return {
      name,
      typ: "???",
      age: 0,
    };
  }
};
