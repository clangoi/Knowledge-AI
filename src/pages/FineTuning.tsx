import { Brain, Clock, Cpu, FileJson, LineChart, Play, Plus, Upload } from 'lucide-react';
import Badge, { statusTone } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import VisualWorkspace from '../components/ui/VisualWorkspace';
import { datasets, jobs } from '../data/mock';

// Curvas de ejemplo (coordenadas del SVG) solo para ilustrar la gráfica.
const trainLoss = '0,20 60,70 120,110 180,138 240,156 300,168 360,176 420,181 480,185 540,187 600,189';
const valLoss = '0,30 60,82 120,118 180,142 240,158 300,166 360,171 420,174 480,176 540,178 600,179';

export default function FineTuning() {
  return (
    <>
      <PageHeader
        title="Fine-tuning"
        description="Prepara datasets, lanza entrenamientos y compara versiones de modelos propios."
        actions={
          <>
            <Button soon variant="secondary" icon={Upload}>Importar dataset</Button>
            <Button soon icon={Play}>Nuevo entrenamiento</Button>
          </>
        }
      />

      <div className="grid grid--stats">
        <StatCard icon={Brain} label="Modelos ajustados" value="2" hint="Último: nexora-legal-v1" />
        <StatCard
          icon={FileJson}
          label="Datasets"
          value={String(datasets.length)}
          hint={`${datasets.reduce((s, d) => s + d.examples, 0).toLocaleString('es')} ejemplos`}
        />
        <StatCard icon={Cpu} label="Trabajos activos" value="1" hint="1 en cola" />
        <StatCard icon={Clock} label="Horas GPU (mes)" value="128 h" hint="de 300 h disponibles" />
      </div>

      <div className="grid grid--2-1">
        <VisualWorkspace
          title="Curva de entrenamiento · nexora-soporte-v3"
          icon={LineChart}
          minHeight={280}
          toolbar={
            <div className="legend">
              <span><i className="legend__swatch legend__swatch--a" /> train loss</span>
              <span><i className="legend__swatch legend__swatch--b" /> val loss</span>
            </div>
          }
        >
          <svg className="loss-chart" viewBox="0 0 600 210" preserveAspectRatio="none" aria-label="Curva de pérdida de ejemplo">
            {[40, 80, 120, 160, 200].map((y) => (
              <line key={y} x1="0" x2="600" y1={y} y2={y} className="loss-chart__grid" />
            ))}
            <polyline points={valLoss} className="loss-chart__line loss-chart__line--b" />
            <polyline points={trainLoss} className="loss-chart__line loss-chart__line--a" />
          </svg>
        </VisualWorkspace>

        <Card
          title="Datasets"
          flush
          actions={<Button soon size="sm" variant="ghost" icon={Plus}>Nuevo</Button>}
        >
          <ul className="list">
            {datasets.map((ds) => (
              <li key={ds.id} className="list__item list__item--stacked">
                <strong className="text-sm">{ds.name}</strong>
                <span className="text-xs muted">
                  {ds.examples.toLocaleString('es')} ejemplos · {ds.format} · {ds.updatedAt}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Trabajos de entrenamiento" flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Modelo resultante</th>
                <th>Modelo base</th>
                <th>Dataset</th>
                <th>Progreso</th>
                <th>Estado</th>
                <th>Inicio</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="mono muted">{job.id}</td>
                  <td><strong>{job.name}</strong></td>
                  <td className="muted">{job.baseModel}</td>
                  <td className="muted">{job.dataset}</td>
                  <td>
                    <div className="progress">
                      <div className={`progress__bar progress__bar--${statusTone(job.status)}`} style={{ width: `${job.progress}%` }} />
                    </div>
                    <span className="text-xs muted">{job.progress}%</span>
                  </td>
                  <td><Badge dot tone={statusTone(job.status)}>{job.status}</Badge></td>
                  <td className="muted">{job.startedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
