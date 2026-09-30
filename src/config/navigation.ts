import {
  Brain,
  Database,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '../types';

export type NavSection = 'General' | 'Inteligencia artificial' | 'Sistema' | 'Mi espacio';

export interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: NavSection;
  /** Rol que ve esta sección en el menú (y puede entrar a su ruta). */
  role: Role;
}

export const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Panel',
    description: 'Resumen general de la plataforma',
    icon: LayoutDashboard,
    section: 'General',
    role: 'admin',
  },
  {
    path: '/archivos',
    label: 'Archivos',
    description: 'Repositorio documental de la empresa',
    icon: FolderOpen,
    section: 'General',
    role: 'admin',
  },
  {
    path: '/rag',
    label: 'RAG',
    description: 'Colecciones de conocimiento y consultas',
    icon: Database,
    section: 'Inteligencia artificial',
    role: 'admin',
  },
  {
    path: '/fine-tuning',
    label: 'Fine-tuning',
    description: 'Datasets y entrenamiento de modelos',
    icon: Brain,
    section: 'Inteligencia artificial',
    role: 'admin',
  },
  {
    path: '/agentes',
    label: 'Agentes',
    description: 'Orquestación y publicación de agentes de IA',
    icon: Workflow,
    section: 'Inteligencia artificial',
    role: 'admin',
  },
  {
    path: '/configuracion',
    label: 'Configuración',
    description: 'Preferencias, modelos y seguridad',
    icon: Settings,
    section: 'Sistema',
    role: 'admin',
  },
  {
    path: '/asistentes',
    label: 'Asistentes',
    description: 'Conversa con los asistentes de IA publicados',
    icon: MessagesSquare,
    section: 'Mi espacio',
    role: 'usuario',
  },
  {
    path: '/documentos',
    label: 'Documentos',
    description: 'Políticas, manuales y documentos de consulta',
    icon: FileText,
    section: 'Mi espacio',
    role: 'usuario',
  },
];

export const navSections: NavSection[] = ['Mi espacio', 'General', 'Inteligencia artificial', 'Sistema'];

export const navItemsFor = (role: Role) => navItems.filter((item) => item.role === role);
