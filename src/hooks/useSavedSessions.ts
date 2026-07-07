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
import { resolveSessionName, normalizeRenamedSessionName } from '../utils/sessionNaming';
import { buildSessionSummary } from '../utils/sessionSummary';

/** Duración mínima visible del estado de guardado al renombrar (feedback UX). */
const RENAME_FEEDBACK_MS = 380;

/** Duración mínima visible del guardado de sesión manual (feedback UX). */
const MANUAL_SAVE_FEEDBACK_MS = 480;

export interface UseSavedSessionsReturn {
  readonly savedSessions: readonly SavedSession[];
  readonly saveSession: (payload: SaveSessionPayload) => SavedSession;
  readonly saveManualSession: (payload: SaveSessionPayload) => Promise<SavedSession>;
  readonly renameSession: (sessionId: string, customName: string) => Promise<void>;
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
   * Persiste una sesión creada manualmente con el mismo formato que una medida en vivo.
   */
  const saveManualSession = useCallback(
    async (payload: SaveSessionPayload): Promise<SavedSession> => {
      const saved = saveSession(payload);

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, MANUAL_SAVE_FEEDBACK_MS);
      });

      return saved;
    },
    [saveSession],
  );

  /**
   * Renombra una sesión persistida conservando su número secuencial original.
   */
  const renameSession = useCallback(
    async (sessionId: string, customName: string): Promise<void> => {
      const session = savedSessions.find((item) => item.id === sessionId);

      if (session === undefined) {
        throw new Error('SESSION_NOT_FOUND');
      }

      const nextName = normalizeRenamedSessionName(
        customName,
        session.sessionNumber,
      );

      if (nextName !== session.name) {
        const updatedSessions = savedSessions.map((item) =>
          item.id === sessionId ? { ...item, name: nextName } : item,
        );

        setSavedSessions(updatedSessions);
        persistSavedSessions(updatedSessions);
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, RENAME_FEEDBACK_MS);
      });
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
    saveManualSession,
    renameSession,
    deleteSession,
    deleteAllSessions,
  };
}
