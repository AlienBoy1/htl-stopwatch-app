/**
 * useSavedSessions.ts
 *
 * Propósito: Hook para gestionar el ciclo de vida de sesiones persistidas.
 *
 * Responsabilidades:
 * - Cargar sesiones desde localStorage al montar.
 * - Guardar nuevas sesiones con numeración y nombre resueltos.
 * - Exponer el listado ordenado para la interfaz.
 * - Eliminar sesiones individuales o el historial completo persistido.
 *
 * Rol en la arquitectura: Capa de lógica de aplicación para persistencia de sesiones.
 */

import { useCallback, useState } from 'react';
import type { SaveSessionPayload, SavedSession } from '../types/timer.types';
import {
  loadSavedSessions,
  persistSavedSessions,
} from '../utils/savedSessionStorage';
import { resolveSessionName } from '../utils/sessionNaming';
import { buildSessionSummary } from '../utils/sessionSummary';

export interface UseSavedSessionsReturn {
  readonly savedSessions: readonly SavedSession[];
  readonly saveSession: (payload: SaveSessionPayload) => SavedSession;
  readonly deleteSession: (sessionId: string) => void;
  readonly deleteAllSessions: () => void;
}

export function useSavedSessions(): UseSavedSessionsReturn {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(
    loadSavedSessions,
  );

  /**
   * Persiste una sesión finalizada asignando número secuencial y nombre resuelto.
   */
  const saveSession = useCallback(
    (payload: SaveSessionPayload): SavedSession => {
      const sessionNumber = savedSessions.length + 1;
      const name = resolveSessionName(
        payload.customName,
        savedSessions.length,
      );

      const newSession: SavedSession = {
        id: crypto.randomUUID(),
        sessionNumber,
        name,
        savedAt: new Date().toISOString(),
        cycles: [...payload.cycles],
        summary: buildSessionSummary(
          payload.cycles,
          payload.totalSessionTimeMs,
        ),
      };

      const updatedSessions = [...savedSessions, newSession];
      setSavedSessions(updatedSessions);
      persistSavedSessions(updatedSessions);

      return newSession;
    },
    [savedSessions],
  );

  /**
   * Elimina una sesión guardada por su identificador único.
   */
  const deleteSession = useCallback(
    (sessionId: string): void => {
      const updatedSessions = savedSessions.filter(
        (session) => session.id !== sessionId,
      );
      setSavedSessions(updatedSessions);
      persistSavedSessions(updatedSessions);
    },
    [savedSessions],
  );

  /**
   * Vacía por completo el historial de sesiones en memoria y localStorage.
   */
  const deleteAllSessions = useCallback((): void => {
    setSavedSessions([]);
    persistSavedSessions([]);
  }, []);

  return {
    savedSessions,
    saveSession,
    deleteSession,
    deleteAllSessions,
  };
}
