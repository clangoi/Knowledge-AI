import { Save } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { company } from '../config/company';

export default function Settings() {
  return (
    <>
      <PageHeader
        title="Configuración"
        description="Parámetros generales de la plataforma. Los cambios aún no se guardan."
        actions={<Button soon icon={Save}>Guardar cambios</Button>}
      />

      <div className="grid grid--2">
        <Card title="General">
          <div className="form">
            <label className="field">
              <span>Nombre de la empresa</span>
              <input value={company.name} disabled readOnly />
            </label>
            <label className="field">
              <span>Idioma</span>
              <select disabled><option>Español</option></select>
            </label>
          </div>
        </Card>

        <Card title="Modelos de IA">
          <div className="form">
            <label className="field">
              <span>Proveedor de LLM</span>
              <select disabled><option>Sin configurar</option></select>
            </label>
            <label className="field">
              <span>Modelo de embeddings</span>
              <select disabled><option>text-embedding-large</option></select>
            </label>
          </div>
        </Card>

        <Card title="Almacenamiento">
          <div className="form">
            <label className="field">
              <span>Base de datos vectorial</span>
              <select disabled><option>Sin configurar</option></select>
            </label>
            <label className="field">
              <span>Almacenamiento de archivos</span>
              <select disabled><option>Local</option></select>
            </label>
          </div>
        </Card>

        <Card title="Seguridad y accesos">
          <div className="form">
            <label className="field">
              <span>Roles</span>
              <input value="Administrador, Editor, Lector" disabled readOnly />
            </label>
            <label className="field field--inline">
              <input type="checkbox" disabled />
              <span>Registrar auditoría de consultas a los agentes</span>
            </label>
          </div>
        </Card>
      </div>
    </>
  );
}
