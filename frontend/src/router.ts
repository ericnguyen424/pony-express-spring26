import { QueryClient } from "@tanstack/react-query";
import type { AuthContextType } from "./contexts/auth.tsx";

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContextType | undefined;
}
