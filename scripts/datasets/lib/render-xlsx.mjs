import ExcelJS from 'exceljs';
import { empresa } from '../empresa.mjs';

const FORMATOS = {
  usd: '#,##0.00',
  usd0: '#,##0',
  int: '#,##0',
  pct: '0.0%',
  dec: '0.00',
};

// hojas: [{ nombre, columnas: [{ titulo, clave, ancho?, formato? }], filas, totales?: string[] }]
// `totales` lista las claves de columna que llevan una fila de SUMA al final.
export async function renderXlsx({ titulo, autor, fecha, hojas }) {
  const libro = new ExcelJS.Workbook();
  libro.creator = autor ?? empresa.nombre;
  libro.company = empresa.nombre;
  libro.title = titulo;
  libro.created = new Date(`${fecha}T09:00:00Z`);
  libro.modified = new Date(`${fecha}T09:00:00Z`);

  for (const hoja of hojas) {
    const ws = libro.addWorksheet(hoja.nombre, { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = hoja.columnas.map((c) => ({
      header: c.titulo,
      key: c.clave,
      width: c.ancho ?? Math.max(12, c.titulo.length + 2),
      style: c.formato ? { numFmt: FORMATOS[c.formato] } : {},
    }));
    ws.addRows(hoja.filas);
    const cab = ws.getRow(1);
    cab.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cab.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3F3FB8' } };
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: hoja.columnas.length } };

    if (hoja.totales?.length) {
      const ultima = hoja.filas.length + 1;
      const fila = ws.addRow({});
      fila.getCell(1).value = 'Total';
      fila.font = { bold: true };
      hoja.columnas.forEach((c, i) => {
        if (!hoja.totales.includes(c.clave)) return;
        const col = ws.getColumn(i + 1).letter;
        const total = Math.round(hoja.filas.reduce((s, f) => s + (Number(f[c.clave]) || 0), 0) * 100) / 100;
        fila.getCell(i + 1).value = { formula: `SUM(${col}2:${col}${ultima})`, result: total };
      });
    }
  }
  return { buffer: Buffer.from(await libro.xlsx.writeBuffer()) };
}
