// Genera el dataset completo de Nexora en datasets/:
//   corpus/<área>/...           archivos reales (pdf, docx, xlsx, csv, txt, md)
//   corpus/manifest.json        índice de archivos con metadatos
//   rag/preguntas.jsonl         preguntas de evaluación con fuentes verificadas
//   fine-tuning/<tarea>/*.jsonl datasets de entrenamiento y validación
//   agentes/escenarios.jsonl    tareas de varios pasos con respuesta esperada
//
// Uso: npm run datasets

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fecha fija para que los metadatos internos de PDF/DOCX/XLSX no cambien entre
// ejecuciones (así git solo muestra cambios reales).
const FIJA = Date.parse('2026-09-30T12:00:00Z');
const RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(FIJA);
    else super(...args);
  }
  static now() {
    return FIJA;
  }
};

const { areas, empresa } = await import('./empresa.mjs');
const { generarDatos } = await import('./datos.mjs');
const { documentosDinamicos } = await import('./documentos-dinamicos.mjs');
const { generarFineTuning } = await import('./fine-tuning.mjs');
const { generarEscenarios } = await import('./agentes.mjs');
const { parseDocumento, parseBloques, aTexto, textoPlano } = await import('./lib/markdown.mjs');
const { renderPdf } = await import('./lib/render-pdf.mjs');
const { renderDocx } = await import('./lib/render-docx.mjs');
const { renderXlsx } = await import('./lib/render-xlsx.mjs');
const { toCsv, toJsonl } = await import('./lib/util.mjs');

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../datasets');
const FUENTES = path.join(RAIZ, 'fuentes');
const errores = [];
const areaNombre = Object.fromEntries(areas.map((a) => [a.id, a.nombre]));
const normalizar = (s) => textoPlano(s).replace(/\s+/g, ' ').trim();

async function escribir(relativa, contenido) {
  const destino = path.join(RAIZ, relativa);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, contenido);
  return Buffer.byteLength(contenido);
}

async function leerFuentes() {
  const docs = [];
  const dir = path.join(FUENTES, 'documentos');
  for (const area of await readdir(dir)) {
    for (const archivo of (await readdir(path.join(dir, area))).sort()) {
      const ruta = path.join(dir, area, archivo);
      docs.push({ ruta, ...parseDocumento(await readFile(ruta, 'utf8'), ruta) });
    }
  }
  return docs;
}

// Sección (último título ## o ###) en la que aparece un texto.
function seccionDe(bloques, evidencia) {
  let seccion = null;
  for (const b of bloques) {
    if (b.tipo === 'h') {
      if (b.nivel > 1) seccion = b.texto;
      continue;
    }
    if (normalizar(aTexto([b])).includes(evidencia)) return seccion;
  }
  return null;
}

// ---------------------------------------------------------------------------
console.log('Generando datos…');
const { archivos: archivosDatos, tablas } = generarDatos();

await rm(path.join(RAIZ, 'corpus'), { recursive: true, force: true });
await rm(path.join(RAIZ, 'rag'), { recursive: true, force: true });
await rm(path.join(RAIZ, 'fine-tuning'), { recursive: true, force: true });
await rm(path.join(RAIZ, 'agentes'), { recursive: true, force: true });
await rm(path.join(RAIZ, 'app'), { recursive: true, force: true });

const documentos = [
  ...(await leerFuentes()),
  ...documentosDinamicos(tablas).map((fuente, i) => ({ ruta: `dinámico #${i + 1}`, ...parseDocumento(fuente, `dinámico #${i + 1}`) })),
];

const manifest = [];
const textos = new Map(); // id → { texto normalizado, bloques, secciones pdf }

console.log(`Renderizando ${documentos.length} documentos…`);
for (const doc of documentos) {
  const { meta } = doc;
  for (const campo of ['id', 'titulo', 'archivo', 'formato', 'area']) {
    if (!meta[campo]) errores.push(`${doc.ruta}: falta "${campo}" en el frontmatter`);
  }
  if (!areaNombre[meta.area]) errores.push(`${doc.ruta}: área desconocida "${meta.area}"`);
  if (textos.has(meta.id)) errores.push(`${doc.ruta}: id duplicado "${meta.id}"`);

  const relativa = `corpus/${meta.area}/${meta.archivo}.${meta.formato}`;
  let bytes;
  let extra = {};
  // En .txt el cuerpo es texto libre (correo, bitácora); no se interpreta como Markdown.
  const bloques = meta.formato === 'txt' ? parseBloques('') : doc.bloques;
  const plano = meta.formato === 'txt' ? doc.cuerpo : aTexto(doc.bloques);

  if (meta.formato === 'pdf') {
    const { buffer, secciones, paginas } = await renderPdf(doc);
    bytes = await escribir(relativa, buffer);
    extra = { paginas, secciones };
  } else if (meta.formato === 'docx') {
    const { buffer } = await renderDocx(doc);
    bytes = await escribir(relativa, buffer);
    extra = { secciones: doc.bloques.filter((b) => b.tipo === 'h' && b.nivel > 1).map((b) => ({ seccion: b.texto })) };
  } else if (meta.formato === 'txt' || meta.formato === 'md') {
    bytes = await escribir(relativa, doc.cuerpo);
  } else {
    errores.push(`${doc.ruta}: formato no soportado "${meta.formato}"`);
    continue;
  }

  const primerParrafo = doc.bloques.find((b) => b.tipo === 'p');
  textos.set(meta.id, { texto: normalizar(plano), bloques, secciones: extra.secciones ?? [], ruta: relativa });
  manifest.push({
    id: meta.id,
    titulo: meta.titulo,
    archivo: path.basename(relativa),
    ruta: relativa,
    area: meta.area,
    area_nombre: areaNombre[meta.area],
    formato: meta.formato,
    tipo: 'documento',
    codigo: meta.codigo ?? null,
    version: meta.version ?? null,
    fecha: meta.vigencia ?? null,
    responsable: meta.responsable ?? null,
    clasificacion: meta.clasificacion ?? null,
    descripcion: primerParrafo ? normalizar(primerParrafo.texto).slice(0, 240) : null,
    bytes,
    ...extra,
  });
}

console.log(`Generando ${archivosDatos.length} archivos de datos…`);
for (const a of archivosDatos) {
  const relativa = `corpus/${a.area}/${a.archivo}.${a.formato}`;
  let bytes;
  let hojas;
  if (a.formato === 'xlsx') {
    bytes = await escribir(relativa, (await renderXlsx(a)).buffer);
    hojas = a.hojas.map((h) => ({ nombre: h.nombre, filas: h.filas.length, columnas: h.columnas.map((c) => c.titulo) }));
  } else {
    bytes = await escribir(relativa, toCsv(a.columnas, a.filas));
    hojas = [{ nombre: a.archivo, filas: a.filas.length, columnas: a.columnas.map((c) => c.titulo) }];
  }
  textos.set(a.id, { texto: '', bloques: [], secciones: [], ruta: relativa });
  manifest.push({
    id: a.id,
    titulo: a.titulo,
    archivo: path.basename(relativa),
    ruta: relativa,
    area: a.area,
    area_nombre: areaNombre[a.area],
    formato: a.formato,
    tipo: 'datos',
    codigo: null,
    version: null,
    fecha: a.fecha,
    responsable: a.responsable,
    clasificacion: 'Confidencial',
    descripcion: a.descripcion,
    bytes,
    hojas,
  });
}

manifest.sort((a, b) => a.area.localeCompare(b.area) || a.archivo.localeCompare(b.archivo, 'es'));
await escribir(
  'corpus/manifest.json',
  JSON.stringify({ empresa: empresa.nombre, fecha_corte: empresa.fechaCorte, total: manifest.length, archivos: manifest }, null, 2) + '\n',
);

// ---------------------------------------------------------------------------
console.log('Validando preguntas de RAG…');
const preguntas = JSON.parse(await readFile(path.join(FUENTES, 'rag/preguntas.json'), 'utf8'));
const idsPreguntas = new Set();
const preguntasSalida = preguntas.map((p) => {
  if (idsPreguntas.has(p.id)) errores.push(`RAG ${p.id}: id duplicado`);
  idsPreguntas.add(p.id);
  if (p.tipo !== 'sin-respuesta' && !p.fuentes.length) errores.push(`RAG ${p.id}: no tiene fuentes`);
  return {
    ...p,
    fuentes: p.fuentes.map((f) => {
      const doc = textos.get(f.documento);
      if (!doc) {
        errores.push(`RAG ${p.id}: documento desconocido "${f.documento}"`);
        return f;
      }
      const evidencia = normalizar(f.evidencia);
      if (!doc.texto.includes(evidencia)) errores.push(`RAG ${p.id}: la evidencia no aparece en ${f.documento}: "${f.evidencia}"`);
      const seccion = seccionDe(doc.bloques, evidencia);
      const pagina = doc.secciones.find((s) => s.seccion === seccion)?.pagina ?? null;
      return { documento: f.documento, ruta: doc.ruta, seccion, pagina, evidencia: f.evidencia };
    }),
  };
});
await escribir('rag/preguntas.jsonl', toJsonl(preguntasSalida));

// ---------------------------------------------------------------------------
console.log('Generando datasets de fine-tuning…');
const resumenFt = {};
for (const [tarea, datos] of Object.entries(generarFineTuning(tablas))) {
  await escribir(`fine-tuning/${tarea}/train.jsonl`, toJsonl(datos.train));
  await escribir(`fine-tuning/${tarea}/validation.jsonl`, toJsonl(datos.validation));
  resumenFt[tarea] = { formato: datos.formato, descripcion: datos.descripcion, train: datos.train.length, validation: datos.validation.length };
}
await escribir('fine-tuning/resumen.json', JSON.stringify(resumenFt, null, 2) + '\n');

// ---------------------------------------------------------------------------
console.log('Generando escenarios de agentes…');
const escenarios = generarEscenarios(tablas).map((e) => {
  for (const d of e.documentos) if (!textos.has(d)) errores.push(`Agente ${e.id}: documento desconocido "${d}"`);
  return { ...e, archivos: e.documentos.map((d) => textos.get(d)?.ruta ?? null) };
});
await escribir('agentes/escenarios.jsonl', toJsonl(escenarios));

// ---------------------------------------------------------------------------
// Cuentas demo de la app: un administrador de la plataforma y funcionarios de
// distintas áreas tomados de la plantilla de personal.
console.log('Generando cuentas demo…');
const cuenta = (p, rol) => ({
  id: p.id,
  nombre: p.nombre,
  iniciales: p.nombre.split(' ').slice(0, 2).map((s) => s[0]).join(''),
  puesto: p.puesto,
  area: p.area,
  sede: p.sede,
  rol,
});
const admin = tablas.personal.find((p) => p.nombre === 'Ana Torres');
const PUESTOS_USUARIO = [
  ['Ejecutivo de ventas', 'Oficinas centrales'],
  ['Analista financiero', 'Oficinas centrales'],
  ['Comprador', 'Oficinas centrales'],
  ['Abogado corporativo', 'Oficinas centrales'],
  ['Generalista de RR. HH.', 'Oficinas centrales'],
  ['Técnico de mantenimiento', 'Planta Norte'],
  ['Técnico de servicio postventa', 'Planta Sur'],
  ['Supervisor de producción', 'Planta Sur'],
];
const usuarios = PUESTOS_USUARIO.map(([puesto, sede]) => {
  const p = tablas.personal.find((x) => x.puesto === puesto && x.sede === sede && x.antiguedad_anios >= 1);
  if (!p) errores.push(`Cuentas demo: no hay "${puesto}" en ${sede}`);
  return p && cuenta(p, 'usuario');
}).filter(Boolean);
await escribir('app/usuarios.json', JSON.stringify([cuenta(admin, 'admin'), ...usuarios], null, 2) + '\n');

// ---------------------------------------------------------------------------
if (errores.length) {
  console.error(`\n${errores.length} error(es):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}

const porFormato = manifest.reduce((a, m) => ((a[m.formato] = (a[m.formato] ?? 0) + 1), a), {});
console.log('\nListo.');
console.log(`  Corpus: ${manifest.length} archivos (${Object.entries(porFormato).map(([k, v]) => `${v} ${k}`).join(', ')})`);
console.log(`  RAG: ${preguntasSalida.length} preguntas`);
for (const [t, r] of Object.entries(resumenFt)) console.log(`  Fine-tuning ${t}: ${r.train} train / ${r.validation} validation`);
console.log(`  Agentes: ${escenarios.length} escenarios`);
console.log(`  Cuentas demo: 1 administrador y ${usuarios.length} usuarios`);
