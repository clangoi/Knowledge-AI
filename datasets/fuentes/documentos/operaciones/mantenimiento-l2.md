---
id: op-mantenimiento-l2
titulo: Procedimiento de mantenimiento preventivo - Línea 2 (mecanizado CNC)
archivo: Procedimiento de mantenimiento L2
formato: pdf
area: operaciones
codigo: PRO-OP-022
version: 3.2
vigencia: 2026-07-15
responsable: Jorge Paz
clasificacion: Interna
---

# Procedimiento de mantenimiento preventivo - Línea 2 (mecanizado CNC)

## Objetivo y alcance

Definir las rutinas de mantenimiento preventivo de los equipos de la Línea 2 de Planta Norte, donde se mecanizan carcasas, impulsores y ejes de las bombas NX. Aplica a los tornos CNC T-201 y T-202 y a los centros de mecanizado CM-203 y CM-204.

## Responsabilidades

- **Jefe de Mantenimiento, Planta Norte:** programa las rutinas en el CMMS y verifica su cumplimiento.
- **Técnico de mantenimiento:** ejecuta las rutinas y registra los resultados.
- **Operador CNC:** realiza las actividades diarias de primer nivel y reporta anomalías.
- **Supervisor de producción:** libera el equipo para las rutinas programadas.

## Condiciones de seguridad

Antes de cualquier intervención distinta a la inspección visual, el técnico debe aplicar el procedimiento de **bloqueo y etiquetado (LOTO)** descrito en el Manual de seguridad industrial, verificar la ausencia de energía (eléctrica, neumática e hidráulica) y esperar a que el husillo se detenga por completo. Queda prohibido operar el equipo con las guardas retiradas.

## Rutinas de mantenimiento

### Diaria (operador, inicio de cada turno)

- Limpiar viruta de la bancada y del transportador de viruta.
- Verificar el nivel de aceite de guías y de refrigerante.
- Verificar que la presión neumática sea de **6 bar ± 0.5**.
- Revisar que las puertas y los interruptores de seguridad funcionen.

### Semanal (técnico)

- Lubricar guías y husillos de bolas conforme a la carta de lubricación.
- Revisar fugas en mangueras hidráulicas y de refrigerante.
- Limpiar los filtros del gabinete eléctrico.

### Mensual (técnico)

- Cambiar el **filtro de refrigerante de 25 µm**.
- Medir la concentración del refrigerante (meta: 6% a 8%).
- Verificar el juego (backlash) de los ejes X y Z; tolerancia máxima de 0.01 mm.
- Revisar el estado de la correa del husillo y ajustar la tensión.

### Trimestral (técnico)

- Medir la vibración del husillo; el valor máximo permitido es **4.5 mm/s**.
- Verificar la temperatura del husillo en operación continua; no debe superar **65 °C**.
- Revisar la alineación del husillo y la torreta.
- Cambiar el aceite hidráulico si el análisis lo indica.

### Anual (técnico con apoyo del proveedor externo)

- Overhaul del husillo: cambio de rodamientos (par 7014) si la vibración o la temperatura superan los límites.
- Calibración geométrica con interferómetro láser.
- Revisión completa del sistema eléctrico y del variador.

## Criterios para detener el equipo

El técnico debe detener el equipo y abrir una orden correctiva de prioridad **Crítica** si detecta cualquiera de las siguientes condiciones:

- Vibración del husillo superior a 7.1 mm/s.
- Temperatura del husillo superior a 75 °C.
- Fuga hidráulica activa o derrame de refrigerante.
- Falla de un interruptor de seguridad.

## Refacciones críticas

El almacén de Planta Norte debe mantener existencias mínimas de las refacciones críticas de la Línea 2: rodamientos de husillo 7014 (par), filtros de refrigerante de 25 µm, correas dentadas HTD 8M-1200, aceite para guías ISO VG 68 e insertos de torneado CNMG 120408. Cuando el stock baje del mínimo, el técnico debe notificarlo al Jefe de Mantenimiento para generar la solicitud de compra.

## Registro

Cada rutina se registra en el CMMS (MantenPro) como una orden de trabajo **Preventiva**, con las mediciones tomadas. Las rutinas no registradas se consideran no realizadas para el indicador de cumplimiento.

## Historial de cambios

- Versión 3.2 (julio 2026): se incorporan los límites de vibración y temperatura revisados tras el overhaul de la Línea 2 realizado en el segundo trimestre.
- Versión 3.1 (enero 2026): se agrega el centro de mecanizado CM-204.
