import { describe, expect, it, vi } from "vitest";
import { runSpringSimulation } from "./motion-spring";

describe("runSpringSimulation", () => {
  it("overshoots the target before settling", async () => {
    vi.useFakeTimers();

    const values: number[] = [];
    runSpringSimulation({
      onUpdate: (value) => values.push(value),
    });

    for (let index = 0; index < 120; index += 1) {
      await vi.advanceTimersByTimeAsync(16);
    }

    expect(values.length).toBeGreaterThan(0);
    expect(Math.max(...values)).toBeGreaterThan(1);
    expect(values.at(-1)).toBe(1);

    vi.useRealTimers();
  });

  it("supports springing back to the origin", async () => {
    vi.useFakeTimers();

    const values: number[] = [];
    runSpringSimulation({
      from: 1,
      to: 0,
      onUpdate: (value) => values.push(value),
    });

    for (let index = 0; index < 120; index += 1) {
      await vi.advanceTimersByTimeAsync(16);
    }

    expect(values.at(-1)).toBe(0);

    vi.useRealTimers();
  });
});
