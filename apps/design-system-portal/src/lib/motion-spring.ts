export type SpringConfig = {
  stiffness: number;
  damping: number;
  mass?: number;
};

export const MOTION_SPRING_STANDARD: SpringConfig = {
  stiffness: 300,
  damping: 22,
  mass: 1,
};

export function runSpringSimulation({
  config = MOTION_SPRING_STANDARD,
  from = 0,
  to = 1,
  onUpdate,
  onComplete,
}: {
  config?: SpringConfig;
  from?: number;
  to?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}) {
  const mass = config.mass ?? 1;
  const target = to;
  let value = from;
  let velocity = 0;
  let lastTime = performance.now();
  let frameId = 0;

  onUpdate(value);

  const step = (now: number) => {
    const delta = Math.min((now - lastTime) / 1000, 0.032);
    lastTime = now;

    const acceleration =
      (-config.stiffness * (value - target) - config.damping * velocity) /
      mass;
    velocity += acceleration * delta;
    value += velocity * delta;
    onUpdate(value);

    if (Math.abs(velocity) > 0.0005 || Math.abs(value - target) > 0.0005) {
      frameId = requestAnimationFrame(step);
      return;
    }

    onUpdate(target);
    onComplete?.();
  };

  frameId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frameId);
}
