import Heading from "./Heading.tsx";
import Section from "./Section.tsx";

interface TitledSectionProps {
  id: string | null;
  title: string;
}

export default function TitledSection(
  { id, title, children }: React.PropsWithChildren<TitledSectionProps>,
) {
  return (
    <Section id={id}>
      <Heading>
        {title}
      </Heading>
      {children}
    </Section>
  );
}
