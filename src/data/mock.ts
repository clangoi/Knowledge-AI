// Datos de ejemplo para maquetar las vistas. Se reemplazarán por la API real.
import type {
  ActivityItem,
  Agent,
  Dataset,
  FineTuneJob,
  Folder,
  KnowledgeFile,
  RagCollection,
  RetrievedChunk,
} from '../types';

export const folders: Folder[] = [
  { id: 'f1', name: 'Legal', count: 214 },
  { id: 'f2', name: 'Finanzas', count: 387 },
  { id: 'f3', name: 'Recursos Humanos', count: 156 },
  { id: 'f4', name: 'Operaciones', count: 298 },
  { id: 'f5', name: 'Comercial', count: 229 },
];

export const files: KnowledgeFile[] = [
  { id: 'd1', name: 'Contrato marco proveedores 2026.pdf', type: 'pdf', size: '2.4 MB', folder: 'Legal', owner: 'Luis Méndez', updatedAt: 'Hace 2 h', status: 'indexado' },
  { id: 'd2', name: 'Presupuesto anual Q3.xlsx', type: 'xlsx', size: '860 KB', folder: 'Finanzas', owner: 'Carla Ruiz', updatedAt: 'Hace 5 h', status: 'procesando' },
  { id: 'd3', name: 'Manual de onboarding.docx', type: 'docx', size: '1.1 MB', folder: 'Recursos Humanos', owner: 'Ana Torres', updatedAt: 'Ayer', status: 'indexado' },
  { id: 'd4', name: 'Procedimiento de mantenimiento L2.pdf', type: 'pdf', size: '5.7 MB', folder: 'Operaciones', owner: 'Jorge Paz', updatedAt: 'Ayer', status: 'pendiente' },
  { id: 'd5', name: 'Diagrama planta norte.png', type: 'image', size: '3.2 MB', folder: 'Operaciones', owner: 'Jorge Paz', updatedAt: 'Hace 3 días', status: 'error' },
  { id: 'd6', name: 'Política de viáticos.pdf', type: 'pdf', size: '420 KB', folder: 'Recursos Humanos', owner: 'Ana Torres', updatedAt: 'Hace 1 semana', status: 'indexado' },
  { id: 'd7', name: 'Notas reunión comercial.txt', type: 'txt', size: '12 KB', folder: 'Comercial', owner: 'Sofía León', updatedAt: 'Hace 1 semana', status: 'indexado' },
];

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

export const datasets: Dataset[] = [
  { id: 'ds1', name: 'Soporte interno - tickets', examples: 12_400, format: 'JSONL (chat)', updatedAt: 'Hace 2 días' },
  { id: 'ds2', name: 'Clasificación de contratos', examples: 3_150, format: 'JSONL (instrucción)', updatedAt: 'Hace 1 semana' },
  { id: 'ds3', name: 'Resúmenes financieros', examples: 1_870, format: 'JSONL (chat)', updatedAt: 'Hace 2 semanas' },
];

export const jobs: FineTuneJob[] = [
  { id: 'ft-0192', name: 'nexora-soporte-v3', baseModel: 'llm-base-8b', dataset: 'Soporte interno - tickets', status: 'entrenando', progress: 64, startedAt: 'Hoy 09:12' },
  { id: 'ft-0188', name: 'nexora-legal-v1', baseModel: 'llm-base-8b', dataset: 'Clasificación de contratos', status: 'completado', progress: 100, startedAt: 'Hace 3 días' },
  { id: 'ft-0185', name: 'nexora-finanzas-v2', baseModel: 'llm-base-3b', dataset: 'Resúmenes financieros', status: 'fallido', progress: 38, startedAt: 'Hace 5 días' },
  { id: 'ft-0193', name: 'nexora-soporte-v4', baseModel: 'llm-base-8b', dataset: 'Soporte interno - tickets', status: 'en cola', progress: 0, startedAt: '—' },
];

export const agents: Agent[] = [
  { id: 'a1', name: 'Orquestador', role: 'Enruta cada solicitud al agente adecuado', model: 'llm-general', tools: ['router', 'memoria'], status: 'activo' },
  { id: 'a2', name: 'Agente Legal', role: 'Analiza contratos y cláusulas', model: 'nexora-legal-v1', tools: ['rag:contratos', 'resumen'], status: 'activo' },
  { id: 'a3', name: 'Agente Finanzas', role: 'Responde sobre presupuestos y gastos', model: 'llm-general', tools: ['rag:finanzas', 'hoja de cálculo'], status: 'borrador' },
  { id: 'a4', name: 'Agente Soporte', role: 'Atiende dudas internas de empleados', model: 'nexora-soporte-v3', tools: ['rag:políticas', 'tickets'], status: 'inactivo' },
];

export const activity: ActivityItem[] = [
  { id: 'e1', module: 'Archivos', text: 'Luis Méndez subió «Contrato marco proveedores 2026.pdf»', time: 'Hace 2 h' },
  { id: 'e2', module: 'Fine-tuning', text: 'Inició el entrenamiento de nexora-soporte-v3', time: 'Hace 3 h' },
  { id: 'e3', module: 'RAG', text: 'La colección «Manuales técnicos» se está reindexando', time: 'Hace 4 h' },
  { id: 'e4', module: 'Agentes', text: 'Se publicó el flujo «Consulta legal» v1.2', time: 'Ayer' },
];
