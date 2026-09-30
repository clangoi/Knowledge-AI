// Datasets de fine-tuning. Las respuestas se derivan de las reglas de
// empresa.mjs (las mismas que describen las políticas), así que son coherentes
// con el corpus documental.
import { centrosCosto, diasVacaciones, reglaPorMonto, reglas } from './empresa.mjs';
import { MESES, rng, round } from './lib/util.mjs';

const r = rng(7331);
const n0 = (n) => Math.round(n).toLocaleString('en-US');
const n2 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signo = (n) => (n >= 0 ? '+' : '−');

// Separa en entrenamiento y validación de forma determinista.
function dividir(items, proporcion = 0.15) {
  const mezclados = r.shuffle(items);
  const corte = Math.round(mezclados.length * proporcion);
  return { validation: mezclados.slice(0, corte), train: mezclados.slice(corte) };
}

// ---------------------------------------------------------------------------
// 1. Soporte interno (formato chat)
// ---------------------------------------------------------------------------
const SISTEMA_SOPORTE =
  'Eres el asistente de soporte interno de Nexora Industrial S.A. Respondes dudas de los empleados sobre políticas de Recursos Humanos, viáticos, compras y seguridad, de forma breve, amable y citando la política aplicable. Si la información no está en las políticas, lo dices y sugieres a quién acudir.';

const INTENCIONES = [
  {
    preguntas: ['¿Cuándo pagan la nómina?', 'qué días cae la quincena', '¿La nómina es quincenal o mensual?', 'Oye, ¿cuándo depositan el sueldo?'],
    respuesta: 'La nómina es quincenal: se paga los días 15 y último de cada mes. Si el día de pago cae en fin de semana o festivo, se paga el día hábil anterior. Puedes consultar tus recibos en el portal Nexo, sección "Mis documentos".',
  },
  {
    preguntas: ['Hay un error en mi pago, ¿qué hago?', 'me pagaron de menos esta quincena', 'Mi recibo de nómina tiene un descuento que no reconozco', '¿A quién le escribo si mi nómina está mal?'],
    respuesta: 'Escribe a nomina@nexora-industrial.example con tu número de empleado y el detalle del error. Las correcciones se aplican en la siguiente quincena.',
  },
  {
    preguntas: ['¿Dónde solicito vacaciones?', 'cómo pido mis vacaciones', '¿Con cuánta anticipación debo pedir vacaciones?', 'Quiero tomar vacaciones el mes que entra, ¿qué tengo que hacer?'],
    respuesta: 'Las vacaciones se solicitan en el portal Nexo con al menos 15 días naturales de anticipación. Tu jefe directo debe responder en un máximo de 5 días hábiles (Política de vacaciones y permisos, POL-RH-003).',
  },
  {
    preguntas: ['¿Se pierden las vacaciones que no tomo?', 'cuántos periodos de vacaciones puedo juntar', '¿Puedo acumular vacaciones de varios años?'],
    respuesta: 'Puedes acumular como máximo dos periodos de vacaciones. Cada periodo vence 18 meses después de haberse generado y los días no disfrutados se pierden, salvo que tu jefe haya negado la solicitud por necesidades del servicio; en ese caso RR. HH. amplía el plazo 6 meses.',
  },
  {
    preguntas: ['¿Cuánto es la prima vacacional?', 'me pagan algo extra en vacaciones?', '¿Cuándo pagan la prima vacacional?'],
    respuesta: 'La prima vacacional es del 25% sobre el salario de los días de vacaciones y se paga en la quincena en la que las disfrutas.',
  },
  {
    preguntas: ['¿Cuántos días me dan por paternidad?', 'Voy a ser papá, ¿tengo permiso?', 'permiso por nacimiento de mi hijo'],
    respuesta: '¡Felicidades! Tienes 10 días hábiles de permiso con goce de sueldo por nacimiento o adopción. Solicítalo en el portal Nexo y entrega el documento que lo justifique en un plazo de 10 días hábiles.',
  },
  {
    preguntas: ['¿Cuántos días me dan si me caso?', 'permiso por matrimonio', 'Me caso en noviembre, ¿tengo días libres?'],
    respuesta: 'Tienes 5 días hábiles de permiso con goce de sueldo por matrimonio. Solicítalo en el portal Nexo y entrega el acta en un plazo de 10 días hábiles.',
  },
  {
    preguntas: ['Falleció mi papá, ¿tengo permiso?', 'permiso por fallecimiento de un familiar', '¿Cuántos días dan por luto?'],
    respuesta: 'Lamento mucho tu pérdida. Tienes 3 días hábiles de permiso con goce de sueldo por el fallecimiento de un familiar directo (padres, cónyuge, hijos o hermanos). Avisa a tu jefe y registra el permiso en el portal Nexo cuando puedas.',
  },
  {
    preguntas: ['¿Puedo hacer home office?', 'cuántos días de teletrabajo tengo', '¿Cómo pido trabajar desde casa?', 'Soy analista en oficinas, ¿puedo teletrabajar?'],
    respuesta: 'Si tu puesto es administrativo y elegible, puedes teletrabajar hasta 2 días por semana. Necesitas haber concluido tu periodo de prueba y tener una evaluación de 3 o más. La solicitud se hace con el formato F-310 en el portal Nexo (Política de teletrabajo, POL-RH-004).',
  },
  {
    preguntas: ['Soy operador CNC, ¿puedo hacer home office?', '¿El personal de planta puede teletrabajar?', 'trabajo en mantenimiento, ¿me toca teletrabajo?'],
    respuesta: 'No. Los puestos de planta (producción, mantenimiento, calidad, almacén y seguridad industrial) no son elegibles para teletrabajo según la Política de teletrabajo.',
  },
  {
    preguntas: ['¿Dan algún apoyo para internet si hago teletrabajo?', 'me pagan el internet de la casa?'],
    respuesta: 'Sí. Si tienes un acuerdo de teletrabajo vigente recibes un apoyo de 30 USD mensuales para internet y energía.',
  },
  {
    preguntas: ['¿Cómo funciona el fondo de ahorro?', 'cuánto aporta la empresa al fondo de ahorro', '¿Cuándo se entrega el fondo de ahorro?'],
    respuesta: 'Tú aportas hasta el 5% de tu sueldo base y Nexora aporta la misma cantidad. El fondo se liquida cada año en diciembre.',
  },
  {
    preguntas: ['¿Nexora me ayuda a pagar la maestría?', 'apoyo educativo requisitos', '¿Cuánto me reembolsan de la colegiatura?'],
    respuesta: 'Nexora reembolsa el 50% de la colegiatura, hasta 2,000 USD al año, para estudios relacionados con tu puesto. Necesitas al menos 1 año de antigüedad y un promedio mínimo de 8. Si dejas la empresa en los 12 meses siguientes al último reembolso, debes devolver el 50% de lo recibido.',
  },
  {
    preguntas: ['¿El seguro médico cubre a mi esposa?', 'mis hijos tienen seguro de gastos médicos?', '¿Quién está cubierto por el seguro de gastos médicos mayores?'],
    respuesta: 'Sí. El seguro de gastos médicos mayores cubre al colaborador, a su cónyuge y a sus hijos menores de 25 años, para el personal con contrato por tiempo indeterminado. La suma asegurada es de 150,000 USD por evento, con un deducible de 500 USD.',
  },
  {
    preguntas: ['¿Cuánto es el aguinaldo?', 'cuándo pagan el aguinaldo'],
    respuesta: 'Nexora paga un aguinaldo de 30 días de salario, a más tardar el 15 de diciembre.',
  },
  {
    preguntas: ['¿Cuántos retardos hacen una falta?', 'si llego tarde varias veces qué pasa', '¿Cuál es la tolerancia de entrada?'],
    respuesta: 'Hay una tolerancia de 10 minutos. Llegar después cuenta como retardo, y tres retardos en un mismo mes calendario equivalen a una falta injustificada (Reglamento interno de trabajo).',
  },
  {
    preguntas: ['¿Dónde reporto una denuncia de acoso?', 'quiero hacer una denuncia anónima', '¿Cómo contacto la línea ética?'],
    respuesta: 'Puedes reportar a través de la Línea ética: correo etica@nexora-industrial.example, extensión 7777 (buzón confidencial) o el formulario anónimo del portal Nexo. Nexora prohíbe cualquier represalia contra quien reporte de buena fe.',
  },
  {
    preguntas: ['Un proveedor me quiere regalar una botella, ¿puedo aceptarla?', '¿Hasta cuánto puedo recibir de regalo?', 'me ofrecieron una tarjeta de regalo de un proveedor'],
    respuesta: 'Solo puedes aceptar regalos con valor de hasta 50 USD por ocasión, que no sean efectivo ni equivalentes (como tarjetas de regalo) y que no se reciban durante un proceso de compra en el que participe el proveedor. Si supera ese valor, recházalo con cortesía o entrégalo a Legal (Código de ética y conducta).',
  },
  {
    preguntas: ['¿Qué formato uso para mis gastos de viaje?', 'dónde está el formulario de reembolso de viáticos', '¿Cómo compruebo mis gastos de un viaje?'],
    respuesta: 'Usa el formulario F-203 "Reporte de gastos de viaje" del portal Nexo, con todos los comprobantes digitalizados. Debes presentarlo en un plazo máximo de 10 días hábiles después de tu regreso.',
  },
  {
    preguntas: ['¿Me reembolsan el alcohol de una cena con clientes?', 'puedo cargar unas cervezas a viáticos?'],
    respuesta: 'No. Las bebidas alcohólicas no son reembolsables, incluso durante comidas con clientes (Política de viáticos, POL-FIN-004).',
  },
  {
    preguntas: ['¿Puedo volar en clase ejecutiva?', 'el vuelo a la feria es de 10 horas, ¿puedo ir en business?'],
    respuesta: 'Los vuelos son siempre en clase económica. La clase ejecutiva solo se autoriza en vuelos de más de 8 horas y con aprobación del Director General.',
  },
  {
    preguntas: ['¿Cuánto me pueden dar de anticipo para un viaje?', 'cómo pido anticipo de viáticos'],
    respuesta: 'Puedes solicitar un anticipo de hasta el 70% del gasto estimado, con al menos 5 días hábiles antes de la salida. No se otorga un nuevo anticipo si tienes uno anterior sin comprobar.',
  },
  {
    preguntas: ['¿Cuál es la extensión de soporte de TI?', 'olvidé mi contraseña del correo', 'mi laptop no enciende, ¿a quién llamo?'],
    respuesta: 'Contacta a Soporte de TI en la extensión 4400 o en soporte@nexora-industrial.example.',
  },
  {
    preguntas: ['Perdí mi laptop del trabajo', 'me robaron el equipo de la empresa, ¿qué hago?'],
    respuesta: 'Repórtalo de inmediato a Soporte de TI (extensión 4400) y a la Oficial de Protección de Datos (privacidad@nexora-industrial.example). Si el equipo tenía datos personales, cuenta como posible brecha y debe notificarse en un máximo de 24 horas.',
  },
  {
    preguntas: ['¿Puedo usar un chatbot externo para resumir un contrato?', 'puedo pegar datos de clientes en una IA pública?'],
    respuesta: 'No. Está prohibido introducir datos personales o información Confidencial o Restringida en servicios de IA externos no autorizados. Usa la plataforma interna Knowledge AI (Política de protección de datos, POL-LEG-003).',
  },
  {
    preguntas: ['¿Cuál es el número de emergencia en planta?', 'hay un incendio, a qué extensión llamo'],
    respuesta: 'Marca la extensión 5555 desde cualquier teléfono interno o activa la alarma manual más cercana. Indica tu nombre, la ubicación exacta, el tipo de emergencia y si hay lesionados.',
  },
  {
    preguntas: ['¿En cuánto tiempo reporto un casi accidente?', 'cómo reporto una condición insegura'],
    respuesta: 'Avisa a tu supervisor de inmediato y registra el reporte en el formato F-701 en un plazo máximo de 24 horas (Manual de seguridad industrial).',
  },
  {
    preguntas: ['¿Tengo que hacer el curso de seguridad aunque trabaje en oficina?', 'soy administrativo, ¿necesito la inducción de seguridad?'],
    respuesta: 'Sí. La inducción de seguridad de 8 horas es obligatoria antes de ingresar a cualquier área de planta, incluso para puestos administrativos. Se imparte los lunes y miércoles.',
  },
  {
    preguntas: ['¿Cuánto dura el periodo de prueba?', 'cuándo me hacen planta?'],
    respuesta: 'El periodo de prueba es de 90 días, con revisiones a los 30, 60 y 90 días con tu jefe directo y un mentor asignado. Si los resultados son satisfactorios, se formaliza tu contrato por tiempo indeterminado.',
  },
  {
    preguntas: ['¿Cuánto bono me toca si saco 4 en la evaluación?', 'relación entre calificación y bono'],
    respuesta: 'Con calificación 5 recibes el 130% del bono objetivo; con 4, el 100%; con 3, el 70%; y con 2 o 1 no hay bono. El bono se paga en febrero del año siguiente.',
  },
  {
    preguntas: ['¿Cuál es el horario de oficina?', 'a qué hora se entra en oficinas centrales'],
    respuesta: 'El horario administrativo es de lunes a viernes de 8:30 a 17:30, con una hora para comer.',
  },
  {
    preguntas: ['¿Pueden llevar mascotas a la oficina?', '¿Hay estacionamiento para bicicletas?', '¿Nexora da descuentos en autos?'],
    respuesta: 'No encuentro esa información en las políticas internas. Te sugiero consultarlo con Recursos Humanos (rrhh@nexora-industrial.example).',
  },
];

const PLANTILLAS_VACACIONES = [
  (a) => `Cumplí ${a} años en Nexora, ¿cuántos días de vacaciones me tocan?`,
  (a) => `tengo ${a} ${a === 1 ? 'año' : 'años'} de antigüedad, cuántas vacaciones tengo`,
  (a) => `¿Cuántos días de vacaciones corresponden con ${a} ${a === 1 ? 'año' : 'años'} de servicio?`,
];
const PLANTILLAS_COTIZACIONES = [
  (m) => `¿Cuántas cotizaciones necesito para una compra de ${n0(m)} USD?`,
  (m) => `voy a comprar algo de ${n0(m)} dólares, qué necesito de cotizaciones`,
  (m) => `Compra de ${n2(m)} USD: ¿requiere cotizaciones?`,
];
const PLANTILLAS_APROBACION = [
  (m) => `¿Quién aprueba un gasto de ${n0(m)} USD?`,
  (m) => `necesito autorización para ${n0(m)} usd, quién firma`,
  (m) => `Tengo una orden de compra por ${n2(m)} USD, ¿qué nivel de aprobación requiere?`,
];

function soporte() {
  const items = [];
  const chat = (usuario, asistente) => ({
    messages: [
      { role: 'system', content: SISTEMA_SOPORTE },
      { role: 'user', content: usuario },
      { role: 'assistant', content: asistente },
    ],
  });
  for (const i of INTENCIONES) for (const p of i.preguntas) items.push(chat(p, i.respuesta));

  for (let a = 0; a <= 32; a++) {
    for (const t of PLANTILLAS_VACACIONES.slice(0, a < 11 ? 3 : 1)) {
      const anios = Math.max(a, 1);
      if (a === 0) {
        items.push(chat('Entré hace 8 meses, ¿ya me tocan vacaciones?', 'Todavía no. El derecho a vacaciones se genera al cumplir el primer año de servicio; en ese momento te corresponden 12 días. Mientras tanto, puedes solicitar un permiso sin goce de sueldo, sujeto a aprobación.'));
        break;
      }
      const dias = diasVacaciones(anios);
      items.push(chat(t(anios), `Con ${anios} ${anios === 1 ? 'año' : 'años'} de servicio cumplidos te corresponden ${dias} días de vacaciones, más una prima vacacional del 25%. Solicítalas en el portal Nexo con al menos 15 días naturales de anticipación (Política de vacaciones y permisos).`));
    }
  }

  const montos = [450, 800, 1000, 1250, 3400, 7200, 9999, 10000, 12500, 18000, 24000, 25000, 31000, 48000, 50000, 62000, 99000, 150000, 480000, 720000];
  for (const m of montos) {
    const regla = reglaPorMonto(reglas.compras, m);
    const texto =
      regla.cotizaciones === 0
        ? 'Es una compra directa: basta con la factura, sin cotizaciones.'
        : regla.hasta === Infinity
          ? 'Requiere una licitación con el Comité de Compras.'
          : `Necesitas ${regla.cotizaciones === 2 ? 'dos cotizaciones' : 'tres cotizaciones y un cuadro comparativo'}.`;
    items.push(chat(r.pick(PLANTILLAS_COTIZACIONES)(m), `${texto} Recuerda que el proveedor debe estar en el Padrón de proveedores aprobados y que la aprobación se rige aparte por la Política de firmas (Política de compras, POL-FIN-003).`));
    const ap = reglaPorMonto(reglas.aprobaciones, m);
    items.push(chat(r.pick(PLANTILLAS_APROBACION)(m), `Un compromiso de ${n0(m)} USD lo aprueba: ${ap.aprueba}. El monto se calcula sin impuestos y por toda la vigencia, y está prohibido dividir la compra para bajar de nivel (Política de firmas y niveles de aprobación, POL-LEG-002).`));
  }

  for (let i = 0; i < 24; i++) {
    const km = r.int(40, 900);
    items.push(chat(
      r.pick([`Hice ${km} km con mi auto para visitar a un cliente, ¿cuánto me reembolsan?`, `viaje de ${km} kilómetros en auto propio, cuánto cobro`, `¿Cuánto es el reembolso por ${km} km en mi coche?`]),
      `Se reembolsan 0.35 USD por kilómetro: ${km} km × 0.35 = ${n2(round(km * reglas.viaticos.kilometraje))} USD, más casetas y estacionamiento con comprobante. Repórtalo en el F-203 con origen, destino y distancia.`,
    ));
  }

  for (let i = 0; i < 30; i++) {
    const tipo = r.chance(0.6) ? 'nacional' : 'internacional';
    const tope = reglas.viaticos.hospedajeNoche[tipo];
    const precio = r.int(Math.round(tope * 0.6), Math.round(tope * 1.4));
    const ok = precio <= tope;
    items.push(chat(
      `El hotel para mi viaje ${tipo} cuesta ${precio} USD por noche, ¿está dentro de la política?`,
      ok
        ? `Sí. El tope de hospedaje para viajes ${tipo}es es de ${tope} USD por noche (impuestos incluidos) y ${precio} USD está dentro del límite.`
        : `No. El tope de hospedaje para viajes ${tipo}es es de ${tope} USD por noche (impuestos incluidos). El excedente de ${precio - tope} USD por noche no se reembolsa, salvo autorización por escrito de la Directora de Finanzas antes del viaje.`,
    ));
  }
  return items;
}

// ---------------------------------------------------------------------------
// 2. Clasificación de cláusulas contractuales (formato instrucción)
// ---------------------------------------------------------------------------
const CATEGORIAS = {
  Pago: [
    ({ dias }) => `El Cliente pagará cada factura dentro de los ${dias} días naturales siguientes a su recepción, mediante transferencia bancaria a la cuenta que el Proveedor designe.`,
    ({ pct }) => `El Comprador entregará un anticipo del ${pct}% del valor del pedido a la firma de la orden de compra y el saldo contra entrega.`,
    ({ dias }) => `Las facturas con errores serán devueltas y el plazo de pago de ${dias} días comenzará a contar a partir de la recepción de la factura corregida.`,
    () => 'Los precios se expresan en dólares estadounidenses y no incluyen impuestos, los cuales se trasladarán por separado en cada factura.',
  ],
  Penalización: [
    ({ pct, tope }) => `Por cada día natural de retraso en la entrega, el Proveedor pagará una pena convencional del ${pct}% del valor del pedido, sin exceder el ${tope}% de dicho valor.`,
    ({ pct }) => `El incumplimiento de los niveles de servicio acordados dará lugar a un descuento del ${pct}% sobre la mensualidad del periodo correspondiente.`,
    ({ tope }) => `Las penas convencionales acumuladas en un mes no podrán superar el ${tope}% del monto mensual del contrato.`,
  ],
  Confidencialidad: [
    ({ anios }) => `La Parte receptora mantendrá en estricta reserva la información técnica y comercial recibida durante la vigencia del contrato y ${anios} años posteriores a su terminación.`,
    () => 'Ninguna de las partes podrá revelar a terceros el contenido de este contrato sin el consentimiento previo y por escrito de la otra parte.',
    ({ dias }) => `A la terminación del acuerdo, la Parte receptora devolverá o destruirá la información confidencial en un plazo de ${dias} días naturales.`,
  ],
  'Terminación': [
    ({ dias }) => `Cualquiera de las partes podrá dar por terminado el presente contrato, sin responsabilidad, mediante aviso por escrito con ${dias} días naturales de anticipación.`,
    () => 'El Cliente podrá rescindir el contrato de forma inmediata si el Proveedor incurre en incumplimiento grave de sus obligaciones y no lo subsana en un plazo de diez días.',
    ({ n }) => `Serán causa de rescisión ${n} rechazos de entregas por defectos de calidad dentro de un periodo de seis meses.`,
  ],
  'Jurisdicción': [
    () => 'Para la interpretación y cumplimiento de este contrato, las partes se someten a los tribunales competentes del domicilio del Cliente, renunciando a cualquier otro fuero.',
    () => 'Las controversias derivadas de este instrumento se resolverán mediante arbitraje conforme a las reglas de la institución arbitral que las partes acuerden.',
    () => 'Este contrato se rige por las leyes aplicables en el domicilio de la parte contratante.',
  ],
  'Garantía': [
    ({ meses }) => `El Proveedor garantiza los bienes contra defectos de materiales y fabricación por un periodo de ${meses} meses contados a partir de su entrega.`,
    () => 'Durante el periodo de garantía, el Proveedor reemplazará sin costo los bienes defectuosos, incluidos los gastos de flete.',
    () => 'La garantía no cubre el desgaste normal de los componentes ni los daños por uso indebido o instalación incorrecta.',
  ],
  'Propiedad intelectual': [
    () => 'Los planos, especificaciones y diseños entregados por el Cliente son de su exclusiva propiedad y no podrán utilizarse para fabricar piezas para terceros.',
    () => 'Ninguna disposición del presente acuerdo otorga licencia sobre patentes, marcas o secretos industriales de la otra parte.',
    () => 'Los desarrollos realizados por el Prestador con motivo de este contrato serán propiedad del Cliente desde su creación.',
  ],
  'Fuerza mayor': [
    ({ dias }) => `Ninguna de las partes será responsable por el incumplimiento causado por caso fortuito o fuerza mayor, siempre que lo notifique a la otra parte dentro de los ${dias} días siguientes al evento.`,
    ({ dias }) => `Si la causa de fuerza mayor se prolonga por más de ${dias} días naturales, cualquiera de las partes podrá terminar el contrato sin responsabilidad.`,
  ],
  'Vigencia y renovación': [
    ({ anios }) => `El presente contrato tendrá una vigencia de ${anios} años a partir de la fecha de su firma.`,
    ({ dias }) => `El contrato se renovará automáticamente por periodos anuales, salvo aviso en contrario con ${dias} días naturales de anticipación al vencimiento.`,
    () => 'La renovación del contrato requerirá la firma de un nuevo instrumento por ambas partes.',
  ],
  Seguros: [
    ({ monto }) => `El Proveedor deberá contratar y mantener vigente una póliza de responsabilidad civil con una suma asegurada mínima de ${monto} USD.`,
    () => 'El Prestador entregará copia de sus pólizas de seguro vigentes al inicio del contrato y en cada renovación.',
  ],
};
const INSTRUCCION_CLAUSULA =
  'Clasifica la siguiente cláusula contractual en una sola categoría: Pago, Penalización, Confidencialidad, Terminación, Jurisdicción, Garantía, Propiedad intelectual, Fuerza mayor, Vigencia y renovación o Seguros. Responde solo con el nombre de la categoría.';
const PARTES = [
  ['el Proveedor', 'el Cliente'],
  ['el Prestador', 'Nexora'],
  ['la Contraparte', 'Nexora'],
  ['el Distribuidor', 'Nexora'],
  ['el Vendedor', 'el Comprador'],
];

function clasificacion() {
  const items = [];
  const vistos = new Set();
  for (const [categoria, plantillas] of Object.entries(CATEGORIAS)) {
    let intentos = 0;
    let n = 0;
    while (n < 26 && intentos < 400) {
      intentos++;
      const p = r.pick(plantillas);
      let texto = p({
        dias: r.pick([10, 15, 30, 45, 60, 90]),
        pct: r.pick([0.5, 1, 2, 3, 5, 30, 50]),
        tope: r.pick([10, 15, 20]),
        anios: r.pick([1, 2, 3, 5]),
        meses: r.pick([6, 12, 18, 24]),
        monto: r.pick(['250,000', '500,000', '1,000,000']),
        n: r.pick(['dos', 'tres', 'cuatro']),
      });
      const [a, b] = r.pick(PARTES);
      texto = texto.replace(/\bel (Proveedor|Prestador)\b/g, a).replace(/\b[eE]l Cliente\b/g, (m) => (m[0] === 'E' ? b[0].toUpperCase() + b.slice(1) : b));
      if (r.chance(0.3)) texto = `Cláusula ${r.pick(['Cuarta', 'Quinta', 'Sexta', 'Séptima', 'Octava', 'Décima'])}. ${texto}`;
      if (vistos.has(texto)) continue;
      vistos.add(texto);
      items.push({ instruccion: INSTRUCCION_CLAUSULA, entrada: texto, salida: categoria });
      n++;
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// 3. Resúmenes financieros (formato chat)
// ---------------------------------------------------------------------------
const SISTEMA_FINANZAS =
  'Eres un analista financiero de Nexora Industrial S.A. Recibes cifras de gasto de un centro de costo y redactas un resumen breve en español: gasto real frente a presupuesto, variación en USD y porcentaje, y si la variación requiere explicación según el umbral de ±10% del Procedimiento de cierre contable mensual.';

function resumenCentro({ cc, periodo, presupuesto, real }) {
  const variacion = real - presupuesto;
  const pct = variacion / presupuesto;
  const fuera = Math.abs(pct) > 0.1;
  const entrada = `Centro de costo: ${cc.id} ${cc.nombre}\nPeriodo: ${periodo}\nPresupuesto: ${n0(presupuesto)} USD\nReal: ${n0(real)} USD`;
  const salida =
    `En ${periodo}, ${cc.id} ${cc.nombre} registró un gasto de ${n0(real)} USD frente a ${n0(presupuesto)} USD presupuestados, ` +
    `una variación de ${signo(variacion)}${n0(Math.abs(variacion))} USD (${signo(pct)}${(Math.abs(pct) * 100).toFixed(1)}%). ` +
    (fuera
      ? `La variación supera el umbral de ±10%, por lo que el responsable del centro de costo debe explicarla en un plazo de 3 días hábiles.`
      : `La variación está dentro del rango de ±10% y no requiere explicación adicional.`);
  return { entrada, salida };
}

function resumenes(tablas) {
  const items = [];
  const chat = ({ entrada, salida }) => ({
    messages: [
      { role: 'system', content: SISTEMA_FINANZAS },
      { role: 'user', content: entrada },
      { role: 'assistant', content: salida },
    ],
  });
  const ccPorId = Object.fromEntries(centrosCosto.map((c) => [c.id, c]));

  // Meses reales del presupuesto 2026.
  for (const p of tablas.presupuesto.filter((p) => p.real !== null))
    items.push(chat(resumenCentro({ cc: ccPorId[p.centro_costo], periodo: `${p.mes_nombre.toLowerCase()} de 2026`, presupuesto: p.presupuesto, real: p.real })));

  // Trimestres reales.
  for (const q of [1, 2]) {
    for (const cc of centrosCosto) {
      const filas = tablas.presupuesto.filter((p) => p.centro_costo === cc.id && Math.ceil(p.mes / 3) === q);
      items.push(chat(resumenCentro({
        cc,
        periodo: `el ${q === 1 ? 'primer' : 'segundo'} trimestre de 2026`,
        presupuesto: filas.reduce((s, f) => s + f.presupuesto, 0),
        real: filas.reduce((s, f) => s + f.real, 0),
      })));
    }
  }

  // Ejercicios anteriores simulados, para dar variedad.
  for (let i = 0; i < 70; i++) {
    const cc = r.pick(centrosCosto);
    const anio = r.pick([2024, 2025]);
    const mes = r.int(1, 12);
    const presupuesto = Math.round(r.int(15, 400) * 1000 * (1 + r.next() * 0.2));
    const real = Math.round(presupuesto * (0.78 + r.next() * 0.45));
    items.push(chat(resumenCentro({ cc, periodo: `${MESES[mes - 1].toLowerCase()} de ${anio}`, presupuesto, real })));
  }

  // Resúmenes del estado de resultados mensual.
  for (const m of tablas.resultados) {
    const varIng = m.ingresos / m.ingresos_presupuesto - 1;
    items.push(chat({
      entrada: `Estado de resultados de ${m.mes_nombre.toLowerCase()} de 2026\nIngresos: ${n2(m.ingresos)} USD (presupuesto ${n0(m.ingresos_presupuesto)} USD)\nUtilidad bruta: ${n2(m.utilidad_bruta)} USD\nGastos de operación: ${n0(m.gastos_operacion)} USD\nUtilidad neta: ${n2(m.utilidad_neta)} USD`,
      salida:
        `En ${m.mes_nombre.toLowerCase()} de 2026 los ingresos fueron de ${n2(m.ingresos)} USD, ${varIng >= 0 ? 'por encima' : 'por debajo'} del presupuesto en ${(Math.abs(varIng) * 100).toFixed(1)}%. ` +
        `El margen bruto fue de ${(m.margen_bruto_pct * 100).toFixed(1)}% y, tras ${n0(m.gastos_operacion)} USD de gastos de operación, la utilidad neta fue de ${n2(m.utilidad_neta)} USD.`,
    }));
  }
  return items;
}

export function generarFineTuning(tablas) {
  return {
    'soporte-interno': { formato: 'chat', descripcion: 'Preguntas de empleados y respuestas del asistente de soporte interno, basadas en las políticas de RR. HH., viáticos, compras, ética y seguridad.', ...dividir(soporte()) },
    'clasificacion-clausulas': { formato: 'instruccion', descripcion: 'Cláusulas contractuales etiquetadas con una de 10 categorías.', ...dividir(clasificacion()) },
    'resumenes-financieros': { formato: 'chat', descripcion: 'Cifras de gasto por centro de costo y estados de resultados con su resumen redactado por un analista.', ...dividir(resumenes(tablas)) },
  };
}
