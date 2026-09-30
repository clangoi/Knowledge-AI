// Escenarios de varios pasos para evaluar agentes. Cada respuesta esperada se
// calcula a partir de los datos generados, así que siempre es correcta.
import { auditarGastos, ETAPAS } from './datos.mjs';
import { resumenTrimestre } from './documentos-dinamicos.mjs';
import { descuentoVolumen, empresa, productos, reglaPorMonto, reglas } from './empresa.mjs';
import { diasEntre, round, sumarDias } from './lib/util.mjs';

const CORTE = empresa.fechaCorte;
const n2 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const contar = (filas, k) => filas.reduce((a, f) => ((a[f[k]] = (a[f[k]] ?? 0) + 1), a), {});

export function generarEscenarios(t) {
  const esc = [];
  const agregar = (e) => esc.push({ id: `ag-${String(esc.length + 1).padStart(2, '0')}`, ...e });

  // 1. Auditoría de viáticos del tercer trimestre
  const gastosQ3 = t.gastos.filter((g) => g.fecha_inicio >= '2026-07-01');
  const hallazgos = auditarGastos(gastosQ3);
  agregar({
    titulo: 'Auditoría de gastos de viaje del tercer trimestre',
    nivel: 'intermedio',
    tarea: 'Revisa todos los gastos de viaje con fecha de inicio entre el 1 de julio y el 30 de septiembre de 2026 y detecta los que incumplen la Política de viáticos. Para cada hallazgo indica el viaje, la línea de gasto, la regla incumplida y el detalle.',
    documentos: ['fin-gastos-viaje-2026', 'fin-politica-viaticos'],
    herramientas_sugeridas: ['buscar_documentos', 'leer_tabla', 'calcular'],
    pasos_esperados: [
      'Extraer de la política los topes de hospedaje y alimentación, el límite sin comprobante, la tarifa por kilómetro, el plazo de reporte y los gastos no reembolsables.',
      'Filtrar las líneas de gasto del tercer trimestre.',
      'Comparar cada línea y cada viaje contra las reglas (el plazo de reporte se mide en días hábiles).',
      'Reportar los hallazgos.',
    ],
    respuesta_esperada: { total_hallazgos: hallazgos.length, hallazgos },
    criterios_evaluacion: ['Encuentra todos los hallazgos sin falsos positivos.', 'Cita la regla de la política para cada uno.', 'Calcula el plazo de reporte en días hábiles, no naturales.'],
  });

  // 2. Repuestos bajo mínimo en Planta Norte
  const faltantes = t.inventario
    .filter((i) => i.sede === 'Planta Norte' && i.stock < i.stock_minimo)
    .map((i) => {
      const cantidad = i.stock_minimo * 2 - i.stock;
      return { codigo: i.codigo, descripcion: i.descripcion, stock: i.stock, stock_minimo: i.stock_minimo, cantidad_a_pedir: cantidad, importe: round(cantidad * i.costo_unitario), proveedor: i.proveedor };
    });
  const porProveedor = Object.values(
    faltantes.reduce((a, f) => {
      a[f.proveedor] ??= { proveedor: f.proveedor, importe: 0, partidas: 0 };
      a[f.proveedor].importe = round(a[f.proveedor].importe + f.importe);
      a[f.proveedor].partidas++;
      return a;
    }, {}),
  ).map((p) => ({ ...p, cotizaciones: reglaPorMonto(reglas.compras, p.importe).descripcion, aprueba: reglaPorMonto(reglas.aprobaciones, p.importe).aprueba }));
  agregar({
    titulo: 'Reabastecimiento de repuestos en Planta Norte',
    nivel: 'intermedio',
    tarea: 'Identifica los repuestos de Planta Norte con existencias por debajo del stock mínimo. Propón una cantidad a pedir que lleve cada uno al doble de su stock mínimo, agrupa por proveedor e indica, para cada orden de compra, el requisito de cotizaciones y quién la aprueba.',
    documentos: ['op-inventario-repuestos', 'fin-politica-compras', 'leg-politica-firmas', 'op-mantenimiento-l2'],
    herramientas_sugeridas: ['leer_tabla', 'buscar_documentos', 'calcular'],
    pasos_esperados: [
      'Filtrar el inventario de Planta Norte con stock < stock mínimo.',
      'Calcular la cantidad a pedir (2 × stock mínimo − stock) y su importe.',
      'Agrupar por proveedor y sumar importes.',
      'Aplicar la tabla de cotizaciones de la política de compras y la tabla de aprobaciones de la política de firmas.',
    ],
    respuesta_esperada: { partidas: faltantes, ordenes_por_proveedor: porProveedor },
    criterios_evaluacion: ['Incluye todas las partidas bajo mínimo de Planta Norte y ninguna de Planta Sur.', 'Los importes y requisitos coinciden con las políticas.', 'Menciona que las refacciones críticas de la Línea 2 están afectadas.'],
  });

  // 3. Contratos por vencer
  const limite = sumarDias(CORTE, 90);
  const porVencer = t.contratos
    .filter((c) => c.fecha_fin >= CORTE && c.fecha_fin <= limite)
    .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin))
    .map((c) => {
      const fechaAviso = sumarDias(c.fecha_fin, -c.preaviso_dias);
      return {
        contrato: c.contrato,
        contraparte: c.contraparte,
        tipo: c.tipo,
        fecha_fin: c.fecha_fin,
        dias_para_vencer: diasEntre(CORTE, c.fecha_fin),
        renovacion_automatica: c.renovacion_automatica,
        fecha_limite_aviso: c.preaviso_dias ? fechaAviso : null,
        aviso_vencido: c.preaviso_dias > 0 && fechaAviso < CORTE,
        responsable: c.responsable,
      };
    });
  agregar({
    titulo: 'Contratos que vencen en los próximos 90 días',
    nivel: 'básico',
    tarea: `Con fecha de hoy ${CORTE}, lista los contratos que vencen en los próximos 90 días. Para cada uno indica los días que faltan, si se renueva automáticamente, la fecha límite para dar el aviso de no renovación (fecha de fin menos días de preaviso), si esa fecha ya pasó y quién es el responsable.`,
    documentos: ['leg-registro-contratos'],
    herramientas_sugeridas: ['leer_tabla', 'calcular_fechas'],
    pasos_esperados: ['Filtrar contratos con fecha de fin entre hoy y hoy + 90 días.', 'Calcular días restantes y fecha límite de aviso.', 'Marcar los avisos vencidos.'],
    respuesta_esperada: { total: porVencer.length, contratos: porVencer },
    criterios_evaluacion: ['No incluye contratos ya vencidos.', 'Las fechas límite de aviso son correctas.', 'Señala los contratos cuya fecha de aviso ya pasó.'],
  });

  // 4. Cotización para distribuidor con descuento especial
  const nx250 = productos.find((p) => p.sku === 'NX-250');
  const unidades = 60;
  const dVol = descuentoVolumen(unidades);
  const dTotal = dVol + reglas.descuentoDistribuidor + 5;
  const bruto = unidades * nx250.precio;
  agregar({
    titulo: 'Cotización con descuento especial para distribuidor',
    nivel: 'intermedio',
    tarea: 'Hidrotec Distribuciones (distribuidor autorizado) pide cotización de 60 bombas NX-250 y solicita un 5% de descuento adicional. Calcula el descuento total, el importe neto y quién debe aprobar la cotización antes de enviarla.',
    documentos: ['com-lista-precios-2026', 'com-politica-comercial'],
    herramientas_sugeridas: ['leer_tabla', 'buscar_documentos', 'calcular'],
    pasos_esperados: ['Obtener el precio de lista de la NX-250.', 'Aplicar descuento por volumen, descuento base de distribuidor y descuento negociado.', 'Determinar el aprobador según el descuento total.', 'Revisar si la cotización supera 100,000 USD (requiere revisión de la Gerente Comercial).'],
    respuesta_esperada: {
      precio_lista: nx250.precio,
      importe_bruto: bruto,
      descuento_volumen_pct: dVol,
      descuento_distribuidor_pct: reglas.descuentoDistribuidor,
      descuento_negociado_pct: 5,
      descuento_total_pct: dTotal,
      importe_neto: round(bruto * (1 - dTotal / 100)),
      aprueba: reglaPorMonto(reglas.aprobacionDescuento, dTotal).aprueba,
      requiere_revision_gerente_comercial_por_monto: bruto * (1 - dTotal / 100) > 100000,
    },
    criterios_evaluacion: ['Suma los descuentos (no los compone).', 'Identifica al Director General como aprobador.', 'Menciona la vigencia de 30 días de la cotización.'],
  });

  // 5. Saldo de vacaciones de un empleado
  const empleado = t.personal.find((p) => p.puesto === 'Operador CNC' && p.antiguedad_anios >= 6 && p.antiguedad_anios <= 10);
  agregar({
    titulo: 'Saldo de vacaciones de un colaborador',
    nivel: 'básico',
    tarea: `El colaborador ${empleado.id} pregunta cuántos días de vacaciones le corresponden en su periodo actual y cuántos le quedan, y si podrá descansar del 24 de diciembre al 1 de enero sin que se le descuenten días.`,
    documentos: ['rh-plantilla-personal', 'rh-politica-vacaciones', 'rh-comunicado-cierre-anual'],
    herramientas_sugeridas: ['leer_tabla', 'buscar_documentos'],
    pasos_esperados: ['Buscar al colaborador en la plantilla y leer su antigüedad y días tomados.', 'Aplicar la tabla de días por antigüedad.', 'Revisar la regla del paro de fin de año para personal de planta.'],
    respuesta_esperada: {
      empleado: empleado.id,
      nombre: empleado.nombre,
      puesto: empleado.puesto,
      sede: empleado.sede,
      antiguedad_anios: empleado.antiguedad_anios,
      dias_derecho: empleado.vacaciones_derecho,
      dias_tomados_2026: empleado.vacaciones_tomadas_2026,
      saldo: empleado.vacaciones_derecho - empleado.vacaciones_tomadas_2026,
      paro_fin_de_anio: 'Es personal de planta: los días hábiles del paro (24 de diciembre al 1 de enero) se descuentan de su saldo, salvo que sea asignado a guardias de mantenimiento, lo cual no aplica a su puesto.',
    },
    criterios_evaluacion: ['Usa la antigüedad de la plantilla, no una suposición.', 'Explica el descuento por el paro de fin de año.'],
  });

  // 6. Compra bloqueada por calificación del proveedor
  const monto = 38000;
  agregar({
    titulo: 'Validación de una solicitud de compra',
    nivel: 'avanzado',
    tarea: 'Tecnología de la Información quiere comprar licencias por 38,000 USD a Soluciones TI Cumbre. Verifica si la compra cumple la política: cotizaciones necesarias, nivel de aprobación y situación del proveedor en el padrón.',
    documentos: ['fin-padron-proveedores', 'fin-politica-compras', 'leg-politica-firmas'],
    herramientas_sugeridas: ['leer_tabla', 'buscar_documentos'],
    pasos_esperados: ['Determinar cotizaciones y aprobadores por monto.', 'Consultar la calificación del proveedor en el padrón.', 'Aplicar la restricción para proveedores con calificación C.'],
    respuesta_esperada: {
      cotizaciones: reglaPorMonto(reglas.compras, monto).descripcion,
      aprueba: reglaPorMonto(reglas.aprobaciones, monto).aprueba,
      calificacion_proveedor: 'C',
      procede: false,
      motivo: 'Un proveedor con calificación C no puede recibir nuevas órdenes superiores a 10,000 USD hasta mejorar su calificación. Se debe cotizar con otros proveedores del padrón o esperar el plan de mejora.',
    },
    criterios_evaluacion: ['Detecta la restricción por calificación C.', 'Aun así indica cotizaciones y aprobadores correctos.', 'No propone dividir la compra.'],
  });

  // 7. Variaciones presupuestales del segundo trimestre
  const q2 = resumenTrimestre(t, 2);
  const variaciones = q2.centros
    .filter((c) => Math.abs(c.pct) > 0.1)
    .map((c) => ({ centro_costo: c.id, nombre: c.nombre, presupuesto: c.presupuesto, real: c.real, variacion: c.variacion, variacion_pct: round(c.pct * 100, 1) }));
  agregar({
    titulo: 'Variaciones presupuestales del segundo trimestre',
    nivel: 'intermedio',
    tarea: 'Identifica los centros de costo cuyo gasto real del segundo trimestre de 2026 se desvió más de ±10% del presupuesto y explica la causa de cada desviación con base en los documentos.',
    documentos: ['fin-presupuesto-2026', 'fin-procedimiento-cierre', 'fin-informe-q2-2026', 'leg-acta-comite-julio-2026'],
    herramientas_sugeridas: ['leer_tabla', 'buscar_documentos', 'calcular'],
    pasos_esperados: ['Sumar presupuesto y real de abril a junio por centro de costo.', 'Calcular la variación porcentual.', 'Buscar la explicación en el informe trimestral y el acta.'],
    respuesta_esperada: { umbral_pct: 10, centros: variaciones },
    criterios_evaluacion: ['Calcula sobre el trimestre, no sobre un mes.', 'Atribuye la desviación de Mantenimiento al overhaul de la Línea 2.'],
  });

  // 8. Incidentes de seguridad del tercer trimestre
  const incQ3 = t.incidentes.filter((i) => i.fecha >= '2026-07-01');
  agregar({
    titulo: 'Resumen de seguridad del tercer trimestre',
    nivel: 'básico',
    tarea: 'Prepara un resumen de los incidentes de seguridad del tercer trimestre de 2026: total, desglose por tipo y por sede, días perdidos y acciones correctivas que siguen abiertas o en seguimiento.',
    documentos: ['op-incidentes-seguridad', 'op-manual-seguridad'],
    herramientas_sugeridas: ['leer_tabla', 'calcular'],
    pasos_esperados: ['Filtrar incidentes de julio a septiembre.', 'Agrupar por tipo y sede.', 'Sumar días perdidos.', 'Listar acciones no cerradas.'],
    respuesta_esperada: {
      total: incQ3.length,
      por_tipo: contar(incQ3, 'tipo'),
      por_sede: contar(incQ3, 'sede'),
      dias_perdidos: incQ3.reduce((s, i) => s + i.dias_perdidos, 0),
      acciones_pendientes: incQ3.filter((i) => i.accion_correctiva !== 'Cerrada').map((i) => i.folio),
    },
    criterios_evaluacion: ['Los conteos coinciden.', 'Usa la clasificación de incidentes del manual.'],
  });

  // 9. Órdenes abiertas de la Línea 2
  const abiertasL2 = t.ordenes
    .filter((o) => o.linea === 'Línea 2' && o.estado !== 'Cerrada')
    .map((o) => ({ orden: o.orden, fecha_creacion: o.fecha_creacion, equipo: o.equipo, tipo: o.tipo, prioridad: o.prioridad, estado: o.estado, dias_abierta: diasEntre(o.fecha_creacion, CORTE) }));
  agregar({
    titulo: 'Órdenes de mantenimiento pendientes en la Línea 2',
    nivel: 'básico',
    tarea: 'Lista las órdenes de mantenimiento de la Línea 2 que no están cerradas, con los días que llevan abiertas, y relaciónalas con los pendientes de la bitácora de turno del 22 de septiembre.',
    documentos: ['op-ordenes-mantenimiento', 'op-bitacora-turno-l2', 'op-mantenimiento-l2'],
    herramientas_sugeridas: ['leer_tabla', 'buscar_documentos'],
    pasos_esperados: ['Filtrar órdenes de la Línea 2 con estado distinto de Cerrada.', 'Calcular días abiertos al corte.', 'Leer los pendientes de la bitácora.'],
    respuesta_esperada: {
      ordenes: abiertasL2,
      pendientes_bitacora: ['Compra urgente de filtros de refrigerante de 25 µm e insertos CNMG 120408.', 'Cambio de rodamientos de T-202 (vibración de 5.2 mm/s).', 'Entrega de rodamientos 7014 para CM-203 (prevista para el 06/10).'],
    },
    criterios_evaluacion: ['Incluye todas las órdenes no cerradas de la Línea 2.', 'Integra información de la bitácora.'],
  });

  // 10. Principales clientes del primer semestre
  const h1 = new Map();
  for (const v of t.ventas.filter((v) => v.fecha < '2026-07-01')) h1.set(v.cliente, (h1.get(v.cliente) ?? 0) + v.importe);
  const top = [...h1.entries()].map(([cliente, importe]) => ({ cliente, importe: round(importe) })).sort((a, b) => b.importe - a.importe);
  const totalH1 = round(top.reduce((s, c) => s + c.importe, 0));
  agregar({
    titulo: 'Principales clientes del primer semestre',
    nivel: 'básico',
    tarea: 'Obtén los cinco clientes con mayores ventas de enero a junio de 2026 y el porcentaje que representan del total del semestre.',
    documentos: ['com-ventas-2026'],
    herramientas_sugeridas: ['leer_tabla', 'calcular'],
    pasos_esperados: ['Filtrar pedidos de enero a junio.', 'Agrupar por cliente y ordenar.', 'Calcular participación.'],
    respuesta_esperada: {
      total_semestre: totalH1,
      top5: top.slice(0, 5).map((c) => ({ ...c, participacion_pct: round((c.importe / totalH1) * 100, 1) })),
    },
    criterios_evaluacion: ['Usa importes netos.', 'Excluye pedidos de julio en adelante.'],
  });

  // 11. Pipeline ponderado
  const abiertas = t.pipeline.filter((o) => o.etapa !== 'Ganada' && o.etapa !== 'Perdida');
  const porEtapa = ETAPAS.filter((e) => e.probabilidad > 0 && e.probabilidad < 1).map((e) => {
    const filas = abiertas.filter((o) => o.etapa === e.etapa);
    const valor = round(filas.reduce((s, o) => s + o.valor_estimado, 0));
    return { etapa: e.etapa, oportunidades: filas.length, valor_total: valor, probabilidad: e.probabilidad, valor_ponderado: round(valor * e.probabilidad) };
  });
  agregar({
    titulo: 'Valor ponderado del pipeline comercial',
    nivel: 'básico',
    tarea: 'Calcula el valor ponderado (valor estimado × probabilidad) de las oportunidades abiertas del pipeline, por etapa y en total. Excluye las oportunidades ganadas y perdidas.',
    documentos: ['com-pipeline-oportunidades'],
    herramientas_sugeridas: ['leer_tabla', 'calcular'],
    pasos_esperados: ['Filtrar oportunidades abiertas.', 'Multiplicar valor por probabilidad.', 'Agrupar por etapa.'],
    respuesta_esperada: { por_etapa: porEtapa, total_ponderado: round(porEtapa.reduce((s, e) => s + e.valor_ponderado, 0)) },
    criterios_evaluacion: ['Excluye Ganada y Perdida.', 'Totales correctos.'],
  });

  // 12. Reclamo de garantía
  agregar({
    titulo: 'Dictamen preliminar de un reclamo de garantía',
    nivel: 'avanzado',
    tarea: 'Analiza el correo de Minera Cerro Alto sobre la bomba NX-250 serie NX250-24-0187 y emite un dictamen preliminar: si está dentro del plazo de garantía, qué partes de la falla podrían no estar cubiertas y cuáles son los siguientes pasos y plazos para Servicio Postventa.',
    documentos: ['com-correo-reclamo-minera', 'com-garantias', 'op-ficha-nx250', 'com-notas-reunion'],
    herramientas_sugeridas: ['buscar_documentos', 'calcular_fechas'],
    pasos_esperados: [
      'Extraer fechas de entrega e instalación del correo.',
      'Calcular el vencimiento por entrega (18 meses) y por instalación (12 meses) y tomar el que ocurra primero.',
      'Comparar las condiciones de operación con la ficha técnica.',
      'Revisar las exclusiones de la garantía.',
    ],
    respuesta_esperada: {
      vence_por_entrega: '2027-01-15',
      vence_por_instalacion: '2026-10-28',
      vencimiento_aplicable: '2026-10-28',
      dentro_de_plazo: true,
      condiciones_de_operacion: 'Dentro de la ficha técnica: fluido a 35 °C (máximo 90 °C) y 6,900 horas, antes de la revisión del sello (8,000 h) y del cambio de rodamientos (16,000 h).',
      posibles_exclusiones: 'El desgaste normal del sello mecánico y de los rodamientos no está cubierto; el diagnóstico debe determinar si la falla es de fabricación o por desgaste o por los sólidos finos del fluido.',
      siguientes_pasos: ['Asignar número de reclamo en máximo 2 días hábiles.', 'Diagnóstico en sitio o en taller en máximo 5 días hábiles.', 'Si está cubierta: reparación o reemplazo sin costo, incluido flete.'],
    },
    criterios_evaluacion: ['Aplica la regla de "lo que ocurra primero".', 'No afirma cobertura total sin diagnóstico.', 'Cita plazos de la política.'],
  });

  // 13. Cuentas por pagar vencidas
  const vencidas = t.cxp
    .filter((f) => f.estado === 'Pendiente' && f.fecha_vencimiento < CORTE)
    .map((f) => ({ factura: f.factura, proveedor: f.proveedor, monto: f.monto, fecha_vencimiento: f.fecha_vencimiento, dias_vencida: diasEntre(f.fecha_vencimiento, CORTE) }))
    .sort((a, b) => b.dias_vencida - a.dias_vencida);
  agregar({
    titulo: 'Facturas de proveedores vencidas',
    nivel: 'básico',
    tarea: `Con fecha de corte ${CORTE}, lista las facturas pendientes de pago cuyo vencimiento ya pasó, con los días de atraso, y el monto total vencido.`,
    documentos: ['fin-cuentas-por-pagar', 'fin-politica-compras'],
    herramientas_sugeridas: ['leer_tabla', 'calcular_fechas'],
    pasos_esperados: ['Filtrar facturas pendientes con vencimiento anterior al corte.', 'Calcular días de atraso.', 'Sumar montos.'],
    respuesta_esperada: { total_facturas: vencidas.length, monto_total: round(vencidas.reduce((s, f) => s + f.monto, 0)), facturas: vencidas },
    criterios_evaluacion: ['No incluye facturas pagadas ni por vencer.', 'Total correcto.'],
  });

  // 14. Penalizaciones a Arvelo en septiembre
  const incumplidas = t.ordenes.filter((o) => o.ejecutor === 'Servicios Técnicos Arvelo S.A.' && o.fecha_creacion.startsWith('2026-09') && o.cumple_sla === 'No');
  const { mensualidad, penalizacionPct, topePct } = reglas.slaArvelo;
  const penalizacion = Math.min(incumplidas.length * mensualidad * (penalizacionPct / 100), mensualidad * (topePct / 100));
  agregar({
    titulo: 'Penalizaciones al proveedor de mantenimiento (septiembre)',
    nivel: 'avanzado',
    tarea: 'Determina cuántas órdenes atendidas por Servicios Técnicos Arvelo S.A. registradas en septiembre de 2026 incumplieron el SLA y calcula la penalización que Nexora debe descontar en la factura siguiente según el contrato.',
    documentos: ['op-ordenes-mantenimiento', 'leg-contrato-arvelo', 'leg-acta-comite-julio-2026'],
    herramientas_sugeridas: ['leer_tabla', 'buscar_documentos', 'calcular'],
    pasos_esperados: ['Filtrar órdenes de Arvelo creadas en septiembre.', 'Identificar las que exceden el tiempo máximo de su prioridad.', 'Aplicar 2% de la mensualidad por orden con tope del 20%.'],
    respuesta_esperada: {
      ordenes_incumplidas: incumplidas.map((o) => ({ orden: o.orden, equipo: o.equipo, prioridad: o.prioridad, horas_resolucion: o.horas_resolucion, sla_horas: o.sla_horas })),
      mensualidad,
      penalizacion_por_orden: mensualidad * (penalizacionPct / 100),
      tope: mensualidad * (topePct / 100),
      penalizacion_total: penalizacion,
    },
    criterios_evaluacion: ['Aplica el tope mensual.', 'Solo cuenta órdenes del proveedor externo.'],
  });

  // 15. Plan de primera semana de un técnico nuevo
  agregar({
    titulo: 'Plan de incorporación de un técnico de mantenimiento',
    nivel: 'intermedio',
    tarea: 'Un técnico de mantenimiento se incorpora el próximo lunes a Planta Norte. Elabora su checklist de la primera semana y del primer mes, incluyendo certificaciones obligatorias, EPP y contactos útiles.',
    documentos: ['rh-manual-onboarding', 'rh-puesto-tecnico-mantenimiento', 'op-manual-seguridad', 'leg-proteccion-datos'],
    herramientas_sugeridas: ['buscar_documentos'],
    pasos_esperados: ['Leer el manual de onboarding.', 'Añadir requisitos del puesto.', 'Añadir requisitos de seguridad y EPP.'],
    respuesta_esperada: {
      elementos_obligatorios: [
        'Credencial, correo y usuario del portal Nexo el primer día.',
        'Carta de aceptación del Código de ética y aviso de privacidad.',
        'Inducción de seguridad de 8 horas antes de ingresar a planta.',
        'Curso de bloqueo y etiquetado (LOTO) en los primeros 30 días.',
        'Curso de protección de datos en el primer mes.',
        'EPP: casco, lentes, calzado con casquillo, protección auditiva, guantes según tarea, ropa de algodón, candado y tarjeta LOTO personales.',
        'Mentor asignado y revisiones a los 30, 60 y 90 días.',
        'Contactos: TI ext. 4400, emergencias ext. 5555, línea ética ext. 7777.',
      ],
    },
    criterios_evaluacion: ['Incluye inducción de seguridad y LOTO.', 'No incluye teletrabajo (no aplica al puesto).'],
  });

  return esc;
}
