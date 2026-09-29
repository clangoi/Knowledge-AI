import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p className="muted">Esta sección no existe.</p>
      <Link to="/" className="btn btn--primary btn--md">Volver al panel</Link>
    </div>
  );
}
