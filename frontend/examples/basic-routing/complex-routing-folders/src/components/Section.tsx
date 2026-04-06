export default function Section(
  { id, children }: React.PropsWithChildren<{ id: string | null }>,
) {
  return (
    <section
      id={id || undefined}
      className="border-3 border-indigo-800 p-4 space-y-2"
    >
      {children}
    </section>
  );
}
