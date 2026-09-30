import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { empresa } from '../empresa.mjs';
import { tramos, textoPlano } from './markdown.mjs';

const runs = (texto) => tramos(texto).map((t) => new TextRun({ text: t.texto, bold: t.negrita }));

export async function renderDocx({ meta, bloques }) {
  const hijos = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(meta.titulo)] }),
    ...[
      ['Código', meta.codigo],
      ['Versión', meta.version],
      ['Vigente desde', meta.vigencia],
      ['Responsable', meta.responsable],
      ['Clasificación', meta.clasificacion],
    ]
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          new Paragraph({
            spacing: { after: 0 },
            children: [new TextRun({ text: `${k}: `, bold: true, size: 18, color: '6B7285' }), new TextRun({ text: v, size: 18, color: '6B7285' })],
          }),
      ),
    new Paragraph({ text: '' }),
  ];

  let listaOrdenada = 0;
  for (const b of bloques) {
    if (b.tipo === 'h') {
      if (b.nivel === 1) continue;
      hijos.push(
        new Paragraph({
          heading: b.nivel === 2 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          children: [new TextRun(b.texto)],
        }),
      );
    } else if (b.tipo === 'p') {
      hijos.push(new Paragraph({ children: runs(b.texto), spacing: { after: 120 } }));
    } else if (b.tipo === 'nota') {
      hijos.push(
        new Paragraph({
          children: [new TextRun({ text: textoPlano(b.texto), italics: true })],
          shading: { type: ShadingType.CLEAR, fill: 'F0F2F7', color: 'auto' },
          spacing: { before: 120, after: 120 },
        }),
      );
    } else if (b.tipo === 'ul') {
      for (const item of b.items) hijos.push(new Paragraph({ children: runs(item), bullet: { level: 0 } }));
    } else if (b.tipo === 'ol') {
      listaOrdenada++;
      for (const item of b.items)
        hijos.push(
          new Paragraph({ children: runs(item), numbering: { reference: 'numerada', level: 0, instance: listaOrdenada } }),
        );
    } else if (b.tipo === 'tabla') {
      const borde = { style: BorderStyle.SINGLE, size: 4, color: 'D5D9E3' };
      const celda = (v, encabezado) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: textoPlano(v ?? ''), bold: encabezado, size: 18 })] })],
          shading: encabezado ? { type: ShadingType.CLEAR, fill: 'F0F2F7', color: 'auto' } : undefined,
          borders: { top: borde, bottom: borde, left: borde, right: borde },
        });
      hijos.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ tableHeader: true, children: b.encabezado.map((v) => celda(v, true)) }),
            ...b.filas.map((f) => new TableRow({ children: b.encabezado.map((_, c) => celda(f[c], false)) })),
          ],
        }),
        new Paragraph({ text: '' }),
      );
    }
  }

  const doc = new Document({
    creator: meta.responsable,
    title: meta.titulo,
    description: meta.codigo,
    styles: { default: { document: { run: { font: 'Calibri', size: 21 } } } },
    numbering: {
      config: [
        {
          reference: 'numerada',
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START }],
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [new TextRun({ text: `${empresa.nombre} · ${meta.codigo ?? ''}`, size: 16, color: '6B7285' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    size: 16,
                    color: '6B7285',
                    children: [
                      `${meta.clasificacion ?? 'Uso interno'} · Versión ${meta.version ?? '1.0'} · Página `,
                      PageNumber.CURRENT,
                      ' de ',
                      PageNumber.TOTAL_PAGES,
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children: hijos,
      },
    ],
  });
  return { buffer: await Packer.toBuffer(doc) };
}
