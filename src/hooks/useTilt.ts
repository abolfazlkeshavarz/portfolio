import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type TiltOptions = {
  /** Maximum rotation on each axis, in degrees. */
  max?: number;
  /** How far the card lifts toward the viewer while tracking, in px. */
  lift?: number;
  disabled?: boolean;
};

/**
 * Pointer-driven 3D tilt. Angles are written straight to CSS custom
 * properties on the element rather than through React state — a card under
 * the cursor would otherwise re-render the whole subtree every frame.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>({
  max = 8,
  lift = 14,
  disabled = false,
}: TiltOptions = {}) {
  const ref = useRef<T>(null);
  const frame = useRef<number | null>(null);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--lift', '0px');
    el.dataset.tilting = 'false';
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      // Touch taps shouldn't leave a card frozen mid-tilt.
      if (disabled || event.pointerType === 'touch') return;
      const el = ref.current;
      if (!el || frame.current !== null) return;

      const { clientX, clientY } = event;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const rect = el.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;

        el.style.setProperty('--ry', `${(px - 0.5) * 2 * max}deg`);
        el.style.setProperty('--rx', `${-(py - 0.5) * 2 * max}deg`);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        el.style.setProperty('--lift', `${lift}px`);
        el.dataset.tilting = 'true';
      });
    },
    [disabled, max, lift],
  );

  useEffect(() => reset, [reset]);

  return { ref, onPointerMove, onPointerLeave: reset };
}
