import { ShieldCheck, Users } from 'lucide-react';
import { demoUsers, useSession } from '../auth/session';
import { company } from '../config/company';
import type { User } from '../types';

function AccountButton({ user, onSelect }: { user: User; onSelect: (id: string) => void }) {
  return (
    <button className="account" onClick={() => onSelect(user.id)}>
      <span className={`avatar ${user.rol === 'admin' ? 'avatar--admin' : 'avatar--user'}`}>{user.iniciales}</span>
      <span className="account__text">
        <strong>{user.nombre}</strong>
        <span>{user.puesto}</span>
        <span className="account__meta">{user.area} · {user.sede}</span>
      </span>
    </button>
  );
}

export default function Login() {
  const { signIn } = useSession();
  const admins = demoUsers.filter((u) => u.rol === 'admin');
  const usuarios = demoUsers.filter((u) => u.rol === 'usuario');

  return (
    <div className="login">
      <div className="login__panel">
        <div className="login__brand">
          <div className="sidebar__logo">N</div>
          <div>
            <strong>{company.product}</strong>
            <span>{company.name}</span>
          </div>
        </div>

        <h1 className="login__title">Elige una cuenta para entrar</h1>
        <p className="muted">
          Cuentas de demostración de la empresa ficticia. La autenticación es simulada: no hay contraseñas.
        </p>

        <section className="login__group">
          <h2 className="login__group-title">
            <ShieldCheck size={16} /> Administrador
          </h2>
          <p className="text-sm muted">Gestiona archivos, colecciones RAG, fine-tuning y agentes, y decide qué asistentes se publican.</p>
          <div className="login__accounts">
            {admins.map((u) => <AccountButton key={u.id} user={u} onSelect={signIn} />)}
          </div>
        </section>

        <section className="login__group">
          <h2 className="login__group-title">
            <Users size={16} /> Funcionarios
          </h2>
          <p className="text-sm muted">Usan los asistentes publicados y consultan los documentos de la empresa.</p>
          <div className="login__accounts login__accounts--grid">
            {usuarios.map((u) => <AccountButton key={u.id} user={u} onSelect={signIn} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
