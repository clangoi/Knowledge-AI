import PDFDocument from 'pdfkit';
import { empresa } from '../empresa.mjs';
import { tramos, textoPlano } from './markdown.mjs';

const MARGEN = 60;
const COLOR = { texto: '#1b1f2a', tenue: '#6b7285', primario: '#3f3fb8', borde: '#d5d9e3', fondo: '#f0f2f7' };

// Renderiza un documento a PDF. Devuelve el buffer y el mapa sección → página
// (útil para citar la página en las preguntas de RAG).
export function renderPdf({ meta, bloques }) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: MARGEN + 10, bottom: MARGEN, left: MARGEN, right: MARGEN },
    bufferPages: true,
    info: {
      Title: meta.titulo,
      Author: meta.responsable,
      Subject: meta.codigo,
      Creator: `${empresa.nombre} · Knowledge AI dataset`,
      CreationDate: new Date(`${meta.vigencia}T09:00:00Z`),
      ModDate: new Date(`${meta.vigencia}T09:00:00Z`),
    },
  });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const fin = new Promise((resolve) => doc.on('end', resolve));

  const ancho = doc.page.width - MARGEN * 2;
  const limite = () => doc.page.height - MARGEN - 20;
  const pagina = () => doc.bufferedPageRange().count;
  const secciones = [];

  // Portada / encabezado del documento
  doc.fillColor(COLOR.primario).font('Helvetica-Bold').fontSize(20).text(meta.titulo, { width: ancho });
  doc.moveDown(0.4);
  const ficha = [
    ['Código', meta.codigo],
    ['Versión', meta.version],
    ['Vigente desde', meta.vigencia],
    ['Responsable', meta.responsable],
    ['Clasificación', meta.clasificacion],
  ].filter(([, v]) => v);
  doc.fontSize(9).fillColor(COLOR.tenue);
  for (const [k, v] of ficha) doc.font('Helvetica-Bold').text(`${k}: `, { continued: true }).font('Helvetica').text(v);
  doc.moveDown(0.6);
  linea(doc, ancho);
  doc.moveDown(0.8);

  let seccionActual = null;
  for (const b of bloques) {
    if (b.tipo === 'h') {
      if (b.nivel === 1) continue; // el título ya está en el encabezado
      if (doc.y > limite() - 70) doc.addPage();
      doc.moveDown(b.nivel === 2 ? 0.6 : 0.3);
      doc
        .font('Helvetica-Bold')
        .fontSize(b.nivel === 2 ? 13 : 11)
        .fillColor(b.nivel === 2 ? COLOR.primario : COLOR.texto)
        .text(b.texto, { width: ancho });
      doc.moveDown(0.3);
      seccionActual = { seccion: b.texto, pagina: pagina() };
      secciones.push(seccionActual);
    } else if (b.tipo === 'p') {
      parrafo(doc, b.texto, { width: ancho });
      doc.moveDown(0.5);
    } else if (b.tipo === 'nota') {
      const alto = doc.font('Helvetica-Oblique').fontSize(10).heightOfString(textoPlano(b.texto), { width: ancho - 20 }) + 14;
      if (doc.y + alto > limite()) doc.addPage();
      const y = doc.y;
      doc.rect(MARGEN, y, ancho, alto).fill(COLOR.fondo);
      doc.fillColor(COLOR.texto).font('Helvetica-Oblique').fontSize(10).text(textoPlano(b.texto), MARGEN + 10, y + 7, { width: ancho - 20 });
      doc.x = MARGEN;
      doc.y = y + alto;
      doc.moveDown(0.6);
    } else if (b.tipo === 'ul' || b.tipo === 'ol') {
      b.items.forEach((item, i) => {
        const marca = b.tipo === 'ul' ? '•' : `${i + 1}.`;
        const y = doc.y;
        doc.font('Helvetica').fontSize(10.5).fillColor(COLOR.texto).text(marca, MARGEN + 8, y, { width: 18 });
        doc.y = y;
        parrafo(doc, item, { width: ancho - 28, x: MARGEN + 28 });
        doc.x = MARGEN;
        doc.moveDown(0.2);
      });
      doc.moveDown(0.4);
    } else if (b.tipo === 'tabla') {
      tabla(doc, b, ancho, limite);
      doc.moveDown(0.6);
    }
  }

  // Encabezado y pie en todas las páginas
  const total = pagina();
  for (let i = 0; i < total; i++) {
    doc.switchToPage(i);
    const { height, width } = doc.page;
    doc.page.margins.bottom = 0;
    doc.font('Helvetica').fontSize(8).fillColor(COLOR.tenue);
    doc.text(empresa.nombre, MARGEN, 30, { width: ancho / 2, lineBreak: false });
    doc.text(meta.codigo ?? '', width / 2, 30, { width: ancho / 2, align: 'right', lineBreak: false });
    doc.text(
      `${meta.clasificacion ?? 'Uso interno'} · Versión ${meta.version ?? '1.0'} · Página ${i + 1} de ${total}`,
      MARGEN,
      height - 40,
      { width: ancho, align: 'center', lineBreak: false },
    );
  }
  doc.end();
  return fin.then(() => ({ buffer: Buffer.concat(chunks), secciones, paginas: total }));
}

function linea(doc, ancho) {
  doc.moveTo(MARGEN, doc.y).lineTo(MARGEN + ancho, doc.y).lineWidth(0.5).strokeColor(COLOR.borde).stroke();
}

function parrafo(doc, texto, opciones) {
  const partes = tramos(texto);
  doc.fontSize(10.5).fillColor(COLOR.texto);
  if (opciones.x !== undefined) doc.x = opciones.x;
  partes.forEach((t, i) => {
    doc.font(t.negrita ? 'Helvetica-Bold' : 'Helvetica').text(t.texto, {
      width: opciones.width,
      continued: i < partes.length - 1,
      lineGap: 2,
    });
  });
}

function tabla(doc, { encabezado, filas }, ancho, limite) {
  const n = encabezado.length;
  // Ancho de columna proporcional al contenido más largo, con mínimo.
  const largos = encabezado.map((_, c) =>
    Math.max(...[encabezado, ...filas].map((f) => textoPlano(f[c] ?? '').length), 4),
  );
  const suma = largos.reduce((a, b) => a + b, 0);
  let anchos = largos.map((l) => Math.max(ancho * (l / suma), 55));
  const escala = ancho / anchos.reduce((a, b) => a + b, 0);
  anchos = anchos.map((a) => a * escala);

  const fila = (valores, esEncabezado) => {
    doc.font(esEncabezado ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    const alto =
      Math.max(...valores.map((v, c) => doc.heightOfString(textoPlano(v ?? ''), { width: anchos[c] - 8 }))) + 8;
    if (doc.y + alto > limite()) doc.addPage();
    const y = doc.y;
    let x = MARGEN;
    if (esEncabezado) doc.rect(MARGEN, y, ancho, alto).fill(COLOR.fondo);
    for (let c = 0; c < n; c++) {
      doc.rect(x, y, anchos[c], alto).lineWidth(0.5).strokeColor(COLOR.borde).stroke();
      doc
        .fillColor(COLOR.texto)
        .font(esEncabezado ? 'Helvetica-Bold' : 'Helvetica')
        .text(textoPlano(valores[c] ?? ''), x + 4, y + 4, { width: anchos[c] - 8 });
      x += anchos[c];
    }
    doc.x = MARGEN;
    doc.y = y + alto;
  };
  fila(encabezado, true);
  for (const f of filas) fila(f, false);
}
