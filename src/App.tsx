import { Navigate, Route, Routes } from 'react-router-dom';
import RequireRole from './auth/RequireRole';
import { homeFor, useSession } from './auth/session';
import AppLayout from './components/layout/AppLayout';
import Agents from './pages/Agents';
import Assistants from './pages/Assistants';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Files from './pages/Files';
import FineTuning from './pages/FineTuning';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Rag from './pages/Rag';
import Settings from './pages/Settings';

export default function App() {
  const { user } = useSession();

  return (
    <Routes>
      <Route path="ingresar" element={user ? <Navigate to={homeFor(user.rol)} replace /> : <Login />} />

      <Route element={user ? <AppLayout /> : <Navigate to="/ingresar" replace />}>
        {/* Administrador: gestiona archivos, colecciones, modelos y agentes. */}
        <Route element={<RequireRole role="admin" />}>
          <Route index element={<Dashboard />} />
          <Route path="archivos" element={<Files />} />
          <Route path="rag" element={<Rag />} />
          <Route path="fine-tuning" element={<FineTuning />} />
          <Route path="agentes" element={<Agents />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>

        {/* Usuario (funcionario): usa los asistentes publicados. */}
        <Route element={<RequireRole role="usuario" />}>
          <Route path="asistentes" element={<Assistants />} />
          <Route path="documentos" element={<Documents />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
