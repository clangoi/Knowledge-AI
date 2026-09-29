// Capa de acceso a datos. Por ahora devuelve datos simulados; cuando exista el
// backend, sustituye cada función por la llamada HTTP correspondiente.
import * as mock from '../data/mock';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const simulate = <T,>(data: T, ms = 200) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), ms));

export const api = {
  files: {
    list: () => simulate(mock.files),
    folders: () => simulate(mock.folders),
    // upload: (file: File) => ...
  },
  rag: {
    collections: () => simulate(mock.collections),
    // query: (collectionId: string, question: string) => ...
  },
  fineTuning: {
    datasets: () => simulate(mock.datasets),
    jobs: () => simulate(mock.jobs),
    // createJob: (config) => ...
  },
  agents: {
    list: () => simulate(mock.agents),
    // runFlow: (flowId: string, input: string) => ...
  },
};
