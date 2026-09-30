// Documentos de texto cuyas cifras salen de los datos generados (datos.mjs).
// Así el informe trimestral y el acta siempre coinciden con las hojas de cálculo.
import { personas } from './empresa.mjs';
import { round } from './lib/util.mjs';

const n0 = (n) => Math.round(n).toLocaleString('en-US');
const n2 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (x, dec = 1) => `${(x * 100).toFixed(dec)}%`;
const suma = (filas, k) => filas.reduce((s, f) => s + (f[k] ?? 0), 0);

export function resumenTrimestre(tablas, q) {
  const meses = [q * 3 - 2, q * 3 - 1, q * 3];
  const res = tablas.resultados.filter((r) => meses.includes(r.mes));
  const ingresos = round(suma(res, 'ingresos'));
  const presupuestoIngresos = suma(res, 'ingresos_presupuesto');
  const bruta = round(suma(res, 'utilidad_bruta'));
  const gastos = suma(res, 'gastos_operacion');
  const operacion = round(suma(res, 'utilidad_operacion'));
  const ebitda = round(suma(res, 'ebitda'));
  const neta = round(suma(res, 'utilidad_neta'));

  const cc = new Map();
  for (const p of tablas.presupuesto.filter((p) => meses.includes(p.mes))) {
    const x = cc.get(p.centro_costo) ?? { id: p.centro_costo, nombre: p.nombre, presupuesto: 0, real: 0 };
    x.presupuesto += p.presupuesto;
    x.real += p.real;
    cc.set(p.centro_costo, x);
  }
  const centros = [...cc.values()].map((x) => ({ ...x, variacion: x.real - x.presupuesto, pct: x.real / x.presupuesto - 1 }));

  const ventas = tablas.ventas.filter((v) => meses.includes(Number(v.fecha.slice(5, 7))));
  const agrupar = (k) => {
    const m = new Map();
    for (const v of ventas) m.set(v[k], (m.get(v[k]) ?? 0) + v.importe);
    return [...m.entries()].map(([nombre, importe]) => ({ nombre, importe: round(importe) })).sort((a, b) => b.importe - a.importe);
  };
  return {
    q, meses, ingresos, presupuestoIngresos, bruta, gastos, operacion, ebitda, neta,
    margenBruto: bruta / ingresos,
    variacionIngresos: ingresos / presupuestoIngresos - 1,
    centros,
    clientes: agrupar('cliente'),
    productos: agrupar('sku'),
    pedidos: ventas.length,
  };
}

export function documentosDinamicos(tablas) {
  const q1 = resumenTrimestre(tablas, 1);
  const q2 = resumenTrimestre(tablas, 2);
  const desviados = q2.centros.filter((c) => Math.abs(c.pct) > 0.1).sort((a, b) => b.pct - a.pct);
  const mant = q2.centros.find((c) => c.id === 'CC-620');
  const com = q2.centros.find((c) => c.id === 'CC-500');
  const junioCom = tablas.presupuesto.find((p) => p.centro_costo === 'CC-500' && p.mes === 6);

  const informe = `---
id: fin-informe-q2-2026
titulo: Informe financiero del segundo trimestre de 2026
archivo: Informe financiero Q2 2026
formato: pdf
area: finanzas
codigo: INF-FIN-2026-Q2
version: 1.0
vigencia: 2026-07-14
responsable: ${personas.finanzas.nombre}
clasificacion: Confidencial
---

# Informe financiero del segundo trimestre de 2026

## Resumen ejecutivo

En el segundo trimestre de 2026 (abril a junio), Nexora Industrial S.A. registró ingresos por **${n2(q2.ingresos)} USD**, ${q2.variacionIngresos >= 0 ? 'por encima' : 'por debajo'} del presupuesto de ${n0(q2.presupuestoIngresos)} USD en ${pct(Math.abs(q2.variacionIngresos))}. Frente al primer trimestre (${n2(q1.ingresos)} USD), los ingresos crecieron ${pct(q2.ingresos / q1.ingresos - 1)}.

El margen bruto del trimestre fue de **${pct(q2.margenBruto)}** (primer trimestre: ${pct(q1.margenBruto)}) y la utilidad de operación alcanzó ${n2(q2.operacion)} USD. El EBITDA fue de ${n2(q2.ebitda)} USD y la utilidad neta de ${n2(q2.neta)} USD.

## Resultados del trimestre

| Concepto | Primer trimestre (USD) | Segundo trimestre (USD) |
|---|---|---|
| Ingresos | ${n2(q1.ingresos)} | ${n2(q2.ingresos)} |
| Utilidad bruta | ${n2(q1.bruta)} | ${n2(q2.bruta)} |
| Margen bruto | ${pct(q1.margenBruto)} | ${pct(q2.margenBruto)} |
| Gastos de operación | ${n0(q1.gastos)} | ${n0(q2.gastos)} |
| Utilidad de operación | ${n2(q1.operacion)} | ${n2(q2.operacion)} |
| EBITDA | ${n2(q1.ebitda)} | ${n2(q2.ebitda)} |
| Utilidad neta | ${n2(q1.neta)} | ${n2(q2.neta)} |

## Ventas

Se facturaron ${q2.pedidos} pedidos en el trimestre. Los cinco clientes con mayores compras fueron:

| Cliente | Ventas del trimestre (USD) |
|---|---|
${q2.clientes.slice(0, 5).map((c) => `| ${c.nombre} | ${n2(c.importe)} |`).join('\n')}

Por producto, la bomba **${q2.productos[0].nombre}** fue la de mayor venta, con ${n2(q2.productos[0].importe)} USD (${pct(q2.productos[0].importe / q2.ingresos)} de los ingresos), seguida de ${q2.productos[1].nombre} con ${n2(q2.productos[1].importe)} USD.

## Gastos por centro de costo

Conforme al Procedimiento de cierre contable mensual, se explican las variaciones del trimestre superiores a ±10% frente al presupuesto:

| Centro de costo | Presupuesto Q2 (USD) | Real Q2 (USD) | Variación |
|---|---|---|---|
${desviados.map((c) => `| ${c.id} ${c.nombre} | ${n0(c.presupuesto)} | ${n0(c.real)} | ${c.variacion >= 0 ? '+' : ''}${pct(c.pct)} |`).join('\n')}

- **${mant.id} Mantenimiento (${mant.pct >= 0 ? '+' : ''}${pct(mant.pct)}, ${n0(mant.variacion)} USD sobre presupuesto):** se debe al overhaul no presupuestado de los husillos de la Línea 2 en abril, mayo y junio, tras detectarse vibraciones por encima del límite. Incluye rodamientos de husillo, calibración geométrica y horas adicionales del proveedor externo de mantenimiento.
- **${com.id} Comercial (${com.pct >= 0 ? '+' : ''}${pct(com.pct)}):** la participación en la feria industrial de junio elevó el gasto de ese mes a ${n0(junioCom.real)} USD frente a ${n0(junioCom.presupuesto)} USD presupuestados.

El resto de los centros de costo se mantuvo dentro del rango de ±10%.

## Perspectivas

- Se espera que el gasto de Mantenimiento regrese a niveles presupuestados en el tercer trimestre, una vez concluido el overhaul de la Línea 2.
- La renovación del contrato de suministro de Aguas del Valle S.A. (vence en enero de 2027) y el proyecto de rebombeo de Minera Cerro Alto son las principales oportunidades del segundo semestre.
- Se recomienda revisar el presupuesto de Mantenimiento de 2027 para incluir un fondo para overhauls programados.

Las cifras de este informe corresponden a los estados financieros definitivos de abril, mayo y junio, aprobados conforme al calendario de cierre.
`;

  const acta = `---
id: leg-acta-comite-julio-2026
titulo: Acta del Comité de Dirección - Sesión ordinaria de julio de 2026
archivo: Acta Comité de Dirección julio 2026
formato: docx
area: legal
codigo: ACT-DIR-2026-07
version: 1.0
vigencia: 2026-07-20
responsable: ${personas.legal.nombre}
clasificacion: Confidencial
---

# Acta del Comité de Dirección - Sesión ordinaria de julio de 2026

## Datos de la sesión

| Campo | Valor |
|---|---|
| Fecha | 20 de julio de 2026 |
| Lugar | Sala de consejo, Oficinas centrales |
| Preside | ${personas.director.nombre}, ${personas.director.puesto} |
| Secretario | ${personas.legal.nombre}, ${personas.legal.puesto} |
| Asistentes | ${[personas.finanzas, personas.operaciones, personas.comercial, personas.rrhh].map((p) => `${p.nombre} (${p.puesto})`).join('; ')} |

## Orden del día

1. Resultados financieros del segundo trimestre.
2. Sobrecosto de Mantenimiento por el overhaul de la Línea 2.
3. Desempeño del proveedor de mantenimiento.
4. Plataforma Knowledge AI.
5. Asuntos varios.

## 1. Resultados financieros del segundo trimestre

La Directora de Finanzas presentó el Informe financiero del segundo trimestre de 2026. Los ingresos del trimestre fueron de ${n2(q2.ingresos)} USD, ${pct(Math.abs(q2.variacionIngresos))} ${q2.variacionIngresos >= 0 ? 'por encima' : 'por debajo'} del presupuesto, con un margen bruto de ${pct(q2.margenBruto)}. El Comité tomó conocimiento de los resultados.

## 2. Sobrecosto de Mantenimiento

La Gerente de Operaciones explicó que el centro de costo ${mant.id} Mantenimiento cerró el trimestre con un gasto real de ${n0(mant.real)} USD frente a ${n0(mant.presupuesto)} USD presupuestados (${pct(mant.pct)} por encima), debido al overhaul de los husillos de la Línea 2.

**Acuerdo 2026-07-01:** se aprueba el sobrecosto como gasto extraordinario y se instruye a Operaciones a presentar, en la sesión de octubre, un plan de mantenimiento predictivo para la Línea 2 que incluya el monitoreo mensual de vibración.

**Acuerdo 2026-07-02:** Finanzas incluirá en el presupuesto de 2027 un fondo de overhauls programados para las Líneas 1 y 2.

## 3. Desempeño del proveedor de mantenimiento

Se revisó el cumplimiento de los niveles de servicio de Servicios Técnicos Arvelo S.A. La Gerente de Operaciones informó que el proveedor cumplió la mayoría de las órdenes críticas dentro de las 24 horas, pero hubo retrasos en órdenes de prioridad Alta.

**Acuerdo 2026-07-03:** Operaciones aplicará estrictamente las penalizaciones del contrato CT-2026-004 (2% de la mensualidad por cada orden fuera de SLA, con tope del 20%) y presentará un reporte mensual de cumplimiento al Comité.

## 4. Plataforma Knowledge AI

La Gerente de Recursos Humanos, como responsable funcional de la plataforma, presentó el avance de Knowledge AI: repositorio documental por área, búsqueda con citas (RAG) y primeros agentes para consultas de políticas internas.

**Acuerdo 2026-07-04:** se aprueba una prueba piloto en el cuarto trimestre con los agentes de Soporte interno (políticas de RR. HH. y viáticos) y de Finanzas. La Oficial de Protección de Datos deberá validar que ningún documento Restringido se incluya en las colecciones del piloto.

## 5. Asuntos varios

- La Gerente Comercial informó que el contrato de distribución con Hidrotec Distribuciones vence en octubre y que el distribuidor solicitará mejores condiciones.
- Próxima sesión ordinaria: 19 de octubre de 2026.

Sin más asuntos que tratar, se cerró la sesión a las 13:40 horas.
`;
  return [informe, acta];
}
