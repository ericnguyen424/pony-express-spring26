import { createFileRoute } from "@tanstack/react-router";
import { SubmitEvent, useState } from "react";
import TitledSection from "../../components/TitledSection.tsx";

export const Route = createFileRoute("/_layoutB/colors")({
  component: Colors,
});

function Colors() {
  const [colors, setColors] = useState<string[]>(
    ["orange", "magenta", "turquoise", "papayawhip", "chartreuse"],
  );

  const addColor = (color: string) => {
    setColors([...colors, color]);
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  return (
    <TitledSection id="colors" title="colors!!">
      <ColorList colors={colors} removeColor={removeColor} />
      <ColorForm addColor={addColor} />
    </TitledSection>
  );
}

function ColorList(
  { colors, removeColor }: {
    colors: string[];
    removeColor: (color: string) => void;
  },
) {
  return (
    <ul id="color-list" className="max-w-md mx-auto">
      {...colors.map((color) => (
        <ColorItem key={color} color={color} removeColor={removeColor} />
      ))}
    </ul>
  );
}

function ColorItem(
  { color, removeColor }: {
    color: string;
    removeColor: (color: string) => void;
  },
) {
  return (
    <li
      style={{ backgroundColor: color }}
      className="px-4 py-2 flex justify-between"
    >
      <span>{color}</span>
      <button
        type="button"
        onClick={() => removeColor(color)}
        className="hover:cursor-pointer"
      >
        X
      </button>
    </li>
  );
}

function ColorForm(
  { addColor }: { addColor: (color: string) => void },
) {
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const color = data.get("new-color");
    if (color) {
      addColor(color as string);
    }
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-3xs mx-auto">
      <label htmlFor="new-color">add a color to the list</label>
      <input name="new-color" type="text" className="border px-2 py-1" />
    </form>
  );
}
