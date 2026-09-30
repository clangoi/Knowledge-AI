// Datos de ejemplo para maquetar las vistas. Se reemplazarán por la API real.
import manifest from '../../datasets/corpus/manifest.json';
import resumenFineTuning from '../../datasets/fine-tuning/resumen.json';
import type {
  ActivityItem,
  Agent,
  Classification,
  Dataset,
  FileType,
  FineTuneJob,
  Folder,
  KnowledgeFile,
  RagCollection,
  RetrievedChunk,
} from '../types';

// Archivos y carpetas salen del corpus de datasets/ (se genera con `npm run datasets`).
const areas = [...new Set(manifest.archivos.map((a) => a.area_nombre))];

export const folders: Folder[] = areas.map((name, i) => ({
  id: `f${i + 1}`,
  name,
  count: manifest.archivos.filter((a) => a.area_nombre === name).length,
}));

const tamano = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });

// El corpus aún no está indexado (no hay backend), por eso todos quedan "pendiente".
export const files: KnowledgeFile[] = [...manifest.archivos]
  .sort((a, b) => b.fecha.localeCompare(a.fecha))
  .map((a) => ({
    id: a.id,
    name: a.archivo,
    type: a.formato as FileType,
    size: tamano(a.bytes),
    folder: a.area_nombre,
    owner: a.responsable,
    updatedAt: fecha(a.fecha),
    status: 'pendiente',
    classification: a.clasificacion as Classification,
  }));

// Lo que un usuario puede consultar: documentos (no hojas de datos) que no sean Confidenciales.
export const consultDocuments = files.filter(
  (f) => manifest.archivos.find((a) => a.id === f.id)?.tipo === 'documento' && f.classification !== 'Confidencial',
);

export const collections: RagCollection[] = [
  { id: 'c1', name: 'Políticas internas', documents: 142, chunks: 5_830, embeddingModel: 'text-embedding-large', status: 'indexado' },
  { id: 'c2', name: 'Contratos y legal', documents: 214, chunks: 12_410, embeddingModel: 'text-embedding-large', status: 'indexado' },
  { id: 'c3', name: 'Manuales técnicos', documents: 98, chunks: 7_902, embeddingModel: 'text-embedding-small', status: 'procesando' },
  { id: 'c4', name: 'Base comercial', documents: 61, chunks: 2_144, embeddingModel: 'text-embedding-small', status: 'pendiente' },
];

export const retrievedChunks: RetrievedChunk[] = [
  { id: 'r1', source: 'Política de viáticos.pdf', page: 4, score: 0.91, text: 'Los gastos de viaje deberán reportarse en un plazo máximo de 10 días hábiles posteriores al regreso…' },
  { id: 'r2', source: 'Política de viáticos.pdf', page: 6, score: 0.87, text: 'El reembolso se realizará en la siguiente quincena, previa aprobación del jefe directo…' },
  { id: 'r3', source: 'Manual de onboarding.docx', page: 12, score: 0.72, text: 'Para solicitudes de reembolso utiliza el formulario F-203 disponible en el portal interno…' },
];

const NOMBRES_DATASET: Record<string, string> = {
  'soporte-interno': 'Soporte interno',
  'clasificacion-clausulas': 'Clasificación de cláusulas',
  'resumenes-financieros': 'Resúmenes financieros',
};

// Datasets de datasets/fine-tuning (resumen generado por `npm run datasets`).
export const datasets: Dataset[] = Object.entries(resumenFineTuning).map(([id, d]) => ({
  id,
  name: NOMBRES_DATASET[id] ?? id,
  examples: d.train + d.validation,
  format: d.formato === 'chat' ? 'JSONL (chat)' : 'JSONL (instrucción)',
  updatedAt: fecha(manifest.fecha_corte),
}));

export const jobs: FineTuneJob[] = [
  { id: 'ft-0192', name: 'nexora-soporte-v3', baseModel: 'llm-base-8b', dataset: 'Soporte interno', status: 'entrenando', progress: 64, startedAt: 'Hoy 09:12' },
  { id: 'ft-0188', name: 'nexora-legal-v1', baseModel: 'llm-base-8b', dataset: 'Clasificación de cláusulas', status: 'completado', progress: 100, startedAt: 'Hace 3 días' },
  { id: 'ft-0185', name: 'nexora-finanzas-v2', baseModel: 'llm-base-3b', dataset: 'Resúmenes financieros', status: 'fallido', progress: 38, startedAt: 'Hace 5 días' },
  { id: 'ft-0193', name: 'nexora-soporte-v4', baseModel: 'llm-base-8b', dataset: 'Soporte interno', status: 'en cola', progress: 0, startedAt: '—' },
];

// Los ejemplos de cada asistente salen de datasets/rag/preguntas.jsonl.
export const agents: Agent[] = [
  {
    id: 'a1', name: 'Orquestador', role: 'Enruta cada solicitud al agente adecuado', model: 'llm-general',
    tools: ['router', 'memoria'], status: 'activo', published: false,
    greeting: '', examples: [],
  },
  {
    id: 'a2', name: 'Agente Legal', role: 'Analiza contratos y cláusulas', model: 'nexora-legal-v1',
    tools: ['rag:contratos', 'resumen'], status: 'activo', published: true,
    greeting: 'Te ayudo con contratos, el Código de ética, aprobaciones y protección de datos.',
    examples: [
      '¿Cuál es el valor máximo de un regalo que puedo aceptar de un proveedor?',
      '¿Un contrato de 12,000 USD necesita revisión de Legal?',
      '¿Cuánto tiempo duran las obligaciones de confidencialidad de un NDA?',
    ],
  },
  {
    id: 'a3', name: 'Agente Finanzas', role: 'Responde sobre presupuestos y gastos', model: 'llm-general',
    tools: ['rag:finanzas', 'hoja de cálculo'], status: 'borrador', published: false,
    greeting: '', examples: [],
  },
  {
    id: 'a4', name: 'Agente Soporte', role: 'Atiende dudas internas de empleados', model: 'nexora-soporte-v3',
    tools: ['rag:políticas', 'tickets'], status: 'activo', published: true,
    greeting: 'Resuelvo tus dudas sobre vacaciones, viáticos, beneficios, teletrabajo y trámites de RR. HH.',
    examples: [
      '¿En cuántos días hábiles debo reportar mis gastos de viaje?',
      '¿Cuántos días de vacaciones me tocan si cumplo 3 años en la empresa?',
      '¿Cuántos días a la semana puedo hacer teletrabajo?',
    ],
  },
  {
    id: 'a5', name: 'Agente Operaciones', role: 'Consulta procedimientos de planta y seguridad', model: 'llm-general',
    tools: ['rag:manuales', 'cmms'], status: 'activo', published: true,
    greeting: 'Consulto manuales de mantenimiento, seguridad industrial, emergencias y fichas técnicas.',
    examples: [
      '¿Cuál es la presión neumática correcta en los equipos de la Línea 2?',
      '¿A partir de qué altura se necesita permiso de trabajo?',
      '¿Dónde es el punto de reunión de Planta Norte?',
    ],
  },
];

export const activity: ActivityItem[] = [
  { id: 'e1', module: 'Archivos', text: 'Luis Méndez subió «Contrato marco proveedores 2026.pdf»', time: 'Hace 2 h' },
  { id: 'e2', module: 'Fine-tuning', text: 'Inició el entrenamiento de nexora-soporte-v3', time: 'Hace 3 h' },
  { id: 'e3', module: 'RAG', text: 'La colección «Manuales técnicos» se está reindexando', time: 'Hace 4 h' },
  { id: 'e4', module: 'Agentes', text: 'Se publicó el flujo «Consulta legal» v1.2', time: 'Ayer' },
];
