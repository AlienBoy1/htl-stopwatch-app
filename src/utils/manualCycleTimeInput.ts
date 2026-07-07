/**
 * manualCycleTimeInput.ts
 *
 * Propósito: Formatear y componer tiempos de ciclo en sesiones manuales.
 *
 * Responsabilidades:
 * - Mantener la plantilla MM:SS.CS (minutos, segundos, centésimas).
 * - Dividir y unir segmentos para entradas táctiles separadas.
 *
 * Rol en la arquitectura: Utilidad pura para el formulario de sesión manual.
 */

/** Valor inicial con formato listo para editar. */
export const MANUAL_CYCLE_TIME_DEFAULT = '00:00.00';

/** Etiquetas del formato mostradas en la UI. */
export const MANUAL_CYCLE_TIME_SEGMENTS = ['Min', 'Seg', 'Cs'] as const;

/** Partes editables de un tiempo de ciclo manual. */
export interface ManualCycleTimeParts {
  readonly minutes: string;
  readonly seconds: string;
  readonly centiseconds: string;
}

/**
 * Separa una cadena MM:SS.CS en sus tres segmentos editables.
 */
export function splitCycleTimeInput(input: string): ManualCycleTimeParts {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { minutes: '00', seconds: '00', centiseconds: '00' };
  }

  const match = /^(\d+):(\d{1,2})(?:\.(\d{1,2}))?$/.exec(trimmed);

  if (match === null) {
    return { minutes: '00', seconds: '00', centiseconds: '00' };
  }

  return {
    minutes: match[1] ?? '0',
    seconds: (match[2] ?? '0').padStart(2, '0'),
    centiseconds: (match[3] ?? '0').padStart(2, '0'),
  };
}

/** Limita un segmento numérico a dígitos y longitud máxima. */
function clampDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

/** Normaliza segundos (0–59) y centésimas (0–99) al componer el valor. */
function normalizeBoundedSegment(value: string, maxValue: number): string {
  const digits = clampDigits(value, 2);
  const numeric = Number.parseInt(digits.length > 0 ? digits : '0', 10);

  if (!Number.isFinite(numeric)) {
    return '00';
  }

  return Math.min(maxValue, Math.max(0, numeric)).toString().padStart(2, '0');
}

/**
 * Compone la cadena MM:SS.CS a partir de los tres segmentos del formulario.
 */
export function joinCycleTimeParts(parts: ManualCycleTimeParts): string {
  const minutes = clampDigits(parts.minutes, 3);
  const safeMinutes = minutes.length > 0 ? minutes : '0';
  const seconds = normalizeBoundedSegment(parts.seconds, 59);
  const centiseconds = normalizeBoundedSegment(parts.centiseconds, 99);

  return `${safeMinutes}:${seconds}.${centiseconds}`;
}

/**
 * Actualiza un segmento y devuelve la cadena de tiempo completa formateada.
 */
export function updateCycleTimePart(
  currentInput: string,
  segment: keyof ManualCycleTimeParts,
  nextValue: string,
): string {
  const parts = splitCycleTimeInput(currentInput);

  const updatedParts: ManualCycleTimeParts = {
    minutes:
      segment === 'minutes' ? clampDigits(nextValue, 3) : parts.minutes,
    seconds:
      segment === 'seconds' ? clampDigits(nextValue, 2) : parts.seconds,
    centiseconds:
      segment === 'centiseconds'
        ? clampDigits(nextValue, 2)
        : parts.centiseconds,
  };

  return joinCycleTimeParts(updatedParts);
}
