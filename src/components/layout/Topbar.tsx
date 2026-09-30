import { useLocation } from 'react-router-dom';
import { Bell, CircleHelp, Search } from 'lucide-react';
import { company } from '../../config/company';
import { useUser } from '../../auth/session';
import { navItemsFor } from '../../config/navigation';

export default function Topbar() {
  const { pathname } = useLocation();
  const user = useUser();
  const current = navItemsFor(user.rol).find((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path),
  );

  return (
    <header className="topbar">
      <div className="topbar__crumbs">
        <span className="muted">{company.name}</span>
        <span className="muted">/</span>
        <strong>{current?.label ?? 'No encontrado'}</strong>
      </div>

      <div className="topbar__search">
        <Search size={16} />
        <input placeholder="Buscar en documentos, colecciones, agentes…" disabled />
        <kbd>Ctrl K</kbd>
      </div>

      <div className="topbar__actions">
        <button className="icon-btn" title="Ayuda (próximamente)" disabled>
          <CircleHelp size={18} />
        </button>
        <button className="icon-btn" title="Notificaciones (próximamente)" disabled>
          <Bell size={18} />
          <span className="icon-btn__dot" />
        </button>
      </div>
    </header>
  );
}
