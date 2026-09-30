// Sesión simulada: no hay backend ni contraseñas. Se elige una cuenta demo
// (datasets/app/usuarios.json) y su id se recuerda en localStorage.
import { createContext, useContext, useState, type ReactNode } from 'react';
import cuentas from '../../datasets/app/usuarios.json';
import type { Role, User } from '../types';

export const demoUsers = cuentas as User[];

const CLAVE = 'knowledge-ai:usuario';

const leer = () => {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
};

const guardar = (id: string | null) => {
  try {
    if (id) localStorage.setItem(CLAVE, id);
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento disponible la sesión dura lo que dure la pestaña.
  }
};

interface Session {
  user: User | null;
  signIn: (id: string) => void;
  signOut: () => void;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => demoUsers.find((u) => u.id === leer()) ?? null);

  const signIn = (id: string) => {
    guardar(id);
    setUser(demoUsers.find((u) => u.id === id) ?? null);
  };
  const signOut = () => {
    guardar(null);
    setUser(null);
  };

  return <SessionContext.Provider value={{ user, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return session;
}

/** Usuario de la sesión; solo para componentes dentro de rutas protegidas. */
export function useUser() {
  const { user } = useSession();
  if (!user) throw new Error('No hay sesión iniciada');
  return user;
}

/** Página de inicio de cada rol. */
export const homeFor = (role: Role) => (role === 'admin' ? '/' : '/asistentes');
