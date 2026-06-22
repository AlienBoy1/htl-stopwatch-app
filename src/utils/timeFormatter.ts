/**
 * timeFormatter.ts
 *
 * Propósito: Proveer funciones puras de formateo temporal para la interfaz.
 *
 * Responsabilidades:
 * - Convertir milisegundos a cadenas legibles con precisión de centésimas.
 * - Mantener ancho fijo de caracteres para evitar saltos visuales en contadores.
 *
 * Rol en la arquitectura: Capa de utilidades sin efectos secundarios, consumida
 * por componentes de visualización y tablas de historial.
 */

/** Opciones de precisión para el formateo de tiempo. */
export interface TimeFormatOptions {
  /** Si es true, muestra horas solo cuando el total supera una hora. */
  readonly hideLeadingHours?: boolean;
}

/**
 * Descompone milisegundos en unidades temporales enteras para display.
 * Usa división entera para evitar errores de punto flotante en la UI.
 */
function decomposeMilliseconds(totalMs: number): {
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
} {
  const safeMs = Math.max(0, Math.floor(totalMs));
  const hours = Math.floor(safeMs / 3_600_000);
  const minutes = Math.floor((safeMs % 3_600_000) / 60_000);
  const seconds = Math.floor((safeMs % 60_000) / 1_000);
  const centiseconds = Math.floor((safeMs % 1_000) / 10);

  return { hours, minutes, seconds, centiseconds };
}

/** Asegura que un número de dos dígitos conserve ancho fijo (ej. 09). */
function padTwo(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Formatea milisegundos como HH:MM:SS.cc para contadores monoespaciados.
 *
 * @param milliseconds - Duración en milisegundos (se trunca a entero no negativo).
 * @param options - Configuración opcional de visualización.
 * @returns Cadena con formato fijo apta para `font-mono`.
 */
export function formatElapsedTime(
  milliseconds: number,
  options: TimeFormatOptions = {},
): string {
  const { hours, minutes, seconds, centiseconds } =
    decomposeMilliseconds(milliseconds);

  const { hideLeadingHours = false } = options;

  // Ocultar horas cuando no aportan información reduce ruido en ciclos cortos.
  if (hideLeadingHours && hours === 0) {
    return `${padTwo(minutes)}:${padTwo(seconds)}.${padTwo(centiseconds)}`;
  }

  return `${padTwo(hours)}:${padTwo(minutes)}:${padTwo(seconds)}.${padTwo(centiseconds)}`;
}

/** Partes desglosadas de un tiempo para visualización en bloques digitales. */
export interface TimeParts {
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
  readonly centiseconds: string;
  readonly showHours: boolean;
}

/**
 * Obtiene las partes de tiempo formateadas para renderizado estructurado en UI.
 */
export function getTimeParts(
  milliseconds: number,
  options: TimeFormatOptions = {},
): TimeParts {
  const { hours, minutes, seconds, centiseconds } =
    decomposeMilliseconds(milliseconds);

  const showHours = !options.hideLeadingHours || hours > 0;

  return {
    hours: padTwo(hours),
    minutes: padTwo(minutes),
    seconds: padTwo(seconds),
    centiseconds: padTwo(centiseconds),
    showHours,
  };
}

/**
 * Formateo compacto para celdas de tabla en pantallas pequeñas.
 * Omite las horas si el valor es inferior a 60 minutos.
 */
export function formatTableTime(milliseconds: number): string {
  return formatElapsedTime(milliseconds, { hideLeadingHours: true });
}
