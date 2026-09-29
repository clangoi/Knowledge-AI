import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Bot, Brain, Database, FileText } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import VisualWorkspace from '../components/ui/VisualWorkspace';
import { company } from '../config/company';
import { navItems } from '../config/navigation';
import { activity } from '../data/mock';

export default function Dashboard() {
  const modules = navItems.filter((item) => item.path !== '/' && item.section !== 'Sistema');

  return (
    <>
      <PageHeader
        title={`Hola, ${company.currentUser.name.split(' ')[0]}`}
        description={`${company.tagline} de ${company.name}.`}
      />

      <div className="grid grid--stats">
        <StatCard icon={FileText} label="Documentos" value="1,284" hint="+36 esta semana" />
        <StatCard icon={Database} label="Colecciones RAG" value="4" hint="27,286 fragmentos" />
        <StatCard icon={Brain} label="Modelos ajustados" value="2" hint="1 en entrenamiento" />
        <StatCard icon={Bot} label="Agentes" value="4" hint="2 activos" />
      </div>

      <div className="grid grid--modules">
        {modules.map(({ path, label, description, icon: Icon }) => (
          <Link key={path} to={path} className="module-card">
            <div className="module-card__icon">
              <Icon size={20} />
            </div>
            <div>
              <strong>{label}</strong>
              <p>{description}</p>
            </div>
            <ArrowRight size={16} className="module-card__arrow" />
          </Link>
        ))}
      </div>

      <div className="grid grid--2-1">
        <VisualWorkspace
          title="Métricas de uso"
          icon={Activity}
          minHeight={300}
          description="Aquí irán las gráficas de consultas, uso de tokens y rendimiento de agentes."
        />
        <Card title="Actividad reciente" flush>
          <ul className="list">
            {activity.map((item) => (
              <li key={item.id} className="list__item list__item--stacked">
                <div className="list__row">
                  <Badge tone="neutral">{item.module}</Badge>
                  <span className="text-xs muted">{item.time}</span>
                </div>
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
