import { File, FileSpreadsheet, FileText, Search, type LucideIcon } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { consultDocuments } from '../data/mock';
import type { FileType } from '../types';

const fileIcons: Record<FileType, LucideIcon> = {
  pdf: FileText,
  docx: FileText,
  md: FileText,
  txt: File,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  image: File,
};

export default function Documents() {
  return (
    <>
      <PageHeader
        title="Documentos"
        description="Políticas, manuales y procedimientos de consulta. Los documentos confidenciales no aparecen aquí."
      />

      <Card
        title="Documentos de consulta"
        subtitle={`${consultDocuments.length} documentos públicos e internos`}
        actions={
          <div className="search-input">
            <Search size={14} />
            <input placeholder="Buscar documento…" disabled />
          </div>
        }
        flush
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Área</th>
                <th>Clasificación</th>
                <th>Vigente desde</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {consultDocuments.map((doc) => {
                const Icon = fileIcons[doc.type];
                return (
                  <tr key={doc.id}>
                    <td>
                      <div className="file-name">
                        <span className={`file-icon file-icon--${doc.type}`}><Icon size={16} /></span>
                        {doc.name}
                      </div>
                    </td>
                    <td className="muted">{doc.folder}</td>
                    <td>
                      <Badge tone={doc.classification === 'Pública' ? 'success' : 'info'}>{doc.classification}</Badge>
                    </td>
                    <td className="muted">{doc.updatedAt}</td>
                    <td><Button soon size="sm" variant="ghost">Abrir</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
