// Modelos de dominio compartidos por toda la aplicación.

export type FileType = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'md' | 'txt' | 'image';
export type IndexStatus = 'indexado' | 'procesando' | 'pendiente' | 'error';
export type JobStatus = 'completado' | 'entrenando' | 'en cola' | 'fallido';
export type AgentStatus = 'activo' | 'inactivo' | 'borrador';
export type Classification = 'Pública' | 'Interna' | 'Confidencial';

// Roles de la plataforma: el administrador gestiona archivos, colecciones,
// modelos y agentes; el usuario (funcionario) usa los asistentes publicados.
export type Role = 'admin' | 'usuario';

export interface User {
  id: string;
  nombre: string;
  iniciales: string;
  puesto: string;
  area: string;
  sede: string;
  rol: Role;
}

export interface Folder {
  id: string;
  name: string;
  count: number;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  folder: string;
  owner: string;
  updatedAt: string;
  status: IndexStatus;
  classification: Classification;
}

export interface RagCollection {
  id: string;
  name: string;
  documents: number;
  chunks: number;
  embeddingModel: string;
  status: IndexStatus;
}

export interface RetrievedChunk {
  id: string;
  source: string;
  page: number;
  score: number;
  text: string;
}

export interface Dataset {
  id: string;
  name: string;
  examples: number;
  format: string;
  updatedAt: string;
}

export interface FineTuneJob {
  id: string;
  name: string;
  baseModel: string;
  dataset: string;
  status: JobStatus;
  progress: number;
  startedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  tools: string[];
  status: AgentStatus;
  /** Visible para los usuarios en «Asistentes». */
  published: boolean;
  /** Presentación para los usuarios y preguntas de ejemplo (del set de RAG). */
  greeting: string;
  examples: string[];
}

export interface ActivityItem {
  id: string;
  module: 'Archivos' | 'RAG' | 'Fine-tuning' | 'Agentes';
  text: string;
  time: string;
}
