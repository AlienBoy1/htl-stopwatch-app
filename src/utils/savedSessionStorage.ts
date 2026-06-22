/**
 * savedSessionStorage.ts
 *
 * Propósito: Persistir y recuperar sesiones guardadas desde localStorage.
 *
 * Responsabilidades:
 * - Serializar y deserializar el listado de SavedSession.
 * - Validar la estructura de datos al leer del almacenamiento local.
 *
 * Rol en la arquitectura: Capa de persistencia cliente sin efectos en React.
 */

import { SAVED_SESSIONS_STORAGE_KEY } from '../constants/storage';
import type { CycleRecord, SavedSession, SessionSummary } from '../types/timer.types';

/** Comprueba si un valor es un objeto no nulo. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Valida un registro de ciclo almacenado. */
function isCycleRecord(value: unknown): value is CycleRecord {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.cycleNumber === 'number' &&
    typeof value.cycleTimeMs === 'number' &&
    typeof value.boxCount === 'number' &&
    typeof value.generalTimeMs === 'number'
  );
}

/** Valida el resumen agregado de una sesión guardada. */
function isSessionSummary(value: unknown): value is SessionSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.totalSessionTimeMs === 'number' &&
    typeof value.totalCycles === 'number' &&
    typeof value.totalBoxes === 'number'
  );
}

/** Valida una sesión completa leída desde localStorage. */
function isSavedSession(value: unknown): value is SavedSession {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.sessionNumber !== 'number' ||
    typeof value.name !== 'string' ||
    typeof value.savedAt !== 'string' ||
    !Array.isArray(value.cycles) ||
    !isSessionSummary(value.summary)
  ) {
    return false;
  }

  return value.cycles.every(isCycleRecord);
}

/**
 * Carga todas las sesiones guardadas desde localStorage.
 * Devuelve arreglo vacío si no hay datos o la estructura es inválida.
 */
export function loadSavedSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(SAVED_SESSIONS_STORAGE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const sessions = parsed.filter(isSavedSession);
    return sessions.sort((a, b) => a.sessionNumber - b.sessionNumber);
  } catch {
    return [];
  }
}

/**
 * Persiste el listado completo de sesiones en localStorage.
 */
export function persistSavedSessions(sessions: readonly SavedSession[]): void {
  try {
    localStorage.setItem(
      SAVED_SESSIONS_STORAGE_KEY,
      JSON.stringify(sessions),
    );
  } catch {
    // Fallo silencioso: la UI mostrará error si el guardado no se refleja en estado.
  }
}
