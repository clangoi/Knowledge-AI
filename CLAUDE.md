# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Frontend de "Knowledge AI", una plataforma de conocimiento corporativo para una empresa **ficticia** (Nexora Industrial S.A.): archivos, RAG, fine-tuning y agentes de IA. Hoy es solo una **base visual**: no hay backend y ninguna acción funciona todavía. Toda la UI, los textos, las rutas y los comentarios están en español.

## Comandos

```bash
npm install
npm run dev        # Vite en http://localhost:5173 (abre el navegador)
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + vite build → dist/
npm run preview
npm run datasets   # regenera datasets/ (corpus, RAG, fine-tuning, agentes)
```

No hay linter ni tests configurados; `npm run typecheck` es la única verificación automática. Requiere Node.js 20+.

## Arquitectura

React 19 + TypeScript (strict) + Vite + React Router 7, iconos de `lucide-react`. Sin framework de estilos.

- **Rutas en dos sitios:** `src/App.tsx` define las `<Route>` (todas anidadas bajo `AppLayout`) y `src/config/navigation.ts` define `navItems`, que alimenta el Sidebar (agrupado por `section`), el breadcrumb del Topbar y los accesos del Dashboard. Al añadir o renombrar una página hay que tocar **ambos**.
- **Datos:** las páginas importan directamente desde `src/data/mock.ts` (archivos, carpetas y datasets de fine-tuning vienen del dataset generado; el resto son datos de ejemplo). `src/services/api.ts` es la capa pensada para el backend (simula latencia sobre los mismos mocks y lee `VITE_API_URL`), pero **aún no la usa ninguna página**. Al conectar el backend, lo previsto es migrar las páginas a `api.*` y reemplazar cada función simulada por su llamada HTTP.
- **Dataset (`datasets/`):** corpus ficticio de Nexora para el bootcamp. Todo lo que hay en `datasets/corpus`, `rag`, `fine-tuning` y `agentes` es **generado**: no se edita a mano. Las fuentes son `datasets/fuentes/` (Markdown con frontmatter y `rag/preguntas.json`) y el código de `scripts/datasets/`. `empresa.mjs` concentra los hechos y las reglas de negocio (topes, descuentos, aprobaciones); si cambias una regla, actualiza también el texto de la política correspondiente, porque las respuestas esperadas de fine-tuning y agentes se calculan desde `empresa.mjs`. El build es determinista (fecha fija y semilla) y falla si una `evidencia` de RAG no aparece literalmente en su documento. `src/data/mock.ts` lee `datasets/corpus/manifest.json` y `datasets/fine-tuning/resumen.json`, así que tras regenerar hay que correr `npm run typecheck`.
- **Tipos de dominio** en `src/types/index.ts`. Los estados son uniones de literales en español (`'indexado' | 'procesando' | ...`).
- **Marca y usuario demo** centralizados en `src/config/company.ts`; no escribirlos a mano en los componentes.
- **Acciones "próximamente":** `Button` acepta `soon`, que lo deshabilita y añade el tooltip "Disponible próximamente". Los inputs no funcionales se renderizan `disabled`. Mantener esta convención para cualquier acción que aún no tenga implementación.
- **`VisualWorkspace`** (`src/components/ui/`) es el contenedor reservado para cada herramienta visual (zona de carga, playground RAG, curva de entrenamiento, lienzo de agentes). Sin `children` muestra un estado vacío; la herramienta real se pasa como `children`.
- **Estilos:** un solo archivo, `src/styles/global.css`, con tokens de diseño como variables CSS en `:root` y clases estilo BEM (`workspace__header`, `btn--primary`). Usar los tokens en lugar de colores literales.

## Próximos pasos previstos (del README)

Backend/API de archivos → RAG (chunking, embeddings, base vectorial) → fine-tuning → lienzo de agentes interactivo (p. ej. React Flow) → autenticación y roles.
