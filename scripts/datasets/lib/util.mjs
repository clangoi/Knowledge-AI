// Utilidades compartidas por los generadores.

// Generador pseudoaleatorio con semilla (mulberry32) para que cada ejecución
// produzca exactamente los mismos datos.
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    float: (min, max, dec = 2) => round(min + next() * (max - min), dec),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    shuffle: (arr) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

export const round = (n, dec = 2) => Math.round(n * 10 ** dec) / 10 ** dec;

// Fechas en formato ISO (YYYY-MM-DD) sin zonas horarias.
export const iso = (d) => d.toISOString().slice(0, 10);
export const fecha = (s) => new Date(`${s}T00:00:00Z`);
export const sumarDias = (s, n) => {
  const d = fecha(s);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
export const diasEntre = (a, b) => Math.round((fecha(b) - fecha(a)) / 86_400_000);
export const esHabil = (s) => {
  const dow = fecha(s).getUTCDay();
  return dow !== 0 && dow !== 6;
};
export const diasHabilesEntre = (a, b) => {
  let n = 0;
  for (let d = sumarDias(a, 1); d <= b; d = sumarDias(d, 1)) if (esHabil(d)) n++;
  return n;
};
export const aniosCumplidos = (desde, hasta) => {
  const a = fecha(desde);
  const b = fecha(hasta);
  let anios = b.getUTCFullYear() - a.getUTCFullYear();
  if (
    b.getUTCMonth() < a.getUTCMonth() ||
    (b.getUTCMonth() === a.getUTCMonth() && b.getUTCDate() < a.getUTCDate())
  )
    anios--;
  return anios;
};

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const usd = (n) =>
  `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
export const usd0 = (n) => `${Math.round(n).toLocaleString('en-US')} USD`;

export const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const toCsv = (columnas, filas) => {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columnas.map((c) => esc(c.titulo)), ...filas.map((f) => columnas.map((c) => esc(f[c.clave])))]
    .map((l) => l.join(','))
    .join('\n') + '\n';
};

export const toJsonl = (items) => items.map((i) => JSON.stringify(i)).join('\n') + '\n';

// Nombres ficticios para la plantilla de personal.
export const NOMBRES = [
  'Adriana', 'Alberto', 'Alejandra', 'Andrés', 'Beatriz', 'Bruno', 'Camila', 'Carlos', 'Cecilia', 'Daniel',
  'Diana', 'Eduardo', 'Elisa', 'Emilio', 'Fernanda', 'Francisco', 'Gabriela', 'Gustavo', 'Hilda', 'Hugo',
  'Inés', 'Iván', 'Jimena', 'Joaquín', 'Julia', 'Julián', 'Karla', 'Leonardo', 'Lorena', 'Manuel',
  'Mariana', 'Mario', 'Natalia', 'Nicolás', 'Olga', 'Óscar', 'Patricia', 'Pedro', 'Rebeca', 'Ricardo',
  'Rosa', 'Samuel', 'Silvia', 'Sergio', 'Teresa', 'Ulises', 'Valeria', 'Víctor', 'Ximena', 'Yolanda',
];
export const APELLIDOS = [
  'Acosta', 'Aguilar', 'Álvarez', 'Arias', 'Barrios', 'Bravo', 'Cabrera', 'Campos', 'Cano', 'Castillo',
  'Cortés', 'Delgado', 'Domínguez', 'Escobar', 'Espinoza', 'Figueroa', 'Flores', 'Fuentes', 'Gallardo', 'Garrido',
  'Guerrero', 'Ibarra', 'Juárez', 'Lara', 'Luna', 'Maldonado', 'Marín', 'Medina', 'Mejía', 'Miranda',
  'Molina', 'Montoya', 'Navarro', 'Núñez', 'Ochoa', 'Orozco', 'Pacheco', 'Peña', 'Quintero', 'Ramos',
  'Reyes', 'Ríos', 'Robles', 'Rosales', 'Salazar', 'Sandoval', 'Serrano', 'Soto', 'Valdez', 'Zamora',
];
