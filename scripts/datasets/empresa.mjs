// Hechos base de la empresa ficticia. Todos los documentos, hojas de cálculo y
// datasets se construyen a partir de aquí para que las cifras sean coherentes
// entre archivos. Si cambias un dato, vuelve a ejecutar `npm run datasets`.

export const empresa = {
  nombre: 'Nexora Industrial S.A.',
  nombreCorto: 'Nexora',
  giro: 'Fabricación de bombas centrífugas y válvulas industriales',
  fundacion: 1998,
  dominio: 'nexora-industrial.example',
  moneda: 'USD',
  // Fecha de referencia del dataset: "hoy" para todos los escenarios.
  fechaCorte: '2026-09-30',
  sedes: [
    { id: 'OC', nombre: 'Oficinas centrales', descripcion: 'Dirección, Finanzas, Legal, RR. HH. y Comercial' },
    { id: 'PN', nombre: 'Planta Norte', descripcion: 'Fundición y mecanizado (Líneas 1, 2 y 3)' },
    { id: 'PS', nombre: 'Planta Sur', descripcion: 'Ensamble y bancos de prueba (Líneas 4 y 5)' },
  ],
};

// Personas clave (ficticias). `usuario` coincide con el usuario demo de la app.
export const personas = {
  director: { nombre: 'Martín Olmedo', puesto: 'Director General' },
  finanzas: { nombre: 'Carla Ruiz', puesto: 'Directora de Finanzas' },
  legal: { nombre: 'Luis Méndez', puesto: 'Gerente Legal' },
  rrhh: { nombre: 'Ana Torres', puesto: 'Gerente de Recursos Humanos' },
  comercial: { nombre: 'Sofía León', puesto: 'Gerente Comercial' },
  operaciones: { nombre: 'Elena Vargas', puesto: 'Gerente de Operaciones' },
  mantenimiento: { nombre: 'Jorge Paz', puesto: 'Jefe de Mantenimiento, Planta Norte' },
  seguridad: { nombre: 'Tomás Rivas', puesto: 'Jefe de Seguridad Industrial' },
  compras: { nombre: 'Pablo Iturbe', puesto: 'Jefe de Compras' },
  datos: { nombre: 'Irene Castaño', puesto: 'Oficial de Protección de Datos' },
  contabilidad: { nombre: 'Raúl Benítez', puesto: 'Contador General' },
};

export const productos = [
  { sku: 'NX-100', nombre: 'Bomba centrífuga NX-100', familia: 'Bombas', potenciaHp: 5, caudal: 30, precio: 2450 },
  { sku: 'NX-150', nombre: 'Bomba centrífuga NX-150', familia: 'Bombas', potenciaHp: 10, caudal: 60, precio: 3980 },
  { sku: 'NX-250', nombre: 'Bomba centrífuga NX-250', familia: 'Bombas', potenciaHp: 25, caudal: 150, precio: 8900 },
  { sku: 'NX-400', nombre: 'Bomba centrífuga NX-400', familia: 'Bombas', potenciaHp: 50, caudal: 320, precio: 16500 },
  { sku: 'VX-50', nombre: 'Válvula de compuerta VX-50 (2")', familia: 'Válvulas', precio: 310 },
  { sku: 'VX-80', nombre: 'Válvula de mariposa VX-80 (4")', familia: 'Válvulas', precio: 420 },
  { sku: 'VX-120', nombre: 'Válvula de retención VX-120 (6")', familia: 'Válvulas', precio: 780 },
  { sku: 'KIT-SM', nombre: 'Kit de sello mecánico', familia: 'Refacciones', precio: 185 },
  { sku: 'KIT-RD', nombre: 'Kit de rodamientos', familia: 'Refacciones', precio: 240 },
];

export const clientes = [
  { id: 'CL-001', nombre: 'Aguas del Valle S.A.', segmento: 'Agua y saneamiento', tipo: 'Cliente directo' },
  { id: 'CL-002', nombre: 'Minera Cerro Alto', segmento: 'Minería', tipo: 'Cliente directo' },
  { id: 'CL-003', nombre: 'Agroindustrias La Pradera', segmento: 'Agroindustria', tipo: 'Cliente directo' },
  { id: 'CL-004', nombre: 'Petroquímica Delta Sur', segmento: 'Química', tipo: 'Cliente directo' },
  { id: 'CL-005', nombre: 'Municipio de San Aurelio', segmento: 'Gobierno', tipo: 'Cliente directo' },
  { id: 'CL-006', nombre: 'Papelera Río Claro', segmento: 'Manufactura', tipo: 'Cliente directo' },
  { id: 'CL-007', nombre: 'Hidrotec Distribuciones', segmento: 'Distribución', tipo: 'Distribuidor autorizado' },
  { id: 'CL-008', nombre: 'Bombas y Equipos del Litoral', segmento: 'Distribución', tipo: 'Distribuidor autorizado' },
  { id: 'CL-009', nombre: 'Cervecería Montes Azules', segmento: 'Alimentos y bebidas', tipo: 'Cliente directo' },
  { id: 'CL-010', nombre: 'Textiles Arcoíris', segmento: 'Manufactura', tipo: 'Cliente directo' },
  { id: 'CL-011', nombre: 'Hospital Regional Santa Inés', segmento: 'Salud', tipo: 'Cliente directo' },
  { id: 'CL-012', nombre: 'Riegos Tecnificados del Sur', segmento: 'Distribución', tipo: 'Distribuidor autorizado' },
];

export const proveedores = [
  { id: 'PR-001', nombre: 'Fundiciones Altamira', rubro: 'Piezas fundidas' },
  { id: 'PR-002', nombre: 'Aceros Especiales Borda', rubro: 'Acero inoxidable y barras' },
  { id: 'PR-003', nombre: 'Motores Eléctricos Vantek', rubro: 'Motores eléctricos' },
  { id: 'PR-004', nombre: 'Sellos y Empaques Norte', rubro: 'Sellos mecánicos y empaques' },
  { id: 'PR-005', nombre: 'Rodamientos Precisa', rubro: 'Rodamientos' },
  { id: 'PR-006', nombre: 'Servicios Técnicos Arvelo S.A.', rubro: 'Mantenimiento industrial' },
  { id: 'PR-007', nombre: 'Lubricantes Orbe', rubro: 'Lubricantes y fluidos' },
  { id: 'PR-008', nombre: 'Herramientas de Corte Kesler', rubro: 'Herramientas CNC' },
  { id: 'PR-009', nombre: 'Logística Transandina', rubro: 'Transporte y fletes' },
  { id: 'PR-010', nombre: 'Soluciones TI Cumbre', rubro: 'Software y soporte TI' },
  { id: 'PR-011', nombre: 'Seguridad Industrial Protek', rubro: 'Equipo de protección personal' },
  { id: 'PR-012', nombre: 'Pinturas Industriales Cromo', rubro: 'Recubrimientos' },
];

// Centros de costo usados en presupuesto, gastos y cuentas por pagar.
export const centrosCosto = [
  { id: 'CC-100', nombre: 'Dirección General', area: 'Dirección' },
  { id: 'CC-200', nombre: 'Finanzas y Contabilidad', area: 'Finanzas' },
  { id: 'CC-210', nombre: 'Compras', area: 'Finanzas' },
  { id: 'CC-300', nombre: 'Legal', area: 'Legal' },
  { id: 'CC-400', nombre: 'Recursos Humanos', area: 'Recursos Humanos' },
  { id: 'CC-500', nombre: 'Comercial', area: 'Comercial' },
  { id: 'CC-510', nombre: 'Servicio Postventa', area: 'Comercial' },
  { id: 'CC-600', nombre: 'Producción Planta Norte', area: 'Operaciones' },
  { id: 'CC-610', nombre: 'Producción Planta Sur', area: 'Operaciones' },
  { id: 'CC-620', nombre: 'Mantenimiento', area: 'Operaciones' },
  { id: 'CC-630', nombre: 'Seguridad Industrial', area: 'Operaciones' },
  { id: 'CC-700', nombre: 'Tecnología de la Información', area: 'Dirección' },
];

// Áreas del repositorio documental (carpetas del corpus).
export const areas = [
  { id: 'legal', nombre: 'Legal' },
  { id: 'finanzas', nombre: 'Finanzas' },
  { id: 'recursos-humanos', nombre: 'Recursos Humanos' },
  { id: 'operaciones', nombre: 'Operaciones' },
  { id: 'comercial', nombre: 'Comercial' },
];

// Reglas de negocio que se usan tanto en los documentos como en los cálculos
// de respuestas esperadas (agentes, fine-tuning). Deben coincidir con el texto
// de las políticas en datasets/fuentes/documentos.
export const reglas = {
  viaticos: {
    plazoReporteDiasHabiles: 10,
    alimentacionDia: { nacional: 60, internacional: 90 },
    hospedajeNoche: { nacional: 120, internacional: 200 },
    sinComprobanteMaxDia: 25,
    kilometraje: 0.35,
  },
  compras: [
    { hasta: 1000, cotizaciones: 0, descripcion: 'Compra directa con factura' },
    { hasta: 10000, cotizaciones: 2, descripcion: 'Dos cotizaciones' },
    { hasta: 50000, cotizaciones: 3, descripcion: 'Tres cotizaciones y cuadro comparativo' },
    { hasta: Infinity, cotizaciones: 3, descripcion: 'Licitación con Comité de Compras' },
  ],
  aprobaciones: [
    { hasta: 5000, aprueba: 'Jefe de área' },
    { hasta: 25000, aprueba: 'Gerente de área' },
    { hasta: 100000, aprueba: 'Gerente de área y Directora de Finanzas' },
    { hasta: 500000, aprueba: 'Director General' },
    { hasta: Infinity, aprueba: 'Consejo de Administración' },
  ],
  descuentosVolumen: [
    { desde: 50, pct: 12 },
    { desde: 25, pct: 8 },
    { desde: 10, pct: 5 },
    { desde: 0, pct: 0 },
  ],
  descuentoDistribuidor: 15,
  aprobacionDescuento: [
    { hasta: 15, aprueba: 'Ejecutivo de ventas' },
    { hasta: 25, aprueba: 'Gerente Comercial' },
    { hasta: 100, aprueba: 'Director General' },
  ],
  plazoPagoProveedoresDias: 45,
  vacaciones: [
    { anios: 1, dias: 12 },
    { anios: 2, dias: 14 },
    { anios: 3, dias: 16 },
    { anios: 4, dias: 18 },
    { anios: 5, dias: 20 },
    { anios: 6, dias: 22 }, // 6 a 10 años
    { anios: 11, dias: 24 }, // 11 a 15 años
    { anios: 16, dias: 26 }, // 16 a 20 años
    { anios: 21, dias: 28 }, // 21 a 25 años
    { anios: 26, dias: 30 }, // 26 años o más
  ],
  slaArvelo: { mensualidad: 18500, penalizacionPct: 2, topePct: 20 },
};

export const reglaPorMonto = (tabla, monto) => tabla.find((r) => monto <= r.hasta);

export const diasVacaciones = (anios) => {
  if (anios < 1) return 0;
  let dias = 0;
  for (const r of reglas.vacaciones) if (anios >= r.anios) dias = r.dias;
  return dias;
};

export const descuentoVolumen = (unidades) =>
  reglas.descuentosVolumen.find((r) => unidades >= r.desde).pct;
