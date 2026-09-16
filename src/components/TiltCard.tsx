import type { ReactNode } from 'react';
import { useTilt } from '../hooks/useTilt';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Outer perspective wrapper — useful for grid sizing. */
  sceneClassName?: string;
  max?: number;
  lift?: number;
};

export function TiltCard({ children, className = '', sceneClassName = '', max, lift }: TiltCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>({
    max,
    lift,
    disabled: reducedMotion,
  });

  return (
    <div className={`scene ${sceneClassName}`}>
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={`card3d relative ${className}`}
      >
        {children}
        <span className="sheen" />
      </div>
    </div>
  );
}
