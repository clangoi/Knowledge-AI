import { useState } from 'react';
import { Bot, MessagesSquare, Send, Sparkles } from 'lucide-react';
import { useUser } from '../auth/session';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import VisualWorkspace from '../components/ui/VisualWorkspace';
import { agents } from '../data/mock';

// Solo los agentes que el administrador publicó.
const assistants = agents.filter((a) => a.published && a.status === 'activo');

export default function Assistants() {
  const user = useUser();
  const [selectedId, setSelectedId] = useState(assistants[0]?.id);
  const selected = assistants.find((a) => a.id === selectedId);

  return (
    <>
      <PageHeader
        title={`Hola, ${user.nombre.split(' ')[0]}`}
        description="Elige un asistente y hazle tus preguntas. Sus respuestas citan los documentos de la empresa."
      />

      <div className="grid grid--assistants">
        <Card title="Asistentes disponibles" subtitle={`${assistants.length} publicados por el administrador`} flush>
          <ul className="list">
            {assistants.map((a) => (
              <li key={a.id}>
                <button
                  className={`list__item list__item--stacked assistant-item ${a.id === selectedId ? 'list__item--active' : ''}`}
                  onClick={() => setSelectedId(a.id)}
                >
                  <strong className="text-sm assistant-item__name">
                    <span className="flow-node__icon flow-node__icon--agent"><Bot size={14} /></span>
                    {a.name}
                  </strong>
                  <span className="text-xs muted">{a.role}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {selected ? (
          <VisualWorkspace title={selected.name} icon={MessagesSquare} minHeight={460}>
            <div className="chat">
              <div className="chat__messages">
                <div className="chat__msg chat__msg--assistant">
                  <div className="chat__avatar"><Bot size={14} /></div>
                  <div>
                    Hola, {user.nombre.split(' ')[0]}. {selected.greeting}
                  </div>
                </div>
                <div className="suggestions">
                  <span className="text-xs muted"><Sparkles size={12} /> Prueba con una de estas preguntas</span>
                  {selected.examples.map((q) => (
                    <button key={q} className="suggestion" disabled title="Disponible próximamente">{q}</button>
                  ))}
                </div>
              </div>
              <div className="chat__input">
                <input placeholder={`Escribe tu pregunta para ${selected.name}…`} disabled />
                <Button soon size="sm" icon={Send}>Enviar</Button>
              </div>
            </div>
          </VisualWorkspace>
        ) : (
          <VisualWorkspace
            title="Asistentes"
            icon={MessagesSquare}
            minHeight={460}
            description="Todavía no hay asistentes publicados. El administrador los publica desde la sección Agentes."
          />
        )}
      </div>
    </>
  );
}
