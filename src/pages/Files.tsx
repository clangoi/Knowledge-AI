import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  FolderPlus,
  LayoutGrid,
  List,
  MoreHorizontal,
  Search,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import Badge, { statusTone } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import VisualWorkspace from '../components/ui/VisualWorkspace';
import { files, folders } from '../data/mock';
import type { FileType } from '../types';

const fileIcons: Record<FileType, LucideIcon> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  image: FileImage,
  txt: File,
};

export default function Files() {
  return (
    <>
      <PageHeader
        title="Gestión de archivos"
        description="Repositorio documental de la empresa. Los archivos indexados alimentan las colecciones RAG."
        actions={
          <>
            <Button soon variant="secondary" icon={FolderPlus}>Nueva carpeta</Button>
            <Button soon icon={Upload}>Subir archivos</Button>
          </>
        }
      />

      <div className="grid grid--sidebar">
        <Card title="Carpetas" flush>
          <ul className="list">
            <li className="list__item list__item--active">
              <Folder size={16} />
              <span>Todos los archivos</span>
              <span className="list__count">1,284</span>
            </li>
            {folders.map((folder) => (
              <li key={folder.id} className="list__item">
                <Folder size={16} />
                <span>{folder.name}</span>
                <span className="list__count">{folder.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="stack">
          <VisualWorkspace
            title="Zona de carga"
            icon={Upload}
            minHeight={160}
            description="Arrastra archivos aquí para subirlos, extraer su texto e indexarlos."
          />

          <Card
            title="Documentos"
            subtitle={`${files.length} archivos recientes`}
            flush
            actions={
              <>
                <div className="search-input">
                  <Search size={14} />
                  <input placeholder="Buscar archivo…" disabled />
                </div>
                <Button soon size="sm" variant="secondary" icon={Filter}>Filtros</Button>
                <div className="segmented">
                  <button className="segmented__item segmented__item--active" disabled><List size={14} /></button>
                  <button className="segmented__item" disabled><LayoutGrid size={14} /></button>
                </div>
              </>
            }
          >
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Carpeta</th>
                    <th>Propietario</th>
                    <th>Tamaño</th>
                    <th>Modificado</th>
                    <th>Indexación</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => {
                    const Icon = fileIcons[file.type];
                    return (
                      <tr key={file.id}>
                        <td>
                          <div className="file-name">
                            <span className={`file-icon file-icon--${file.type}`}><Icon size={16} /></span>
                            {file.name}
                          </div>
                        </td>
                        <td className="muted">{file.folder}</td>
                        <td className="muted">{file.owner}</td>
                        <td className="muted">{file.size}</td>
                        <td className="muted">{file.updatedAt}</td>
                        <td><Badge dot tone={statusTone(file.status)}>{file.status}</Badge></td>
                        <td>
                          <button className="icon-btn icon-btn--sm" disabled title="Próximamente">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
