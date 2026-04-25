import type { QueryClient } from "@tanstack/react-query";
import type { AuthContextType } from "./contexts/auth.tsx";

declare module "@tanstack/react-router" {
  interface Context {
    queryClient: QueryClient;
    auth: AuthContextType | undefined;
  }
}
