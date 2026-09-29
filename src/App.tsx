import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Agents from './pages/Agents';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import FineTuning from './pages/FineTuning';
import NotFound from './pages/NotFound';
import Rag from './pages/Rag';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="archivos" element={<Files />} />
        <Route path="rag" element={<Rag />} />
        <Route path="fine-tuning" element={<FineTuning />} />
        <Route path="agentes" element={<Agents />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
