import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}

export default function Badge({ tone = 'neutral', dot = false, children }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

/** Traduce los estados del dominio a un tono visual. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'indexado':
    case 'completado':
    case 'activo':
      return 'success';
    case 'procesando':
    case 'entrenando':
      return 'info';
    case 'pendiente':
    case 'en cola':
    case 'borrador':
      return 'warning';
    case 'error':
    case 'fallido':
      return 'danger';
    default:
      return 'neutral';
  }
}
