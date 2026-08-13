import type { PrototypeAppScreen } from "@/lib/prototype-app-routes";

export type PrototypeNavPhase = "idle" | "push" | "pop";

export type PrototypeNavTransition = {
  phase: Exclude<PrototypeNavPhase, "idle">;
  from: PrototypeAppScreen;
  to: PrototypeAppScreen;
};
