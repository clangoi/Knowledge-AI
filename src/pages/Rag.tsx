import { Fragment } from 'react';
import {
  Bot,
  ChevronRight,
  Cpu,
  Database,
  FileInput,
  Layers,
  MessageSquare,
  Plus,
  Scissors,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import Badge, { statusTone } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import VisualWorkspace from '../components/ui/VisualWorkspace';
import { collections, retrievedChunks } from '../data/mock';

const pipeline = [
  { label: 'Ingesta', icon: FileInput },
  { label: 'Chunking', icon: Scissors },
  { label: 'Embeddings', icon: Cpu },
  { label: 'Índice vectorial', icon: Layers },
  { label: 'Recuperación', icon: Search },
  { label: 'Generación', icon: Sparkles },
];

export default function Rag() {
  return (
    <>
      <PageHeader
        title="RAG · Recuperación aumentada"
        description="Organiza el conocimiento en colecciones vectoriales y consúltalo en lenguaje natural."
        actions={<Button soon icon={Plus}>Nueva colección</Button>}
      />

      <Card title="Pipeline de indexación" subtitle="Etapas que recorrerá cada documento">
        <div className="pipeline">
          {pipeline.map(({ label, icon: Icon }, i) => (
            <Fragment key={label}>
              <div className="pipeline__step">
                <div className="pipeline__icon"><Icon size={18} /></div>
                <span>{label}</span>
              </div>
              {i < pipeline.length - 1 && <ChevronRight size={16} className="pipeline__arrow" />}
            </Fragment>
          ))}
        </div>
      </Card>

      <div className="grid grid--rag">
        <Card title="Colecciones" flush>
          <ul className="list">
            {collections.map((c, i) => (
              <li key={c.id} className={`list__item list__item--stacked ${i === 0 ? 'list__item--active' : ''}`}>
                <div className="list__row">
                  <strong className="text-sm"><Database size={14} /> {c.name}</strong>
                  <Badge dot tone={statusTone(c.status)}>{c.status}</Badge>
                </div>
                <span className="text-xs muted">
                  {c.documents} docs · {c.chunks.toLocaleString('es')} fragmentos · {c.embeddingModel}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <VisualWorkspace title="Playground de consultas" icon={MessageSquare} minHeight={420}>
          <div className="chat">
            <div className="chat__messages">
              <div className="chat__msg chat__msg--user">
                ¿Cuál es el plazo para solicitar el reembolso de viáticos?
              </div>
              <div className="chat__msg chat__msg--assistant">
                <div className="chat__avatar"><Bot size={14} /></div>
                <div>
                  Debes reportar los gastos en un máximo de <strong>10 días hábiles</strong> tras tu regreso
                  <sup className="cite">1</sup>. El reembolso se paga en la siguiente quincena, una vez aprobado
                  por tu jefe directo<sup className="cite">2</sup>.
                </div>
              </div>
            </div>
            <div className="chat__input">
              <input placeholder="Pregunta algo a la colección «Políticas internas»…" disabled />
              <Button soon size="sm" icon={Send}>Enviar</Button>
            </div>
          </div>
        </VisualWorkspace>

        <Card title="Contexto recuperado" subtitle="Top-k fragmentos usados en la respuesta" flush>
          <ul className="list">
            {retrievedChunks.map((chunk, i) => (
              <li key={chunk.id} className="list__item list__item--stacked">
                <div className="list__row">
                  <span className="text-xs"><span className="cite">{i + 1}</span> {chunk.source} · p. {chunk.page}</span>
                  <Badge tone="primary">{chunk.score.toFixed(2)}</Badge>
                </div>
                <p className="text-sm muted chunk-text">{chunk.text}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
