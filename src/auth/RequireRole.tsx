import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../types';
import { homeFor, useSession } from './session';

/**
 * Protege un grupo de rutas: sin sesión redirige a /ingresar y, si el rol no
 * coincide, lleva a la página de inicio del rol del usuario.
 */
export default function RequireRole({ role }: { role: Role }) {
  const { user } = useSession();
  if (!user) return <Navigate to="/ingresar" replace />;
  if (user.rol !== role) return <Navigate to={homeFor(user.rol)} replace />;
  return <Outlet />;
}
