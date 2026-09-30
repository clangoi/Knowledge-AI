// Datos estructurados del corpus (hojas de cálculo y CSV). Todo se genera con
// semilla fija a partir de empresa.mjs, así que los resultados son idénticos en
// cada ejecución y las respuestas esperadas de RAG/agentes se pueden calcular.
import {
  centrosCosto,
  clientes,
  diasVacaciones,
  descuentoVolumen,
  empresa,
  personas,
  productos,
  proveedores,
  reglas,
} from './empresa.mjs';
import {
  APELLIDOS,
  MESES,
  NOMBRES,
  aniosCumplidos,
  diasHabilesEntre,
  esHabil,
  iso,
  fecha,
  rng,
  round,
  sumarDias,
} from './lib/util.mjs';

const CORTE = empresa.fechaCorte;
const r = rng(20260930);

// ---------------------------------------------------------------------------
// Plantilla de personal
// ---------------------------------------------------------------------------
const ESTRUCTURA = [
  // [área, puesto, sede, cantidad, turnos?]
  ['Dirección', 'Asistente de Dirección', 'OC', 1],
  ['Dirección', 'Jefe de TI', 'OC', 1],
  ['Dirección', 'Analista de TI', 'OC', 5],
  ['Finanzas', 'Contador', 'OC', 6],
  ['Finanzas', 'Analista financiero', 'OC', 5],
  ['Finanzas', 'Comprador', 'OC', 4],
  ['Finanzas', 'Analista de tesorería', 'OC', 2],
  ['Legal', 'Abogado corporativo', 'OC', 3],
  ['Legal', 'Asistente legal', 'OC', 1],
  ['Recursos Humanos', 'Generalista de RR. HH.', 'OC', 4],
  ['Recursos Humanos', 'Analista de nómina', 'OC', 3],
  ['Recursos Humanos', 'Coordinador de capacitación', 'OC', 2],
  ['Comercial', 'Ejecutivo de ventas', 'OC', 8],
  ['Comercial', 'Ingeniero de aplicaciones', 'OC', 4],
  ['Comercial', 'Técnico de servicio postventa', 'PS', 8],
  ['Comercial', 'Agente de atención a clientes', 'OC', 4],
  ['Operaciones', 'Jefe de Mantenimiento, Planta Sur', 'PS', 1],
  ['Operaciones', 'Técnico de mantenimiento', 'PN', 14, true],
  ['Operaciones', 'Técnico de mantenimiento', 'PS', 10, true],
  ['Operaciones', 'Inspector de seguridad', 'PN', 2, true],
  ['Operaciones', 'Inspector de seguridad', 'PS', 2, true],
  ['Operaciones', 'Supervisor de producción', 'PN', 6, true],
  ['Operaciones', 'Operador CNC', 'PN', 60, true],
  ['Operaciones', 'Operador de fundición', 'PN', 40, true],
  ['Operaciones', 'Inspector de calidad', 'PN', 8, true],
  ['Operaciones', 'Supervisor de producción', 'PS', 5, true],
  ['Operaciones', 'Ensamblador', 'PS', 70, true],
  ['Operaciones', 'Técnico de pruebas', 'PS', 12, true],
  ['Operaciones', 'Inspector de calidad', 'PS', 6, true],
  ['Operaciones', 'Almacenista', 'PN', 6, true],
  ['Operaciones', 'Almacenista', 'PS', 6, true],
];

const CLAVE_PERSONAS = [
  ['director', 'Dirección', 'OC', '2009-04-13'],
  ['finanzas', 'Finanzas', 'OC', '2012-08-06'],
  ['contabilidad', 'Finanzas', 'OC', '2015-02-02'],
  ['compras', 'Finanzas', 'OC', '2018-10-15'],
  ['legal', 'Legal', 'OC', '2016-05-09'],
  ['datos', 'Legal', 'OC', '2022-03-01'],
  ['rrhh', 'Recursos Humanos', 'OC', '2014-01-20'],
  ['comercial', 'Comercial', 'OC', '2017-07-03'],
  ['operaciones', 'Operaciones', 'OC', '2011-09-12'],
  ['mantenimiento', 'Operaciones', 'PN', '2008-06-02'],
  ['seguridad', 'Operaciones', 'PN', '2019-11-04'],
];

const sedeNombre = Object.fromEntries(empresa.sedes.map((s) => [s.id, s.nombre]));

function generarPersonal() {
  const usados = new Set();
  const nombre = () => {
    for (;;) {
      const n = `${r.pick(NOMBRES)} ${r.pick(APELLIDOS)} ${r.pick(APELLIDOS)}`;
      if (!usados.has(n)) {
        usados.add(n);
        return n;
      }
    }
  };
  const ingreso = () => {
    // Más ingresos recientes que antiguos.
    const anio = 2026 - Math.floor(Math.pow(r.next(), 1.8) * 27);
    const mes = r.int(1, anio === 2026 ? 8 : 12);
    return `${anio}-${String(mes).padStart(2, '0')}-${String(r.int(1, 28)).padStart(2, '0')}`;
  };

  const filas = [];
  for (const [clave, area, sede, alta] of CLAVE_PERSONAS) {
    const p = personas[clave];
    usados.add(p.nombre);
    filas.push({ nombre: p.nombre, area, puesto: p.puesto, sede, turno: 'Administrativo', fecha_ingreso: alta, tipo_contrato: 'Indeterminado' });
  }
  for (const [area, puesto, sede, n, conTurno] of ESTRUCTURA) {
    for (let i = 0; i < n; i++) {
      const alta = ingreso();
      filas.push({
        nombre: nombre(),
        area,
        puesto,
        sede,
        turno: conTurno ? r.pick(['T1 (06:00-14:00)', 'T2 (14:00-22:00)', 'T3 (22:00-06:00)']) : 'Administrativo',
        fecha_ingreso: alta,
        tipo_contrato: alta >= '2026-05-01' && r.chance(0.5) ? 'Temporal' : 'Indeterminado',
      });
    }
  }
  return filas.map((f, i) => {
    const antiguedad = aniosCumplidos(f.fecha_ingreso, CORTE);
    const derecho = diasVacaciones(antiguedad);
    return {
      id: `E-${String(i + 1).padStart(4, '0')}`,
      ...f,
      sede: sedeNombre[f.sede],
      antiguedad_anios: antiguedad,
      vacaciones_derecho: derecho,
      vacaciones_tomadas_2026: derecho ? r.int(0, derecho) : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Ventas 2026 (pedidos) y estado de resultados
// ---------------------------------------------------------------------------
function generarVentas(personal) {
  const ejecutivos = personal.filter((p) => p.puesto === 'Ejecutivo de ventas').map((p) => p.nombre);
  const pesoCliente = clientes.map((c, i) => ({ c, peso: [9, 7, 5, 6, 4, 4, 10, 8, 3, 3, 2, 6][i] }));
  const totalPeso = pesoCliente.reduce((s, x) => s + x.peso, 0);
  const pickCliente = () => {
    let x = r.next() * totalPeso;
    for (const { c, peso } of pesoCliente) if ((x -= peso) < 0) return c;
    return clientes[0];
  };
  const cantidad = (p) =>
    p.familia === 'Bombas' ? r.int(1, p.precio > 10000 ? 8 : 35) : p.familia === 'Válvulas' ? r.int(5, 120) : r.int(5, 60);

  const filas = [];
  let folio = 1;
  // Cumplimiento de ingresos frente a presupuesto por mes (se generan pedidos
  // hasta alcanzar la meta; el último pedido la rebasa ligeramente).
  const cumplimiento = [0.97, 1.02, 1.04, 0.99, 1.05, 1.03, 0.95, 1.01, 0.98];
  for (let mes = 1; mes <= 9; mes++) {
    const meta = INGRESOS_PRESUPUESTO[mes - 1] * cumplimiento[mes - 1];
    for (let acumulado = 0; acumulado < meta; acumulado += filas.at(-1).importe) {
      const dia = r.int(1, mes === 9 ? 30 : new Date(Date.UTC(2026, mes, 0)).getUTCDate());
      const f = `2026-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const cliente = pickCliente();
      const producto = r.pick(productos);
      const unidades = cantidad(producto);
      const distribuidor = cliente.tipo === 'Distribuidor autorizado';
      const negociado = r.chance(0.2) ? r.int(1, 6) : 0;
      const descuento = descuentoVolumen(unidades) + (distribuidor ? reglas.descuentoDistribuidor : 0) + negociado;
      const bruto = unidades * producto.precio;
      filas.push({
        pedido: `PV-26${String(folio++).padStart(4, '0')}`,
        fecha: f,
        cliente_id: cliente.id,
        cliente: cliente.nombre,
        tipo_cliente: cliente.tipo,
        sku: producto.sku,
        producto: producto.nombre,
        unidades,
        precio_lista: producto.precio,
        descuento_pct: descuento,
        importe: round(bruto * (1 - descuento / 100)),
        ejecutivo: r.pick(ejecutivos),
      });
    }
  }
  return filas.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.pedido.localeCompare(b.pedido));
}

// Presupuesto anual de gastos por centro de costo (USD por mes).
const PRESUPUESTO_MENSUAL = {
  'CC-100': 48000, 'CC-200': 62000, 'CC-210': 21000, 'CC-300': 26000, 'CC-400': 38000, 'CC-500': 118000,
  'CC-510': 44000, 'CC-600': 402000, 'CC-610': 358000, 'CC-620': 96000, 'CC-630': 22000, 'CC-700': 57000,
};
const PRODUCCION = new Set(['CC-600', 'CC-610', 'CC-620']);
const INGRESOS_PRESUPUESTO = [2100000, 2200000, 2450000, 2400000, 2550000, 2600000, 2350000, 2300000, 2500000, 2600000, 2500000, 2400000];
const MESES_CERRADOS = 8; // agosto 2026 es el último mes con cierre contable

function generarPresupuesto() {
  const filas = [];
  for (const cc of centrosCosto) {
    for (let m = 1; m <= 12; m++) {
      const presupuesto = PRESUPUESTO_MENSUAL[cc.id];
      let real = null;
      if (m <= MESES_CERRADOS) {
        let factor = 0.92 + r.next() * 0.16;
        // Desviaciones intencionales (explicadas en el acta del comité y el informe trimestral).
        if (cc.id === 'CC-620' && m >= 4 && m <= 6) factor = [1.21, 1.46, 1.31][m - 4]; // overhaul Línea 2
        if (cc.id === 'CC-700' && m === 3) factor = 1.38; // renovación de licencias ERP
        if (cc.id === 'CC-500' && m === 6) factor = 1.24; // feria industrial
        real = Math.round(presupuesto * factor);
      }
      filas.push({
        centro_costo: cc.id,
        nombre: cc.nombre,
        area: cc.area,
        mes: m,
        mes_nombre: MESES[m - 1],
        presupuesto,
        real,
        variacion: real === null ? null : real - presupuesto,
        variacion_pct: real === null ? null : round((real - presupuesto) / presupuesto, 4),
      });
    }
  }
  return filas;
}

function generarResultados(ventas, presupuesto) {
  const filas = [];
  for (let m = 1; m <= MESES_CERRADOS; m++) {
    const ingresos = round(ventas.filter((v) => Number(v.fecha.slice(5, 7)) === m).reduce((s, v) => s + v.importe, 0));
    const delMes = presupuesto.filter((p) => p.mes === m);
    const materiales = round(ingresos * (0.29 + r.next() * 0.02));
    const manufactura = delMes.filter((p) => PRODUCCION.has(p.centro_costo)).reduce((s, p) => s + p.real, 0);
    const costo = round(materiales + manufactura);
    const gastos = delMes.filter((p) => !PRODUCCION.has(p.centro_costo)).reduce((s, p) => s + p.real, 0);
    const bruta = round(ingresos - costo);
    const operacion = round(bruta - gastos);
    const depreciacion = 64000;
    const financieros = 18000 + r.int(0, 6000);
    const antesImpuestos = round(operacion - financieros);
    const impuestos = round(Math.max(0, antesImpuestos) * 0.3);
    filas.push({
      mes: m,
      mes_nombre: MESES[m - 1],
      ingresos_presupuesto: INGRESOS_PRESUPUESTO[m - 1],
      ingresos,
      costo_materiales: materiales,
      costo_manufactura: manufactura,
      costo_ventas: costo,
      utilidad_bruta: bruta,
      margen_bruto_pct: round(bruta / ingresos, 4),
      gastos_operacion: gastos,
      utilidad_operacion: operacion,
      ebitda: round(operacion + depreciacion),
      gastos_financieros: financieros,
      utilidad_antes_impuestos: antesImpuestos,
      impuestos,
      utilidad_neta: round(antesImpuestos - impuestos),
    });
  }
  return filas;
}

// ---------------------------------------------------------------------------
// Cuentas por pagar
// ---------------------------------------------------------------------------
function generarCuentasPorPagar() {
  const filas = [];
  const montoPorRubro = {
    'PR-001': [18000, 85000], 'PR-002': [12000, 60000], 'PR-003': [15000, 70000], 'PR-004': [2500, 14000],
    'PR-005': [3000, 16000], 'PR-006': [18500, 18500], 'PR-007': [900, 6000], 'PR-008': [1500, 12000],
    'PR-009': [2000, 9000], 'PR-010': [1200, 8000], 'PR-011': [800, 7000], 'PR-012': [1000, 5000],
  };
  const ccPorProveedor = {
    'PR-001': 'CC-600', 'PR-002': 'CC-600', 'PR-003': 'CC-610', 'PR-004': 'CC-610', 'PR-005': 'CC-620',
    'PR-006': 'CC-620', 'PR-007': 'CC-620', 'PR-008': 'CC-600', 'PR-009': 'CC-500', 'PR-010': 'CC-700',
    'PR-011': 'CC-630', 'PR-012': 'CC-610',
  };
  let folio = 1;
  for (let i = 0; i < 96; i++) {
    const prov = proveedores[i % proveedores.length];
    const emision = sumarDias('2026-06-01', r.int(0, 115));
    const vence = sumarDias(emision, reglas.plazoPagoProveedoresDias);
    const [min, max] = montoPorRubro[prov.id];
    const monto = min === max ? min : round(min + r.next() * (max - min));
    let estado = 'Pendiente';
    let pago = null;
    if (vence < CORTE && r.chance(0.86)) {
      estado = 'Pagada';
      pago = sumarDias(vence, r.int(-6, 3));
    } else if (vence >= CORTE && r.chance(0.12)) {
      estado = 'Pagada';
      pago = sumarDias(emision, r.int(20, 40));
      if (pago > CORTE) pago = CORTE;
    }
    filas.push({
      factura: `F-${prov.id.slice(3)}-${String(folio++).padStart(5, '0')}`,
      proveedor_id: prov.id,
      proveedor: prov.nombre,
      centro_costo: ccPorProveedor[prov.id],
      fecha_emision: emision,
      fecha_vencimiento: vence,
      monto,
      estado,
      fecha_pago: pago,
    });
  }
  return filas.sort((a, b) => a.fecha_emision.localeCompare(b.fecha_emision));
}

// ---------------------------------------------------------------------------
// Gastos de viaje
// ---------------------------------------------------------------------------
const DESTINOS = {
  nacional: ['Ciudad Portuaria', 'Valle Central', 'Región Minera Norte', 'Distrito Agrícola Sur', 'Capital'],
  internacional: ['Feria industrial (extranjero)', 'Visita a proveedor (extranjero)', 'Capacitación de fabricante (extranjero)'],
};

function generarGastosViaje(personal) {
  const viajeros = personal.filter((p) =>
    ['Ejecutivo de ventas', 'Ingeniero de aplicaciones', 'Técnico de servicio postventa', 'Comprador', 'Gerente Comercial', 'Directora de Finanzas', 'Gerente de Operaciones'].includes(p.puesto),
  );
  const ccDe = (p) =>
    p.area === 'Comercial' ? (p.puesto === 'Técnico de servicio postventa' ? 'CC-510' : 'CC-500') : p.area === 'Finanzas' ? (p.puesto === 'Comprador' ? 'CC-210' : 'CC-200') : 'CC-100';

  const filas = [];
  let nViaje = 1;
  let nGasto = 1;
  for (let v = 0; v < 26; v++) {
    const persona = r.pick(viajeros);
    const tipo = r.chance(0.2) ? 'internacional' : 'nacional';
    const inicio = sumarDias('2026-01-12', r.int(0, 250));
    const noches = r.int(1, tipo === 'internacional' ? 5 : 3);
    const regreso = sumarDias(inicio, noches);
    let reporte = regreso;
    let habiles = r.int(2, 9);
    while (habiles > 0) {
      reporte = sumarDias(reporte, 1);
      if (esHabil(reporte)) habiles--;
    }
    const viaje = {
      id_viaje: `V-26${String(nViaje++).padStart(3, '0')}`,
      empleado_id: persona.id,
      empleado: persona.nombre,
      centro_costo: ccDe(persona),
      destino: r.pick(DESTINOS[tipo]),
      tipo_viaje: tipo === 'nacional' ? 'Nacional' : 'Internacional',
      fecha_inicio: inicio,
      fecha_regreso: regreso,
      fecha_reporte: reporte,
    };
    const topeHotel = reglas.viaticos.hospedajeNoche[tipo];
    const topeComida = reglas.viaticos.alimentacionDia[tipo];
    const lineas = [
      { concepto: 'Hospedaje', cantidad: noches, monto_total: round(noches * r.float(topeHotel * 0.65, topeHotel)), comprobante: 'Sí', notas: '' },
      { concepto: 'Alimentación', cantidad: noches + 1, monto_total: round((noches + 1) * r.float(topeComida * 0.5, topeComida)), comprobante: 'Sí', notas: '' },
    ];
    if (tipo === 'internacional') lineas.push({ concepto: 'Vuelo', cantidad: 1, monto_total: r.float(650, 1400), comprobante: 'Sí', notas: 'Clase económica' });
    else if (r.chance(0.5)) {
      const km = r.int(80, 450);
      lineas.push({ concepto: 'Kilometraje', cantidad: km, monto_total: round(km * reglas.viaticos.kilometraje), comprobante: 'Sí', notas: 'Auto propio' });
    } else lineas.push({ concepto: 'Vuelo', cantidad: 1, monto_total: r.float(160, 420), comprobante: 'Sí', notas: 'Clase económica' });
    if (r.chance(0.6)) lineas.push({ concepto: 'Transporte local', cantidad: 1, monto_total: r.float(12, 70), comprobante: 'Sí', notas: 'Taxi / app' });
    for (const l of lineas) filas.push({ id_gasto: `G-${String(nGasto++).padStart(4, '0')}`, ...viaje, ...l });
  }

  // Incumplimientos plantados (todos en el tercer trimestre) para la auditoría.
  const plantados = [
    { persona: 'Ejecutivo de ventas', tipo: 'nacional', inicio: '2026-07-06', noches: 2, extra: { hotel: 165 } },
    { persona: 'Ingeniero de aplicaciones', tipo: 'internacional', inicio: '2026-07-20', noches: 4, extra: { comida: 112 } },
    { persona: 'Técnico de servicio postventa', tipo: 'nacional', inicio: '2026-08-03', noches: 1, extra: { habilesReporte: 16 } },
    { persona: 'Ejecutivo de ventas', tipo: 'nacional', inicio: '2026-08-17', noches: 2, extra: { alcohol: 86.4 } },
    { persona: 'Comprador', tipo: 'nacional', inicio: '2026-09-01', noches: 1, extra: { sinComprobante: 48 } },
    { persona: 'Ejecutivo de ventas', tipo: 'nacional', inicio: '2026-09-08', noches: 1, extra: { km: [320, 150] } },
  ];
  for (const p of plantados) {
    const candidatos = viajeros.filter((x) => x.puesto === p.persona);
    const persona = candidatos[(nViaje * 7) % candidatos.length];
    const regreso = sumarDias(p.inicio, p.noches);
    let reporte = regreso;
    let habiles = p.extra.habilesReporte ?? 4;
    while (habiles > 0) {
      reporte = sumarDias(reporte, 1);
      if (esHabil(reporte)) habiles--;
    }
    const viaje = {
      id_viaje: `V-26${String(nViaje++).padStart(3, '0')}`,
      empleado_id: persona.id,
      empleado: persona.nombre,
      centro_costo: ccDe(persona),
      destino: DESTINOS[p.tipo][nViaje % DESTINOS[p.tipo].length],
      tipo_viaje: p.tipo === 'nacional' ? 'Nacional' : 'Internacional',
      fecha_inicio: p.inicio,
      fecha_regreso: regreso,
      fecha_reporte: reporte,
    };
    const hotel = p.extra.hotel ?? reglas.viaticos.hospedajeNoche[p.tipo] - 18;
    const comida = p.extra.comida ?? reglas.viaticos.alimentacionDia[p.tipo] - 12;
    const lineas = [
      { concepto: 'Hospedaje', cantidad: p.noches, monto_total: round(p.noches * hotel), comprobante: 'Sí', notas: '' },
      { concepto: 'Alimentación', cantidad: p.noches + 1, monto_total: round((p.noches + 1) * comida), comprobante: 'Sí', notas: '' },
    ];
    if (p.tipo === 'internacional') lineas.push({ concepto: 'Vuelo', cantidad: 1, monto_total: 980, comprobante: 'Sí', notas: 'Clase económica' });
    if (p.extra.alcohol) lineas.push({ concepto: 'Otros', cantidad: 1, monto_total: p.extra.alcohol, comprobante: 'Sí', notas: 'Bebidas alcohólicas en cena con cliente' });
    if (p.extra.sinComprobante) lineas.push({ concepto: 'Transporte local', cantidad: 1, monto_total: p.extra.sinComprobante, comprobante: 'No', notas: 'Taxi sin recibo' });
    if (p.extra.km) {
      const [km, cobrado] = p.extra.km;
      lineas.push({ concepto: 'Kilometraje', cantidad: km, monto_total: cobrado, comprobante: 'Sí', notas: 'Auto propio' });
    }
    for (const l of lineas) filas.push({ id_gasto: `G-${String(nGasto++).padStart(4, '0')}`, ...viaje, ...l });
  }
  return filas.sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio) || a.id_gasto.localeCompare(b.id_gasto));
}

// Revisa las líneas de gasto contra la Política de viáticos (POL-FIN-004).
export function auditarGastos(filas) {
  const v = reglas.viaticos;
  const hallazgos = [];
  const viajes = new Map();
  for (const f of filas) {
    const tipo = f.tipo_viaje === 'Nacional' ? 'nacional' : 'internacional';
    if (!viajes.has(f.id_viaje)) viajes.set(f.id_viaje, f);
    if (f.concepto === 'Hospedaje' && f.monto_total / f.cantidad > v.hospedajeNoche[tipo])
      hallazgos.push({ id_viaje: f.id_viaje, id_gasto: f.id_gasto, regla: 'Tope de hospedaje por noche', detalle: `${round(f.monto_total / f.cantidad)} USD/noche > ${v.hospedajeNoche[tipo]} USD` });
    if (f.concepto === 'Alimentación' && f.monto_total / f.cantidad > v.alimentacionDia[tipo])
      hallazgos.push({ id_viaje: f.id_viaje, id_gasto: f.id_gasto, regla: 'Tope de alimentación por día', detalle: `${round(f.monto_total / f.cantidad)} USD/día > ${v.alimentacionDia[tipo]} USD` });
    if (f.comprobante === 'No' && f.monto_total > v.sinComprobanteMaxDia)
      hallazgos.push({ id_viaje: f.id_viaje, id_gasto: f.id_gasto, regla: 'Gasto sin comprobante', detalle: `${f.monto_total} USD sin comprobante > ${v.sinComprobanteMaxDia} USD` });
    if (/alcoh/i.test(f.notas))
      hallazgos.push({ id_viaje: f.id_viaje, id_gasto: f.id_gasto, regla: 'Gasto no reembolsable (bebidas alcohólicas)', detalle: `${f.monto_total} USD` });
    if (f.concepto === 'Kilometraje' && Math.abs(f.monto_total - round(f.cantidad * v.kilometraje)) > 0.01)
      hallazgos.push({ id_viaje: f.id_viaje, id_gasto: f.id_gasto, regla: 'Kilometraje mal calculado', detalle: `${f.monto_total} USD cobrados; corresponden ${round(f.cantidad * v.kilometraje)} USD (${f.cantidad} km × ${v.kilometraje})` });
  }
  for (const f of viajes.values()) {
    const habiles = diasHabilesEntre(f.fecha_regreso, f.fecha_reporte);
    if (habiles > v.plazoReporteDiasHabiles)
      hallazgos.push({ id_viaje: f.id_viaje, id_gasto: null, regla: 'Reporte fuera de plazo', detalle: `${habiles} días hábiles > ${v.plazoReporteDiasHabiles}` });
  }
  return hallazgos;
}

// ---------------------------------------------------------------------------
// Registro de contratos
// ---------------------------------------------------------------------------
function generarContratos() {
  const c = (id, contraparte, tipo, inicio, fin, monto, responsable, renovacion, preaviso) => ({
    contrato: id,
    contraparte,
    tipo,
    fecha_inicio: inicio,
    fecha_fin: fin,
    monto_anual: monto,
    responsable,
    renovacion_automatica: renovacion ? 'Sí' : 'No',
    preaviso_dias: preaviso,
    estado: fin < CORTE ? 'Vencido' : 'Vigente',
  });
  const L = personas.legal.nombre;
  const F = personas.finanzas.nombre;
  const O = personas.operaciones.nombre;
  const C = personas.comercial.nombre;
  const P = personas.compras.nombre;
  return [
    c('CT-2026-001', 'Fundiciones Altamira', 'Suministro (contrato marco)', '2026-02-01', '2028-01-31', 780000, P, true, 60),
    c('CT-2026-002', 'Aceros Especiales Borda', 'Suministro (contrato marco)', '2026-02-01', '2028-01-31', 540000, P, true, 60),
    c('CT-2026-003', 'Motores Eléctricos Vantek', 'Suministro (contrato marco)', '2026-02-01', '2028-01-31', 610000, P, true, 60),
    c('CT-2026-004', 'Servicios Técnicos Arvelo S.A.', 'Servicios de mantenimiento', '2026-03-01', '2027-02-28', 222000, O, false, 30),
    c('CT-2026-005', 'Sellos y Empaques Norte', 'Suministro (contrato marco)', '2026-02-01', '2028-01-31', 98000, P, true, 60),
    c('CT-2026-006', 'Rodamientos Precisa', 'Suministro (contrato marco)', '2026-02-01', '2028-01-31', 86000, P, true, 60),
    c('CT-2025-011', 'Lubricantes Orbe', 'Suministro', '2025-11-01', '2026-10-31', 34000, P, false, 30),
    c('CT-2024-019', 'Soluciones TI Cumbre', 'Licencia de software (ERP)', '2024-11-16', '2026-11-15', 68000, F, true, 60),
    c('CT-2023-007', 'Inmobiliaria Los Sauces', 'Arrendamiento (bodega Planta Sur)', '2024-01-01', '2026-12-31', 96000, F, false, 90),
    c('CT-2024-022', 'Hidrotec Distribuciones', 'Distribución', '2024-10-16', '2026-10-15', 0, C, true, 45),
    c('CT-2025-030', 'Minera Cerro Alto', 'Confidencialidad (NDA)', '2025-12-02', '2026-12-01', 0, L, false, 0),
    c('CT-2025-014', 'Bombas y Equipos del Litoral', 'Distribución', '2025-04-01', '2027-03-31', 0, C, true, 45),
    c('CT-2025-021', 'Riegos Tecnificados del Sur', 'Distribución', '2025-07-01', '2027-06-30', 0, C, true, 45),
    c('CT-2026-008', 'Aguas del Valle S.A.', 'Venta y servicio (suministro anual)', '2026-01-15', '2027-01-14', 410000, C, false, 30),
    c('CT-2026-010', 'Municipio de San Aurelio', 'Venta (licitación pública)', '2026-04-01', '2027-03-31', 265000, C, false, 0),
    c('CT-2025-027', 'Logística Transandina', 'Servicios de transporte', '2025-09-01', '2027-08-31', 118000, P, true, 60),
    c('CT-2026-012', 'Seguridad Industrial Protek', 'Suministro de EPP', '2026-01-01', '2026-12-31', 52000, O, true, 30),
    c('CT-2025-003', 'Aseguradora Horizonte', 'Póliza de responsabilidad civil', '2025-10-01', '2026-09-30', 74000, F, false, 30),
    c('CT-2024-008', 'Herramientas de Corte Kesler', 'Suministro', '2024-06-01', '2026-05-31', 45000, P, false, 30),
    c('CT-2026-014', 'Pinturas Industriales Cromo', 'Suministro', '2026-03-01', '2027-02-28', 27000, P, false, 30),
    c('CT-2025-018', 'Petroquímica Delta Sur', 'Confidencialidad (NDA)', '2025-06-10', '2027-06-09', 0, L, false, 0),
    c('CT-2026-016', 'Consultora Ámbar Talento', 'Servicios de capacitación', '2026-02-15', '2027-02-14', 36000, personas.rrhh.nombre, false, 30),
    c('CT-2025-024', 'Clínica Laboral Integra', 'Servicios médicos de planta', '2025-08-01', '2027-07-31', 58000, personas.rrhh.nombre, true, 60),
    c('CT-2026-019', 'Cervecería Montes Azules', 'Venta y servicio (suministro anual)', '2026-06-01', '2027-05-31', 120000, C, false, 30),
  ];
}

// ---------------------------------------------------------------------------
// Inventario de repuestos
// ---------------------------------------------------------------------------
const CATALOGO_REPUESTOS = [
  ['Rodamientos', 'Rodamiento rígido de bolas 6205-2RS', 'PR-005', 9],
  ['Rodamientos', 'Rodamiento rígido de bolas 6308-2Z', 'PR-005', 21],
  ['Rodamientos', 'Rodamiento de rodillos cónicos 30210', 'PR-005', 34],
  ['Rodamientos', 'Rodamiento husillo CNC 7014 (par)', 'PR-005', 410],
  ['Sellos', 'Sello mecánico 35 mm SiC/SiC', 'PR-004', 96],
  ['Sellos', 'Sello mecánico 45 mm SiC/Grafito', 'PR-004', 118],
  ['Sellos', 'Juego de O-rings Viton (kit 50 pzs)', 'PR-004', 42],
  ['Sellos', 'Empaque de carcasa NX-250', 'PR-004', 28],
  ['Filtros', 'Filtro de refrigerante CNC 25 µm', 'PR-007', 36],
  ['Filtros', 'Filtro de aceite hidráulico 10 µm', 'PR-007', 44],
  ['Filtros', 'Filtro de aire compresor', 'PR-007', 58],
  ['Lubricantes', 'Aceite para guías ISO VG 68 (20 L)', 'PR-007', 88],
  ['Lubricantes', 'Grasa de litio EP2 (18 kg)', 'PR-007', 76],
  ['Lubricantes', 'Refrigerante soluble para mecanizado (20 L)', 'PR-007', 64],
  ['Herramientas CNC', 'Inserto de torneado CNMG 120408', 'PR-008', 7.5],
  ['Herramientas CNC', 'Fresa de carburo 12 mm 4 filos', 'PR-008', 48],
  ['Herramientas CNC', 'Broca de carburo 8.5 mm', 'PR-008', 39],
  ['Herramientas CNC', 'Portaherramientas BT40', 'PR-008', 165],
  ['Eléctricos', 'Contactor 3P 32 A', 'PR-003', 74],
  ['Eléctricos', 'Relé térmico 25-32 A', 'PR-003', 52],
  ['Eléctricos', 'Variador de frecuencia 15 kW', 'PR-003', 1380],
  ['Eléctricos', 'Sensor inductivo M18', 'PR-003', 31],
  ['Hidráulicos', 'Válvula solenoide 24 VDC', 'PR-004', 142],
  ['Hidráulicos', 'Manguera hidráulica 1/2" (m)', 'PR-004', 12],
  ['Hidráulicos', 'Bomba hidráulica de engranes 16 cc', 'PR-004', 690],
  ['Transmisión', 'Correa dentada HTD 8M-1200', 'PR-005', 54],
  ['Transmisión', 'Acoplamiento elástico tipo araña', 'PR-005', 67],
  ['Fundición', 'Arena sílica para moldeo (t)', 'PR-001', 95],
  ['Fundición', 'Refractario para cucharas (saco 25 kg)', 'PR-001', 58],
  ['Seguridad', 'Candado LOTO dieléctrico', 'PR-011', 19],
  ['Seguridad', 'Tarjeta de bloqueo (paquete 25)', 'PR-011', 14],
];

function generarInventario() {
  const filas = [];
  let n = 1;
  for (const sede of ['PN', 'PS']) {
    for (const [categoria, descripcion, prov, costo] of CATALOGO_REPUESTOS) {
      if (sede === 'PS' && categoria === 'Fundición') continue;
      if (sede === 'PN' && descripcion.includes('Empaque de carcasa')) continue;
      const consumo = costo > 500 ? r.int(0, 1) : costo > 100 ? r.int(1, 6) : r.int(4, 40);
      const minimo = Math.max(1, Math.ceil(consumo * 1.5));
      const stock = minimo + r.int(0, minimo * 2);
      filas.push({
        codigo: `RP-${sede}-${String(n++).padStart(3, '0')}`,
        sede: sedeNombre[sede],
        categoria,
        descripcion,
        ubicacion: `${sede === 'PN' ? 'Almacén N' : 'Almacén S'}-${String.fromCharCode(65 + r.int(0, 5))}${r.int(1, 12)}`,
        stock,
        stock_minimo: minimo,
        consumo_mensual: consumo,
        costo_unitario: costo,
        proveedor_id: prov,
        proveedor: proveedores.find((p) => p.id === prov).nombre,
        tiempo_entrega_dias: r.int(3, 30),
      });
    }
  }
  // Faltantes plantados en Planta Norte (escenario de reabastecimiento).
  const faltantes = {
    'Rodamiento husillo CNC 7014 (par)': 0,
    'Sello mecánico 35 mm SiC/SiC': 2,
    'Filtro de refrigerante CNC 25 µm': 3,
    'Inserto de torneado CNMG 120408': 18,
    'Correa dentada HTD 8M-1200': 1,
    'Aceite para guías ISO VG 68 (20 L)': 2,
  };
  for (const f of filas) {
    if (f.sede === 'Planta Norte' && f.descripcion in faltantes) {
      f.stock_minimo = Math.max(f.stock_minimo, faltantes[f.descripcion] + 4, f.descripcion.includes('Inserto') ? 60 : 0);
      f.stock = faltantes[f.descripcion];
    }
  }
  return filas;
}

// ---------------------------------------------------------------------------
// Órdenes de mantenimiento
// ---------------------------------------------------------------------------
const EQUIPOS = {
  L1: ['Horno de inducción H-101', 'Moldeadora automática M-102', 'Granalladora G-103'],
  L2: ['Torno CNC T-201', 'Torno CNC T-202', 'Centro de mecanizado CM-203', 'Centro de mecanizado CM-204'],
  L3: ['Rectificadora R-301', 'Balanceadora dinámica B-302'],
  L4: ['Línea de ensamble E-401', 'Atornilladora automática A-402'],
  L5: ['Banco de pruebas BP-501', 'Banco de pruebas BP-502', 'Cabina de pintura CP-503'],
};
export const SLA_HORAS = { Crítica: 24, Alta: 48, Media: 120, Baja: 240 };

function generarOrdenes(personal) {
  const tecnicos = {
    PN: personal.filter((p) => p.puesto === 'Técnico de mantenimiento' && p.sede === 'Planta Norte').map((p) => p.nombre),
    PS: personal.filter((p) => p.puesto === 'Técnico de mantenimiento' && p.sede === 'Planta Sur').map((p) => p.nombre),
  };
  const filas = [];
  let n = 1;
  const agregar = (o) => filas.push({ orden: `OT-26${String(n++).padStart(4, '0')}`, ...o });
  for (let i = 0; i < 150; i++) {
    const linea = r.pick(['L1', 'L2', 'L2', 'L3', 'L4', 'L5']);
    const sede = ['L1', 'L2', 'L3'].includes(linea) ? 'PN' : 'PS';
    const tipo = r.pick(['Preventivo', 'Preventivo', 'Preventivo', 'Correctivo', 'Correctivo', 'Predictivo']);
    const prioridad = tipo === 'Preventivo' ? r.pick(['Media', 'Baja']) : r.pick(['Crítica', 'Alta', 'Alta', 'Media']);
    const creada = sumarDias('2026-01-05', r.int(0, 267));
    const externo = tipo === 'Correctivo' && r.chance(0.45);
    const horas = Math.round(SLA_HORAS[prioridad] * (0.2 + r.next() * (r.chance(0.12) ? 1.6 : 0.75)));
    const cerrada = sumarDias(creada, Math.ceil(horas / 24));
    const abierta = cerrada > CORTE || (creada > '2026-09-15' && r.chance(0.5));
    agregar({
      fecha_creacion: creada,
      sede: sedeNombre[sede],
      linea: `Línea ${linea.slice(1)}`,
      equipo: r.pick(EQUIPOS[linea]),
      tipo,
      prioridad,
      ejecutor: externo ? 'Servicios Técnicos Arvelo S.A.' : r.pick(tecnicos[sede]),
      estado: abierta ? r.pick(['Abierta', 'En proceso', 'En espera de refacción']) : 'Cerrada',
      fecha_cierre: abierta ? null : cerrada,
      horas_resolucion: abierta ? null : horas,
      sla_horas: SLA_HORAS[prioridad],
      cumple_sla: abierta ? null : horas <= SLA_HORAS[prioridad] ? 'Sí' : 'No',
    });
  }
  // Septiembre: tres fallas críticas de Arvelo fuera de SLA (escenario de penalización).
  for (const [creada, equipo, horas] of [
    ['2026-09-03', 'Centro de mecanizado CM-203', 31],
    ['2026-09-11', 'Torno CNC T-202', 40],
    ['2026-09-22', 'Horno de inducción H-101', 29],
  ]) {
    agregar({
      fecha_creacion: creada,
      sede: 'Planta Norte',
      linea: equipo.startsWith('Horno') ? 'Línea 1' : 'Línea 2',
      equipo,
      tipo: 'Correctivo',
      prioridad: 'Crítica',
      ejecutor: 'Servicios Técnicos Arvelo S.A.',
      estado: 'Cerrada',
      fecha_cierre: sumarDias(creada, 2),
      horas_resolucion: horas,
      sla_horas: 24,
      cumple_sla: 'No',
    });
  }
  // Pendientes de la Línea 2 que aparecen en la bitácora de turno del 22/09.
  for (const [creada, equipo, tipo, prioridad, estado] of [
    ['2026-09-15', 'Centro de mecanizado CM-203', 'Correctivo', 'Alta', 'En espera de refacción'],
    ['2026-09-22', 'Torno CNC T-202', 'Predictivo', 'Media', 'Abierta'],
  ]) {
    agregar({
      fecha_creacion: creada,
      sede: 'Planta Norte',
      linea: 'Línea 2',
      equipo,
      tipo,
      prioridad,
      ejecutor: tecnicos.PN[0],
      estado,
      fecha_cierre: null,
      horas_resolucion: null,
      sla_horas: SLA_HORAS[prioridad],
      cumple_sla: null,
    });
  }
  return filas.sort((a, b) => a.fecha_creacion.localeCompare(b.fecha_creacion) || a.orden.localeCompare(b.orden));
}

// ---------------------------------------------------------------------------
// Incidentes de seguridad
// ---------------------------------------------------------------------------
const INCIDENTES = [
  ['Casi accidente', 'Caída de pieza desde montacargas sin lesionados', 'Almacén', 'Carga mal asegurada'],
  ['Casi accidente', 'Operador sin protección auditiva en zona > 85 dB', 'Línea 1', 'Incumplimiento de EPP'],
  ['Accidente sin baja', 'Corte superficial en mano al retirar viruta', 'Línea 2', 'Incumplimiento de EPP'],
  ['Accidente sin baja', 'Golpe en rodilla con carro de herramientas', 'Línea 4', 'Orden y limpieza'],
  ['Accidente con baja', 'Quemadura en antebrazo durante vaciado de colada', 'Línea 1', 'Procedimiento no seguido'],
  ['Accidente con baja', 'Esguince de tobillo por piso con aceite', 'Línea 2', 'Orden y limpieza'],
  ['Condición insegura', 'Guarda de protección retirada en torno', 'Línea 2', 'Falta de supervisión'],
  ['Condición insegura', 'Extintor con presión baja', 'Línea 5', 'Mantenimiento de equipos de emergencia'],
  ['Condición insegura', 'Cable eléctrico expuesto en banco de pruebas', 'Línea 5', 'Mantenimiento deficiente'],
  ['Incidente ambiental', 'Derrame menor de refrigerante (menos de 20 L)', 'Línea 2', 'Falla de manguera'],
  ['Casi accidente', 'Energía residual al intervenir equipo sin bloqueo completo', 'Línea 3', 'Bloqueo y etiquetado incompleto'],
];

function generarIncidentes() {
  const filas = [];
  for (let i = 0; i < 44; i++) {
    const [tipo, descripcion, lugar, causa] = r.pick(INCIDENTES);
    const sede = ['Línea 1', 'Línea 2', 'Línea 3'].includes(lugar) || (lugar === 'Almacén' && r.chance(0.5)) ? 'Planta Norte' : 'Planta Sur';
    const f = sumarDias('2026-01-03', r.int(0, 268));
    filas.push({
      folio: `INC-26${String(i + 1).padStart(3, '0')}`,
      fecha: f,
      sede,
      lugar,
      tipo,
      descripcion,
      dias_perdidos: tipo === 'Accidente con baja' ? r.int(2, 15) : 0,
      causa_raiz: causa,
      accion_correctiva: f < '2026-09-01' ? 'Cerrada' : r.pick(['Abierta', 'En seguimiento', 'Cerrada']),
    });
  }
  return filas.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((f, i) => ({ ...f, folio: `INC-26${String(i + 1).padStart(3, '0')}` }));
}

// ---------------------------------------------------------------------------
// Plan de producción Q3
// ---------------------------------------------------------------------------
function generarProduccion() {
  const filas = [];
  const bombas = productos.filter((p) => p.familia === 'Bombas');
  const valvulas = productos.filter((p) => p.familia === 'Válvulas');
  for (const mes of [7, 8, 9]) {
    for (const p of [...bombas, ...valvulas]) {
      const plan = p.familia === 'Bombas' ? Math.round(900 / (p.potenciaHp ** 0.8)) * 5 : r.int(40, 70) * 10;
      const real = mes === 9 ? Math.round(plan * (0.72 + r.next() * 0.1)) : Math.round(plan * (0.9 + r.next() * 0.14));
      filas.push({
        mes: MESES[mes - 1],
        sku: p.sku,
        producto: p.nombre,
        linea_ensamble: p.familia === 'Bombas' ? 'Línea 4' : 'Línea 5',
        unidades_plan: plan,
        unidades_real: real,
        cumplimiento_pct: round(real / plan, 4),
        comentario: mes === 9 ? 'Mes en curso: datos al corte del 30 de septiembre' : '',
      });
    }
  }
  return filas;
}

// ---------------------------------------------------------------------------
// Pipeline comercial
// ---------------------------------------------------------------------------
export const ETAPAS = [
  { etapa: 'Prospección', probabilidad: 0.1 },
  { etapa: 'Calificación', probabilidad: 0.25 },
  { etapa: 'Propuesta', probabilidad: 0.5 },
  { etapa: 'Negociación', probabilidad: 0.75 },
  { etapa: 'Ganada', probabilidad: 1 },
  { etapa: 'Perdida', probabilidad: 0 },
];
const PROSPECTOS = ['Ingenio Azucarero El Trapiche', 'Acuícola Bahía Serena', 'Refinadora Puerto Nuevo', 'Constructora Pilar & Viga', 'Lácteos Pradera Verde', 'Parque Industrial Las Lomas'];

function generarPipeline(personal) {
  const ejecutivos = personal.filter((p) => p.puesto === 'Ejecutivo de ventas').map((p) => p.nombre);
  const nombres = [...clientes.map((c) => c.nombre), ...PROSPECTOS];
  const filas = [];
  for (let i = 0; i < 48; i++) {
    const cliente = r.pick(nombres);
    const producto = r.pick(productos.filter((p) => p.familia !== 'Refacciones'));
    const unidades = producto.familia === 'Bombas' ? r.int(2, 60) : r.int(40, 400);
    const { etapa, probabilidad } = r.pick([...ETAPAS, ETAPAS[0], ETAPAS[1], ETAPAS[2], ETAPAS[3]]);
    const cerrada = etapa === 'Ganada' || etapa === 'Perdida';
    filas.push({
      oportunidad: `OP-26${String(i + 1).padStart(3, '0')}`,
      cliente,
      es_prospecto: PROSPECTOS.includes(cliente) ? 'Sí' : 'No',
      producto_principal: producto.sku,
      unidades,
      valor_estimado: round(unidades * producto.precio * (1 - descuentoVolumen(unidades) / 100)),
      etapa,
      probabilidad,
      fecha_cierre_estimada: cerrada ? sumarDias('2026-06-01', r.int(0, 110)) : sumarDias(CORTE, r.int(10, 150)),
      ejecutivo: r.pick(ejecutivos),
    });
  }
  return filas;
}

// ---------------------------------------------------------------------------
// Ensamblado de archivos
// ---------------------------------------------------------------------------
const col = (clave, titulo, formato, ancho) => ({ clave, titulo, formato, ancho });

export function generarDatos() {
  const personal = generarPersonal();
  const ventas = generarVentas(personal);
  const presupuesto = generarPresupuesto();
  const resultados = generarResultados(ventas, presupuesto);
  const cxp = generarCuentasPorPagar();
  const gastos = generarGastosViaje(personal);
  const contratos = generarContratos();
  const inventario = generarInventario();
  const ordenes = generarOrdenes(personal);
  const incidentes = generarIncidentes();
  const produccion = generarProduccion();
  const pipeline = generarPipeline(personal);

  const P = personas;
  const archivos = [
    {
      id: 'fin-estado-resultados-2026',
      area: 'finanzas',
      archivo: 'Estado de resultados 2026 (enero-agosto)',
      formato: 'xlsx',
      titulo: 'Estado de resultados 2026 (enero-agosto)',
      responsable: P.finanzas.nombre,
      fecha: '2026-09-10',
      descripcion: 'Estado de resultados mensual con ingresos reales frente a presupuesto. Septiembre aún no tiene cierre contable.',
      hojas: [{
        nombre: 'Estado de resultados',
        columnas: [
          col('mes_nombre', 'Mes', null, 12), col('ingresos_presupuesto', 'Ingresos presupuesto', 'usd0', 20),
          col('ingresos', 'Ingresos', 'usd', 16), col('costo_materiales', 'Costo de materiales', 'usd', 18),
          col('costo_manufactura', 'Costo de manufactura', 'usd', 20), col('costo_ventas', 'Costo de ventas', 'usd', 16),
          col('utilidad_bruta', 'Utilidad bruta', 'usd', 16), col('margen_bruto_pct', 'Margen bruto %', 'pct', 15),
          col('gastos_operacion', 'Gastos de operación', 'usd', 18), col('utilidad_operacion', 'Utilidad de operación', 'usd', 20),
          col('ebitda', 'EBITDA', 'usd', 14), col('gastos_financieros', 'Gastos financieros', 'usd', 18),
          col('utilidad_antes_impuestos', 'Utilidad antes de impuestos', 'usd', 24), col('impuestos', 'Impuestos', 'usd', 14),
          col('utilidad_neta', 'Utilidad neta', 'usd', 16),
        ],
        filas: resultados,
        totales: ['ingresos_presupuesto', 'ingresos', 'costo_materiales', 'costo_manufactura', 'costo_ventas', 'utilidad_bruta', 'gastos_operacion', 'utilidad_operacion', 'ebitda', 'gastos_financieros', 'utilidad_antes_impuestos', 'impuestos', 'utilidad_neta'],
      }],
    },
    {
      id: 'fin-presupuesto-2026',
      area: 'finanzas',
      archivo: 'Presupuesto de gastos 2026 por centro de costo',
      formato: 'xlsx',
      titulo: 'Presupuesto de gastos 2026 por centro de costo',
      responsable: P.finanzas.nombre,
      fecha: '2026-09-10',
      descripcion: 'Presupuesto mensual y gasto real (enero-agosto) por centro de costo, con variaciones.',
      hojas: [
        {
          nombre: 'Presupuesto vs real',
          columnas: [
            col('centro_costo', 'Centro de costo', null, 14), col('nombre', 'Nombre', null, 28), col('area', 'Área', null, 18),
            col('mes', 'Mes (núm.)', 'int', 10), col('mes_nombre', 'Mes', null, 12), col('presupuesto', 'Presupuesto', 'usd0', 14),
            col('real', 'Real', 'usd0', 14), col('variacion', 'Variación', 'usd0', 14), col('variacion_pct', 'Variación %', 'pct', 12),
          ],
          filas: presupuesto,
        },
        {
          nombre: 'Centros de costo',
          columnas: [col('id', 'Centro de costo', null, 14), col('nombre', 'Nombre', null, 30), col('area', 'Área', null, 18), col('anual', 'Presupuesto anual', 'usd0', 18)],
          filas: centrosCosto.map((c) => ({ ...c, anual: PRESUPUESTO_MENSUAL[c.id] * 12 })),
          totales: ['anual'],
        },
      ],
    },
    {
      id: 'fin-cuentas-por-pagar',
      area: 'finanzas',
      archivo: 'Cuentas por pagar jun-sep 2026',
      formato: 'csv',
      titulo: 'Cuentas por pagar junio-septiembre 2026',
      responsable: P.contabilidad.nombre,
      fecha: CORTE,
      descripcion: `Facturas de proveedores emitidas desde junio. Plazo de pago estándar: ${reglas.plazoPagoProveedoresDias} días.`,
      columnas: [
        col('factura', 'factura'), col('proveedor_id', 'proveedor_id'), col('proveedor', 'proveedor'), col('centro_costo', 'centro_costo'),
        col('fecha_emision', 'fecha_emision'), col('fecha_vencimiento', 'fecha_vencimiento'), col('monto', 'monto_usd'),
        col('estado', 'estado'), col('fecha_pago', 'fecha_pago'),
      ],
      filas: cxp,
    },
    {
      id: 'fin-gastos-viaje-2026',
      area: 'finanzas',
      archivo: 'Gastos de viaje 2026',
      formato: 'csv',
      titulo: 'Gastos de viaje 2026',
      responsable: P.contabilidad.nombre,
      fecha: CORTE,
      descripcion: 'Líneas de gasto reportadas por viaje (una fila por concepto).',
      columnas: [
        col('id_gasto', 'id_gasto'), col('id_viaje', 'id_viaje'), col('empleado_id', 'empleado_id'), col('empleado', 'empleado'),
        col('centro_costo', 'centro_costo'), col('destino', 'destino'), col('tipo_viaje', 'tipo_viaje'), col('fecha_inicio', 'fecha_inicio'),
        col('fecha_regreso', 'fecha_regreso'), col('fecha_reporte', 'fecha_reporte'), col('concepto', 'concepto'), col('cantidad', 'cantidad'),
        col('monto_total', 'monto_total_usd'), col('comprobante', 'comprobante'), col('notas', 'notas'),
      ],
      filas: gastos,
    },
    {
      id: 'fin-padron-proveedores',
      area: 'finanzas',
      archivo: 'Padrón de proveedores aprobados',
      formato: 'csv',
      titulo: 'Padrón de proveedores aprobados',
      responsable: P.compras.nombre,
      fecha: '2026-07-01',
      descripcion: 'Proveedores con alta vigente. Solo se puede comprar a proveedores de este padrón.',
      columnas: [col('id', 'proveedor_id'), col('nombre', 'nombre'), col('rubro', 'rubro'), col('evaluacion', 'evaluacion_2025'), col('contrato', 'contrato_marco')],
      filas: proveedores.map((p, i) => ({
        ...p,
        evaluacion: ['A', 'A', 'B', 'A', 'B', 'B', 'A', 'B', 'A', 'C', 'A', 'B'][i],
        contrato: contratos.find((c) => c.contraparte === p.nombre)?.contrato ?? '',
      })),
    },
    {
      id: 'leg-registro-contratos',
      area: 'legal',
      archivo: 'Registro de contratos',
      formato: 'xlsx',
      titulo: 'Registro de contratos',
      responsable: P.legal.nombre,
      fecha: CORTE,
      descripcion: 'Contratos celebrados por Nexora con fechas, montos, responsables y condiciones de renovación.',
      hojas: [{
        nombre: 'Contratos',
        columnas: [
          col('contrato', 'Contrato', null, 14), col('contraparte', 'Contraparte', null, 32), col('tipo', 'Tipo', null, 34),
          col('fecha_inicio', 'Inicio', null, 12), col('fecha_fin', 'Fin', null, 12), col('monto_anual', 'Monto anual (USD)', 'usd0', 18),
          col('responsable', 'Responsable', null, 18), col('renovacion_automatica', 'Renovación automática', null, 12),
          col('preaviso_dias', 'Preaviso (días)', 'int', 12), col('estado', 'Estado', null, 10),
        ],
        filas: contratos,
      }],
    },
    {
      id: 'rh-plantilla-personal',
      area: 'recursos-humanos',
      archivo: 'Plantilla de personal',
      formato: 'xlsx',
      titulo: 'Plantilla de personal',
      responsable: P.rrhh.nombre,
      fecha: CORTE,
      descripcion: 'Personal activo al 30 de septiembre de 2026, con antigüedad y saldo de vacaciones.',
      hojas: [{
        nombre: 'Personal',
        columnas: [
          col('id', 'ID', null, 9), col('nombre', 'Nombre', null, 30), col('area', 'Área', null, 18), col('puesto', 'Puesto', null, 32),
          col('sede', 'Sede', null, 18), col('turno', 'Turno', null, 18), col('fecha_ingreso', 'Fecha de ingreso', null, 14),
          col('tipo_contrato', 'Tipo de contrato', null, 14), col('antiguedad_anios', 'Antigüedad (años)', 'int', 12),
          col('vacaciones_derecho', 'Días de vacaciones (derecho)', 'int', 14), col('vacaciones_tomadas_2026', 'Días tomados 2026', 'int', 12),
        ],
        filas: personal,
      }],
    },
    {
      id: 'op-inventario-repuestos',
      area: 'operaciones',
      archivo: 'Inventario de repuestos',
      formato: 'xlsx',
      titulo: 'Inventario de repuestos',
      responsable: P.mantenimiento.nombre,
      fecha: CORTE,
      descripcion: 'Existencias de repuestos de mantenimiento por planta, con stock mínimo y proveedor.',
      hojas: [{
        nombre: 'Inventario',
        columnas: [
          col('codigo', 'Código', null, 12), col('sede', 'Sede', null, 14), col('categoria', 'Categoría', null, 16),
          col('descripcion', 'Descripción', null, 40), col('ubicacion', 'Ubicación', null, 14), col('stock', 'Stock', 'int', 8),
          col('stock_minimo', 'Stock mínimo', 'int', 12), col('consumo_mensual', 'Consumo mensual', 'int', 14),
          col('costo_unitario', 'Costo unitario (USD)', 'usd', 16), col('proveedor_id', 'Proveedor ID', null, 12),
          col('proveedor', 'Proveedor', null, 30), col('tiempo_entrega_dias', 'Tiempo de entrega (días)', 'int', 14),
        ],
        filas: inventario,
      }],
    },
    {
      id: 'op-ordenes-mantenimiento',
      area: 'operaciones',
      archivo: 'Órdenes de mantenimiento 2026',
      formato: 'csv',
      titulo: 'Órdenes de mantenimiento 2026',
      responsable: P.mantenimiento.nombre,
      fecha: CORTE,
      descripcion: 'Exportación del sistema de mantenimiento (CMMS) con órdenes preventivas, correctivas y predictivas.',
      columnas: [
        col('orden', 'orden'), col('fecha_creacion', 'fecha_creacion'), col('sede', 'sede'), col('linea', 'linea'), col('equipo', 'equipo'),
        col('tipo', 'tipo'), col('prioridad', 'prioridad'), col('ejecutor', 'ejecutor'), col('estado', 'estado'), col('fecha_cierre', 'fecha_cierre'),
        col('horas_resolucion', 'horas_resolucion'), col('sla_horas', 'sla_horas'), col('cumple_sla', 'cumple_sla'),
      ],
      filas: ordenes,
    },
    {
      id: 'op-incidentes-seguridad',
      area: 'operaciones',
      archivo: 'Registro de incidentes de seguridad 2026',
      formato: 'csv',
      titulo: 'Registro de incidentes de seguridad 2026',
      responsable: P.seguridad.nombre,
      fecha: CORTE,
      descripcion: 'Incidentes, casi accidentes y condiciones inseguras reportados con el formato F-701.',
      columnas: [
        col('folio', 'folio'), col('fecha', 'fecha'), col('sede', 'sede'), col('lugar', 'lugar'), col('tipo', 'tipo'), col('descripcion', 'descripcion'),
        col('dias_perdidos', 'dias_perdidos'), col('causa_raiz', 'causa_raiz'), col('accion_correctiva', 'accion_correctiva'),
      ],
      filas: incidentes,
    },
    {
      id: 'op-plan-produccion-q3',
      area: 'operaciones',
      archivo: 'Plan de producción Q3 2026',
      formato: 'xlsx',
      titulo: 'Plan de producción Q3 2026',
      responsable: P.operaciones.nombre,
      fecha: CORTE,
      descripcion: 'Unidades planeadas y producidas por producto en el tercer trimestre.',
      hojas: [{
        nombre: 'Plan Q3',
        columnas: [
          col('mes', 'Mes', null, 12), col('sku', 'SKU', null, 10), col('producto', 'Producto', null, 34), col('linea_ensamble', 'Línea', null, 10),
          col('unidades_plan', 'Unidades plan', 'int', 14), col('unidades_real', 'Unidades reales', 'int', 14),
          col('cumplimiento_pct', 'Cumplimiento %', 'pct', 14), col('comentario', 'Comentario', null, 44),
        ],
        filas: produccion,
      }],
    },
    {
      id: 'com-lista-precios-2026',
      area: 'comercial',
      archivo: 'Lista de precios 2026',
      formato: 'xlsx',
      titulo: 'Lista de precios 2026',
      responsable: P.comercial.nombre,
      fecha: '2026-01-05',
      descripcion: 'Precios de lista en USD (sin impuestos) y tabla de descuentos por volumen.',
      hojas: [
        {
          nombre: 'Precios',
          columnas: [
            col('sku', 'SKU', null, 10), col('nombre', 'Producto', null, 36), col('familia', 'Familia', null, 14),
            col('potenciaHp', 'Potencia (HP)', 'int', 12), col('caudal', 'Caudal nominal (m³/h)', 'int', 18), col('precio', 'Precio de lista (USD)', 'usd', 18),
          ],
          filas: productos,
        },
        {
          nombre: 'Descuentos por volumen',
          columnas: [col('rango', 'Unidades por pedido', null, 22), col('pct', 'Descuento', null, 12)],
          filas: [
            { rango: '1 a 9', pct: '0%' },
            { rango: '10 a 24', pct: '5%' },
            { rango: '25 a 49', pct: '8%' },
            { rango: '50 o más', pct: '12%' },
            { rango: 'Distribuidor autorizado (adicional)', pct: `${reglas.descuentoDistribuidor}%` },
          ],
        },
      ],
    },
    {
      id: 'com-ventas-2026',
      area: 'comercial',
      archivo: 'Ventas 2026 por pedido',
      formato: 'xlsx',
      titulo: 'Ventas 2026 por pedido',
      responsable: P.comercial.nombre,
      fecha: CORTE,
      descripcion: 'Pedidos facturados de enero a septiembre de 2026. Importes netos de descuento, sin impuestos.',
      hojas: [
        {
          nombre: 'Pedidos',
          columnas: [
            col('pedido', 'Pedido', null, 12), col('fecha', 'Fecha', null, 12), col('cliente_id', 'Cliente ID', null, 10),
            col('cliente', 'Cliente', null, 30), col('tipo_cliente', 'Tipo de cliente', null, 22), col('sku', 'SKU', null, 10),
            col('producto', 'Producto', null, 34), col('unidades', 'Unidades', 'int', 10), col('precio_lista', 'Precio de lista', 'usd', 14),
            col('descuento_pct', 'Descuento %', 'int', 12), col('importe', 'Importe (USD)', 'usd', 16), col('ejecutivo', 'Ejecutivo', null, 28),
          ],
          filas: ventas,
          totales: ['unidades', 'importe'],
        },
        {
          nombre: 'Clientes',
          columnas: [col('id', 'Cliente ID', null, 10), col('nombre', 'Cliente', null, 32), col('segmento', 'Segmento', null, 22), col('tipo', 'Tipo', null, 24)],
          filas: clientes,
        },
      ],
    },
    {
      id: 'com-pipeline-oportunidades',
      area: 'comercial',
      archivo: 'Pipeline de oportunidades',
      formato: 'csv',
      titulo: 'Pipeline de oportunidades',
      responsable: P.comercial.nombre,
      fecha: CORTE,
      descripcion: 'Oportunidades comerciales abiertas y cerradas con etapa y probabilidad de cierre.',
      columnas: [
        col('oportunidad', 'oportunidad'), col('cliente', 'cliente'), col('es_prospecto', 'es_prospecto'), col('producto_principal', 'producto_principal'),
        col('unidades', 'unidades'), col('valor_estimado', 'valor_estimado_usd'), col('etapa', 'etapa'), col('probabilidad', 'probabilidad'),
        col('fecha_cierre_estimada', 'fecha_cierre_estimada'), col('ejecutivo', 'ejecutivo'),
      ],
      filas: pipeline,
    },
  ];

  return {
    archivos,
    tablas: { personal, ventas, presupuesto, resultados, cxp, gastos, contratos, inventario, ordenes, incidentes, produccion, pipeline },
  };
}
