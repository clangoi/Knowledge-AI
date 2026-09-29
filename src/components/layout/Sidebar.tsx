import { NavLink } from 'react-router-dom';
import { company } from '../../config/company';
import { navItems, navSections } from '../../config/navigation';

export default function Sidebar() {
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
        {navSections.map((section) => (
          <div key={section} className="sidebar__section">
            <p className="sidebar__label">{section}</p>
            {navItems
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
        <div className="avatar">{company.currentUser.initials}</div>
        <div className="sidebar__user">
          <strong>{company.currentUser.name}</strong>
          <span>{company.currentUser.role}</span>
        </div>
      </div>
    </aside>
  );
}
