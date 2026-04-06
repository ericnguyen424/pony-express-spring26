export default function Heading({ children }: React.PropsWithChildren) {
  return (
    <h2 className="text-3xl font-semibold text-center">
      {children}
    </h2>
  );
}
