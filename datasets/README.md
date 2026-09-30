# Dataset de Nexora Industrial S.A.

Conjunto de archivos empresariales **ficticios** para practicar, en el bootcamp, las herramientas de Knowledge AI: gestión de archivos, RAG, fine-tuning y agentes.

Nexora es un fabricante de bombas centrífugas y válvulas industriales con unas 320 personas en tres sedes (Oficinas centrales, Planta Norte y Planta Sur). Todos los nombres, empresas, cifras y correos (`@nexora-industrial.example`) son inventados. La **fecha de corte** del dataset es el **30 de septiembre de 2026**: úsala como "hoy" en cualquier cálculo.

## Contenido

```
datasets/
├── corpus/                     # 47 archivos reales, por área
│   ├── legal/  finanzas/  recursos-humanos/  operaciones/  comercial/
│   └── manifest.json           # índice con metadatos de cada archivo
├── rag/preguntas.jsonl         # 75 preguntas de evaluación con fuentes
├── fine-tuning/
│   ├── soporte-interno/        # train.jsonl / validation.jsonl (chat)
│   ├── clasificacion-clausulas/ # (instrucción)
│   ├── resumenes-financieros/  # (chat)
│   └── resumen.json
├── agentes/escenarios.jsonl    # 15 tareas de varios pasos con respuesta esperada
└── fuentes/                    # fuentes editables (no las uses como corpus)
```

### Corpus

| Formato | Archivos | Qué contiene |
|---|---|---|
| PDF | 18 | Políticas, contratos, manuales, fichas técnicas, informe trimestral |
| DOCX | 9 | Procedimientos, plantillas, propuesta comercial, acta del comité |
| XLSX | 8 | Estado de resultados, presupuesto, ventas, plantilla de personal, inventario, contratos, precios, producción |
| CSV | 6 | Cuentas por pagar, gastos de viaje, órdenes de mantenimiento, incidentes, pipeline, proveedores |
| TXT / MD | 6 | Correos, bitácora de turno, notas de reunión, preguntas frecuentes |

Los documentos se relacionan entre sí igual que en una empresa real. Por ejemplo, la política de viáticos fija los topes que el CSV de gastos de viaje a veces incumple, y el informe trimestral explica una desviación que aparece en el presupuesto y que el acta del comité aprueba. Las cifras de los documentos de texto coinciden con las de las hojas de cálculo.

`manifest.json` describe cada archivo: `id`, `ruta`, `area`, `formato`, `tipo` (`documento` o `datos`), `codigo`, `version`, `fecha`, `responsable`, `clasificacion` (Pública, Interna, Confidencial) y `descripcion`. Los PDF incluyen además sus `secciones` con número de página, y los archivos de datos incluyen sus `hojas`, `columnas` y número de `filas`.

### RAG: `rag/preguntas.jsonl`

Una pregunta por línea:

```json
{"id": "q001", "tipo": "factual", "dificultad": "baja",
 "pregunta": "¿En cuántos días hábiles debo reportar mis gastos de viaje?",
 "respuesta": "En un plazo máximo de 10 días hábiles posteriores al regreso, con el formulario F-203.",
 "fuentes": [{"documento": "fin-politica-viaticos", "ruta": "corpus/finanzas/Política de viáticos.pdf",
              "seccion": "Reporte y comprobación", "pagina": 2,
              "evidencia": "reportarse en un plazo máximo de 10 días hábiles posteriores al regreso"}]}
```

Tipos de pregunta:

- `factual` (65): la respuesta está en un solo documento.
- `multi-documento` (6): hay que combinar dos o más documentos.
- `sin-respuesta` (3) y `premisa-falsa` (1): el sistema debe decir que no lo sabe o corregir la premisa, en lugar de inventar.

Cada `evidencia` es un fragmento literal del documento (verificado al generar el dataset), útil para medir el *recall* de la recuperación.

### Fine-tuning: `fine-tuning/<tarea>/{train,validation}.jsonl`

| Tarea | Formato | Ejemplos | Descripción |
|---|---|---|---|
| `soporte-interno` | chat (`messages`) | 234 | Preguntas de empleados y respuestas basadas en las políticas |
| `clasificacion-clausulas` | instrucción (`instruccion`, `entrada`, `salida`) | 254 | Cláusulas contractuales etiquetadas con 10 categorías |
| `resumenes-financieros` | chat (`messages`) | 198 | Cifras por centro de costo y su resumen redactado |

El formato chat es compatible con las APIs de fine-tuning más comunes (`{"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}`). La división train/validation es 85/15.

### Agentes: `agentes/escenarios.jsonl`

Cada escenario trae `tarea`, `documentos`/`archivos` necesarios, `herramientas_sugeridas`, `pasos_esperados`, `respuesta_esperada` y `criterios_evaluacion`. Van de nivel básico (filtrar y sumar una tabla) a avanzado (cruzar un contrato, una política y un CSV para calcular una penalización). Las respuestas esperadas se calculan a partir de los datos, así que son exactas.

> Para instructores: `respuesta_esperada` contiene la solución. Si los alumnos van a resolver los escenarios, compárteles solo `tarea` y `documentos`.

## Ideas de ejercicios

- **Archivos:** extraer texto de PDF, DOCX y XLSX; clasificar documentos por área o nivel de confidencialidad; detectar documentos Confidenciales antes de indexarlos.
- **RAG:** comparar estrategias de *chunking* (por sección frente a tamaño fijo); medir *recall@k* con las evidencias; evaluar si el sistema responde "no lo sé" en las preguntas `sin-respuesta`; citar página y sección.
- **Fine-tuning:** entrenar el asistente de soporte y compararlo con RAG sobre las mismas políticas; medir la exactitud del clasificador de cláusulas en `validation`.
- **Agentes:** construir herramientas (`buscar_documentos`, `leer_tabla`, `calcular`) y evaluar los 15 escenarios contra `respuesta_esperada`.

## Regenerar el dataset

Los archivos de `corpus/`, `rag/`, `fine-tuning/` y `agentes/` se generan a partir de `fuentes/` y de `scripts/datasets/`:

```bash
npm run datasets
```

La generación es determinista: con las mismas fuentes produce exactamente los mismos archivos. Para cambiar algo:

- **Texto de un documento:** edita su Markdown en `fuentes/documentos/<área>/`. El frontmatter define el título, el nombre del archivo, el formato de salida (`pdf`, `docx`, `txt` o `md`) y los metadatos.
- **Reglas y hechos de la empresa** (topes, descuentos, aprobaciones, personas): `scripts/datasets/empresa.mjs`. Si cambias una regla, actualiza también el texto de la política correspondiente.
- **Datos de las hojas de cálculo:** `scripts/datasets/datos.mjs`.
- **Preguntas de RAG:** `fuentes/rag/preguntas.json`. El build falla si una `evidencia` no aparece literalmente en su documento.
- **Informe trimestral y acta del comité:** se generan desde los datos en `scripts/datasets/documentos-dinamicos.mjs`, para que sus cifras siempre cuadren.
