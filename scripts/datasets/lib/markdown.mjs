// Parser mínimo del subconjunto de Markdown que usan las fuentes:
// frontmatter, #/##/### títulos, párrafos, listas (- y 1.), tablas, citas (>)
// y negritas (**texto**). Devuelve bloques que consumen los renderizadores.

export function parseDocumento(fuente, ruta) {
  const m = fuente.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${ruta}: falta el frontmatter`);
  const meta = {};
  for (const linea of m[1].split('\n')) {
    const i = linea.indexOf(':');
    if (i > 0) meta[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
  }
  return { meta, cuerpo: m[2].trim() + '\n', bloques: parseBloques(m[2]) };
}

export function parseBloques(texto) {
  const lineas = texto.split('\n');
  const bloques = [];
  let i = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (!l.trim()) {
      i++;
      continue;
    }
    const h = l.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      bloques.push({ tipo: 'h', nivel: h[1].length, texto: h[2].trim() });
      i++;
      continue;
    }
    if (l.startsWith('|')) {
      const filas = [];
      while (i < lineas.length && lineas[i].startsWith('|')) {
        if (!/^\|[\s:|-]+\|\s*$/.test(lineas[i])) filas.push(celdas(lineas[i]));
        i++;
      }
      bloques.push({ tipo: 'tabla', encabezado: filas[0], filas: filas.slice(1) });
      continue;
    }
    if (/^- /.test(l) || /^\d+\. /.test(l)) {
      const ordenada = /^\d+\. /.test(l);
      const items = [];
      const re = ordenada ? /^\d+\. / : /^- /;
      while (i < lineas.length && re.test(lineas[i])) {
        items.push(lineas[i].replace(re, '').trim());
        i++;
      }
      bloques.push({ tipo: ordenada ? 'ol' : 'ul', items });
      continue;
    }
    if (l.startsWith('>')) {
      const partes = [];
      while (i < lineas.length && lineas[i].startsWith('>')) {
        partes.push(lineas[i].replace(/^>\s?/, ''));
        i++;
      }
      bloques.push({ tipo: 'nota', texto: partes.join(' ').trim() });
      continue;
    }
    const partes = [];
    while (
      i < lineas.length &&
      lineas[i].trim() &&
      !/^(#{1,3}\s|\||- |\d+\. |>)/.test(lineas[i])
    ) {
      partes.push(lineas[i].trim());
      i++;
    }
    bloques.push({ tipo: 'p', texto: partes.join(' ') });
  }
  return bloques;
}

const celdas = (linea) =>
  linea
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());

// Divide un texto en tramos normales y en negrita.
export function tramos(texto) {
  return texto
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((t) => (t.startsWith('**') ? { texto: t.slice(2, -2), negrita: true } : { texto: t, negrita: false }));
}

export const textoPlano = (texto) => texto.replace(/\*\*([^*]+)\*\*/g, '$1');

// Versión en texto plano de los bloques (para .txt y para validar evidencias).
export function aTexto(bloques) {
  const out = [];
  for (const b of bloques) {
    if (b.tipo === 'h') out.push(b.nivel === 1 ? b.texto.toUpperCase() : b.texto, '');
    else if (b.tipo === 'p') out.push(textoPlano(b.texto), '');
    else if (b.tipo === 'nota') out.push(`Nota: ${textoPlano(b.texto)}`, '');
    else if (b.tipo === 'ul') out.push(...b.items.map((t) => `- ${textoPlano(t)}`), '');
    else if (b.tipo === 'ol') out.push(...b.items.map((t, i) => `${i + 1}. ${textoPlano(t)}`), '');
    else if (b.tipo === 'tabla')
      out.push(...[b.encabezado, ...b.filas].map((f) => f.map(textoPlano).join(' | ')), '');
  }
  return out.join('\n').trim() + '\n';
}
