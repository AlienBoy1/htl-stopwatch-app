/**
 * manualSessionBuilder.ts
 *
 * Propósito: Construir y validar sesiones registradas manualmente por el operario.
 *
 * Responsabilidades:
 * - Parsear tiempos de ciclo en formato MM:SS.cc hacia milisegundos.
 * - Convertir borradores en CycleRecord con tiempo general acumulado.
 * - Validar formularios antes de persistir.
 *
 * Rol en la arquitectura: Utilidad pura de dominio para sesiones manuales.
 */

import type { CycleRecord } from '../types/timer.types';
import type {
  ManualCycleDraft,
  ManualCycleFieldErrors,
  ManualSessionTotals,
  ManualSessionValidation,
} from '../types/manualSession.types';

/** Crea un borrador vacío con identificador único. */
export function createManualCycleDraft(): ManualCycleDraft {
  return {
    id: crypto.randomUUID(),
    cycleTimeInput: '',
    boxCountInput: '',
  };
}

/**
 * Convierte una cadena de tiempo (MM:SS.cc, MM:SS o HH:MM:SS.cc) a milisegundos.
 */
export function parseCycleTimeInputToMs(input: string): number | null {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const withHours = /^(\d+):(\d{2}):(\d{2})(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (withHours !== null) {
    const hours = Number(withHours[1]);
    const minutes = Number(withHours[2]);
    const seconds = Number(withHours[3]);
    const centiseconds = Number((withHours[4] ?? '0').padEnd(2, '0'));

    if (minutes > 59 || seconds > 59 || centiseconds > 99) {
      return null;
    }

    return (
      hours * 3_600_000 +
      minutes * 60_000 +
      seconds * 1_000 +
      centiseconds * 10
    );
  }

  const minutesSeconds = /^(\d+):(\d{2})(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (minutesSeconds !== null) {
    const minutes = Number(minutesSeconds[1]);
    const seconds = Number(minutesSeconds[2]);
    const centiseconds = Number((minutesSeconds[3] ?? '0').padEnd(2, '0'));

    if (seconds > 59 || centiseconds > 99) {
      return null;
    }

    return minutes * 60_000 + seconds * 1_000 + centiseconds * 10;
  }

  return null;
}

/** Interpreta la cantidad de cajas introducida manualmente. */
export function parseBoxCountInput(input: string): number | null {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const value = Number.parseInt(trimmed, 10);

  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}

/** Calcula totales en vivo a partir de los borradores editables. */
export function computeManualSessionTotals(
  drafts: readonly ManualCycleDraft[],
): ManualSessionTotals {
  let totalSessionTimeMs = 0;
  let totalBoxes = 0;

  for (const draft of drafts) {
    const cycleTimeMs = parseCycleTimeInputToMs(draft.cycleTimeInput);
    const boxCount = parseBoxCountInput(draft.boxCountInput);

    if (cycleTimeMs !== null) {
      totalSessionTimeMs += cycleTimeMs;
    }

    if (boxCount !== null) {
      totalBoxes += boxCount;
    }
  }

  return {
    totalSessionTimeMs,
    totalCycles: drafts.length,
    totalBoxes,
  };
}

/**
 * Valida los borradores antes de guardar la sesión manual.
 */
export function validateManualSessionDrafts(
  drafts: readonly ManualCycleDraft[],
): ManualSessionValidation {
  if (drafts.length === 0) {
    return {
      isValid: false,
      globalError: 'Agrega al menos un ciclo para guardar la sesión.',
      cycleErrors: {},
    };
  }

  const cycleErrors: Record<string, ManualCycleFieldErrors> = {};
  let hasFieldErrors = false;

  for (const draft of drafts) {
    const cycleTimeMs = parseCycleTimeInputToMs(draft.cycleTimeInput);
    const boxCount = parseBoxCountInput(draft.boxCountInput);
    const fieldErrors: ManualCycleFieldErrors = {
      ...(cycleTimeMs === null || cycleTimeMs <= 0
        ? { cycleTime: 'Introduce un tiempo válido (ej. 02:35.40).' }
        : {}),
      ...(boxCount === null
        ? { boxCount: 'Introduce un número entero de cajas (0 o más).' }
        : {}),
    };

    if (fieldErrors.cycleTime !== undefined || fieldErrors.boxCount !== undefined) {
      cycleErrors[draft.id] = fieldErrors;
      hasFieldErrors = true;
    }
  }

  if (hasFieldErrors) {
    return {
      isValid: false,
      globalError: 'Revisa los campos marcados antes de guardar.',
      cycleErrors,
    };
  }

  return {
    isValid: true,
    globalError: null,
    cycleErrors,
  };
}

/**
 * Convierte borradores validados en registros de ciclo con tiempo general acumulado.
 */
export function buildCycleRecordsFromDrafts(
  drafts: readonly ManualCycleDraft[],
): CycleRecord[] {
  let cumulativeTimeMs = 0;

  return drafts.map((draft, index) => {
    const cycleTimeMs = parseCycleTimeInputToMs(draft.cycleTimeInput) ?? 0;
    const boxCount = parseBoxCountInput(draft.boxCountInput) ?? 0;
    cumulativeTimeMs += cycleTimeMs;

    return {
      cycleNumber: index + 1,
      cycleTimeMs,
      boxCount,
      generalTimeMs: cumulativeTimeMs,
    };
  });
}
