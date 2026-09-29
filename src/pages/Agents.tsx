import {
  Bot,
  Brain,
  Database,
  GitBranch,
  Hand,
  Maximize2,
  MessageSquare,
  MousePointer2,
  Play,
  Plus,
  Save,
  Send,
  Workflow,
  Wrench,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import Badge, { statusTone } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import VisualWorkspace from '../components/ui/VisualWorkspace';
import { agents } from '../data/mock';

type NodeKind = 'input' | 'router' | 'agent' | 'rag' | 'model' | 'output';

interface FlowNode {
  id: string;
  kind: NodeKind;
  label: string;
  detail: string;
  x: number;
  y: number;
}

const NODE_W = 180;
const NODE_H = 64;

const kindIcons: Record<NodeKind, LucideIcon> = {
  input: MessageSquare,
  router: GitBranch,
  agent: Bot,
  rag: Database,
  model: Brain,
  output: Send,
};

// Flujo de ejemplo estático: solo ilustra cómo se verá el orquestador.
const nodes: FlowNode[] = [
  { id: 'n1', kind: 'input', label: 'Entrada', detail: 'Mensaje del usuario', x: 30, y: 168 },
  { id: 'n2', kind: 'router', label: 'Orquestador', detail: 'Clasifica la intención', x: 260, y: 168 },
  { id: 'n3', kind: 'agent', label: 'Agente Legal', detail: 'nexora-legal-v1', x: 500, y: 58 },
  { id: 'n4', kind: 'agent', label: 'Agente Finanzas', detail: 'llm-general', x: 500, y: 278 },
  { id: 'n5', kind: 'rag', label: 'RAG · Contratos', detail: 'top-k = 5', x: 740, y: 58 },
  { id: 'n6', kind: 'rag', label: 'RAG · Finanzas', detail: 'top-k = 3', x: 740, y: 278 },
  { id: 'n7', kind: 'output', label: 'Respuesta', detail: 'Síntesis + citas', x: 980, y: 168 },
];

const edges: [string, string][] = [
  ['n1', 'n2'],
  ['n2', 'n3'],
  ['n2', 'n4'],
  ['n3', 'n5'],
  ['n4', 'n6'],
  ['n5', 'n7'],
  ['n6', 'n7'],
];

const palette: { kind: NodeKind; label: string }[] = [
  { kind: 'agent', label: 'Agente' },
  { kind: 'router', label: 'Enrutador' },
  { kind: 'rag', label: 'Recuperador RAG' },
  { kind: 'model', label: 'Modelo ajustado' },
  { kind: 'input', label: 'Entrada' },
  { kind: 'output', label: 'Salida' },
];

function edgePath(fromId: string, toId: string) {
  const a = nodes.find((n) => n.id === fromId)!;
  const b = nodes.find((n) => n.id === toId)!;
  const x1 = a.x + NODE_W;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x;
  const y2 = b.y + NODE_H / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

export default function Agents() {
  const canvasToolbar = (
    <div className="segmented">
      {[MousePointer2, Hand, ZoomIn, ZoomOut, Maximize2].map((Icon, i) => (
        <button key={i} className={`segmented__item ${i === 0 ? 'segmented__item--active' : ''}`} disabled>
          <Icon size={14} />
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Orquestación de agentes"
        description="Diseña flujos donde varios agentes colaboran usando RAG, modelos ajustados y herramientas."
        actions={
          <>
            <Button soon variant="secondary" icon={Save}>Guardar</Button>
            <Button soon variant="secondary" icon={Play}>Probar flujo</Button>
            <Button soon icon={Plus}>Nuevo flujo</Button>
          </>
        }
      />

      <div className="grid grid--agents">
        <Card title="Componentes" subtitle="Arrastra al lienzo" flush>
          <ul className="list">
            {palette.map(({ kind, label }) => {
              const Icon = kindIcons[kind];
              return (
                <li key={kind} className="list__item palette-item" title="Próximamente">
                  <span className={`flow-node__icon flow-node__icon--${kind}`}><Icon size={14} /></span>
                  {label}
                </li>
              );
            })}
            <li className="list__item palette-item" title="Próximamente">
              <span className="flow-node__icon"><Wrench size={14} /></span>
              Herramienta externa
            </li>
          </ul>
        </Card>

        <VisualWorkspace title="Flujo · Consulta corporativa" icon={Workflow} minHeight={440} toolbar={canvasToolbar}>
          <div className="flow-canvas">
            <div className="flow-canvas__inner">
              <svg className="flow-canvas__edges" width="1190" height="420">
                {edges.map(([from, to]) => (
                  <path key={`${from}-${to}`} d={edgePath(from, to)} className="flow-edge" />
                ))}
              </svg>
              {nodes.map((node) => {
                const Icon = kindIcons[node.kind];
                return (
                  <div
                    key={node.id}
                    className={`flow-node ${node.id === 'n2' ? 'flow-node--selected' : ''}`}
                    style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
                  >
                    <span className={`flow-node__icon flow-node__icon--${node.kind}`}><Icon size={14} /></span>
                    <div>
                      <strong>{node.label}</strong>
                      <span>{node.detail}</span>
                    </div>
                    <i className="flow-node__port flow-node__port--in" />
                    <i className="flow-node__port flow-node__port--out" />
                  </div>
                );
              })}
            </div>
          </div>
        </VisualWorkspace>

        <Card title="Inspector" subtitle="Orquestador">
          <div className="form">
            <label className="field">
              <span>Nombre</span>
              <input value="Orquestador" disabled readOnly />
            </label>
            <label className="field">
              <span>Modelo</span>
              <select disabled><option>llm-general</option></select>
            </label>
            <label className="field">
              <span>Instrucciones del sistema</span>
              <textarea rows={4} disabled value="Clasifica la consulta y deriva al agente especializado." readOnly />
            </label>
            <label className="field">
              <span>Temperatura</span>
              <input type="range" min={0} max={1} step={0.1} value={0.2} disabled readOnly />
            </label>
          </div>
        </Card>
      </div>

      <Card title="Agentes registrados" flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Agente</th>
                <th>Rol</th>
                <th>Modelo</th>
                <th>Herramientas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>
                    <div className="file-name">
                      <span className="flow-node__icon flow-node__icon--agent"><Bot size={14} /></span>
                      <strong>{agent.name}</strong>
                    </div>
                  </td>
                  <td className="muted">{agent.role}</td>
                  <td className="mono muted">{agent.model}</td>
                  <td>
                    <div className="tags">
                      {agent.tools.map((tool) => <span key={tool} className="tag">{tool}</span>)}
                    </div>
                  </td>
                  <td><Badge dot tone={statusTone(agent.status)}>{agent.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
