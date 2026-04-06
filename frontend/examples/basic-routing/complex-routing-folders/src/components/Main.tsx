export default function Main({ children }: React.PropsWithChildren) {
  return (
    <main className="w-full px-4">
      <h1 className="text-4xl font-extrabold text-center text-fuchsia-950 py-4">
        my cool react app
      </h1>
      {children}
    </main>
  );
}
