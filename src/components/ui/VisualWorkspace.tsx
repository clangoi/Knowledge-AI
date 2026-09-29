import type { ReactNode } from 'react';
import { Sparkles, type LucideIcon } from 'lucide-react';
import Badge from './Badge';

interface VisualWorkspaceProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  minHeight?: number;
  /** Controles propios de la herramienta (zoom, vista, etc.). */
  toolbar?: ReactNode;
  className?: string;
  /** Contenido de la herramienta. Si se omite, se muestra un estado vacío. */
  children?: ReactNode;
}

/**
 * Contenedor reservado para las herramientas visuales (lienzos, gráficas,
 * editores). Por ahora solo delimita el espacio y muestra una vista previa.
 */
export default function VisualWorkspace({
  title,
  description,
  icon: Icon = Sparkles,
  minHeight = 280,
  toolbar,
  className = '',
  children,
}: VisualWorkspaceProps) {
  return (
    <div className={`workspace ${className}`}>
      <div className="workspace__header">
        <div className="workspace__title">
          <Icon size={16} />
          {title}
        </div>
        <div className="workspace__tools">
          {toolbar}
          <Badge tone="primary">Vista previa</Badge>
        </div>
      </div>
      <div className="workspace__body" style={{ minHeight }}>
        {children ?? (
          <div className="workspace__empty">
            <div className="workspace__empty-icon">
              <Icon size={24} />
            </div>
            <strong>{title}</strong>
            <p>{description ?? 'Este espacio alojará la herramienta visual. Aún no es funcional.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
