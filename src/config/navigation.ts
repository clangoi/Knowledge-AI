import {
  Brain,
  Database,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: 'General' | 'Inteligencia artificial' | 'Sistema';
}

export const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Panel',
    description: 'Resumen general de la plataforma',
    icon: LayoutDashboard,
    section: 'General',
  },
  {
    path: '/archivos',
    label: 'Archivos',
    description: 'Repositorio documental de la empresa',
    icon: FolderOpen,
    section: 'General',
  },
  {
    path: '/rag',
    label: 'RAG',
    description: 'Colecciones de conocimiento y consultas',
    icon: Database,
    section: 'Inteligencia artificial',
  },
  {
    path: '/fine-tuning',
    label: 'Fine-tuning',
    description: 'Datasets y entrenamiento de modelos',
    icon: Brain,
    section: 'Inteligencia artificial',
  },
  {
    path: '/agentes',
    label: 'Agentes',
    description: 'Orquestación de agentes de IA',
    icon: Workflow,
    section: 'Inteligencia artificial',
  },
  {
    path: '/configuracion',
    label: 'Configuración',
    description: 'Preferencias, modelos y seguridad',
    icon: Settings,
    section: 'Sistema',
  },
];

export const navSections = ['General', 'Inteligencia artificial', 'Sistema'] as const;
