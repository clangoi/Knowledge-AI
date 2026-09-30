# Knowledge AI · Nexora Industrial S.A.

Plataforma (ficticia) de conocimiento corporativo: gestión de archivos, RAG,
fine-tuning y orquestación de agentes de IA.

> **Estado:** base visual. Las pantallas y los espacios de las herramientas
> visuales están maquetados con datos de ejemplo, pero **ninguna acción es
> funcional** todavía (los botones están deshabilitados con el tooltip
> "Disponible próximamente").

## Requisitos

- Node.js 20 o superior (incluye npm)

## Puesta en marcha

```bash
npm install
npm run dev
```

La app se abre en http://localhost:5173.

## Stack

- React 19 + TypeScript
- Vite
- React Router 7
- lucide-react (iconos)
- CSS plano con variables (sin framework de estilos)

## Estructura

```
src/
├── components/
│   ├── layout/        # AppLayout, Sidebar, Topbar
│   └── ui/            # Button, Badge, Card, StatCard, PageHeader, VisualWorkspace
├── config/
│   ├── company.ts     # Datos de la empresa ficticia y usuario demo
│   └── navigation.ts  # Rutas / menú lateral
├── data/mock.ts       # Datos de ejemplo
├── pages/             # Una página por módulo
│   ├── Dashboard.tsx
│   ├── Files.tsx      # Gestión de archivos
│   ├── Rag.tsx        # Colecciones, pipeline y playground RAG
│   ├── FineTuning.tsx # Datasets, curva de entrenamiento y trabajos
│   ├── Agents.tsx     # Lienzo de orquestación de agentes
│   └── Settings.tsx
├── services/api.ts    # Capa de datos (hoy simula respuestas con los mocks)
├── styles/global.css  # Tokens de diseño y estilos
└── types/index.ts     # Modelos de dominio
```

## Dataset para el bootcamp

`datasets/` contiene 47 archivos empresariales ficticios de Nexora (PDF, DOCX,
XLSX, CSV, TXT y MD), 75 preguntas de evaluación para RAG, tres datasets de
fine-tuning y 15 escenarios para agentes. La pantalla de Archivos de la app
muestra este corpus. Detalles en [datasets/README.md](datasets/README.md).

Para regenerarlo después de editar las fuentes:

```bash
npm run datasets
```

## Espacios visuales

`VisualWorkspace` (`src/components/ui/VisualWorkspace.tsx`) es el contenedor
reservado para cada herramienta visual. Sin `children` muestra un estado vacío;
con `children` aloja la herramienta real:

| Módulo      | Espacio visual                                  |
|-------------|-------------------------------------------------|
| Panel       | Métricas de uso                                 |
| Archivos    | Zona de carga (drag & drop)                     |
| RAG         | Playground de consultas con citas               |
| Fine-tuning | Curva de entrenamiento                          |
| Agentes     | Lienzo de flujos (nodos + conexiones)           |

## Próximos pasos sugeridos

1. Backend / API (subida de archivos, extracción de texto).
2. RAG: chunking, embeddings, base vectorial y consultas.
3. Fine-tuning: carga y validación de datasets, lanzamiento de trabajos.
4. Agentes: lienzo interactivo (p. ej. React Flow) y motor de ejecución.
5. Autenticación y roles.
