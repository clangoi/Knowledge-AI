import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useSession, useUser } from '../../auth/session';
import { company } from '../../config/company';
import { navItemsFor, navSections } from '../../config/navigation';

export default function Sidebar() {
  const user = useUser();
  const { signOut } = useSession();
  const items = navItemsFor(user.rol);
  const sections = navSections.filter((section) => items.some((item) => item.section === section));

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">N</div>
        <div className="sidebar__brand-text">
          <strong>{company.product}</strong>
          <span>{company.shortName}</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {sections.map((section) => (
          <div key={section} className="sidebar__section">
            <p className="sidebar__label">{section}</p>
            {items
              .filter((item) => item.section === section)
              .map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  title={label}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="avatar">{user.iniciales}</div>
        <div className="sidebar__user">
          <strong>{user.nombre}</strong>
          <span>{user.rol === 'admin' ? 'Administrador' : user.puesto}</span>
        </div>
        <button className="sidebar__logout" title="Cerrar sesión" onClick={signOut}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
