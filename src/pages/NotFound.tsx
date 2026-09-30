import { Link } from 'react-router-dom';
import { homeFor, useUser } from '../auth/session';

export default function NotFound() {
  const user = useUser();
  return (
    <div className="not-found">
      <h1>404</h1>
      <p className="muted">Esta sección no existe.</p>
      <Link to={homeFor(user.rol)} className="btn btn--primary btn--md">Volver al inicio</Link>
    </div>
  );
}
