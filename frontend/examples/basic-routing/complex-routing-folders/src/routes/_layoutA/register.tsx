import { createFileRoute } from "@tanstack/react-router";
import Heading from "../../components/Heading.tsx";
import Section from "../../components/Section.tsx";

export const Route = createFileRoute("/_layoutA/register")({
  component: Registration,
});

function Registration() {
  return (
    <Section id="registration-form">
      <Heading>
        register new account
      </Heading>
      <form className="max-w-2xs mx-auto flex flex-col space-y-4">
        <div id="username-input" className="flex flex-col">
          <label htmlFor="username">username</label>
          <input
            name="username"
            type="text"
            className="border px-2 py-1"
          />
        </div>

        <div id="password-input" className="flex flex-col">
          <label htmlFor="password">password</label>
          <input
            name="password"
            type="password"
            className="border px-2 py-1"
          />
        </div>

        <div id="password-input" className="flex space-x-2">
          <input
            name="remember"
            type="checkbox"
          />
          <label htmlFor="remember">Remember me next time</label>
        </div>

        <button
          type="submit"
          className="border py-1 bg-indigo-200 hover:cursor-pointer"
        >
          register
        </button>
      </form>
    </Section>
  );
}
