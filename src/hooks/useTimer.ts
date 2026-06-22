/**
 * useTimer.ts
 *
 * Propósito: Encapsular la lógica de doble cronómetro (general + ciclo) con
 * precisión basada en performance.now() y actualización periódica de UI.
 *
 * Responsabilidades:
 * - Gestionar el ciclo de vida de la sesión (inicio, pausa, reanudación, registro de ciclos, fin).
 * - Mantener el cronómetro general continuo mientras el de ciclo se reinicia.
 * - Producir registros inmutables para el historial de paletizado.
 *
 * Rol en la arquitectura: Capa de lógica de aplicación (custom hook) que
 * desacopla el dominio temporal de los componentes de presentación.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CycleRecord,
  PendingCycle,
  SessionStatus,
} from '../types/timer.types';

/** Intervalo de refresco de UI; equilibrio entre fluidez y coste de render. */
const TICK_INTERVAL_MS = 50;

/** API pública del hook de cronometraje. */
export interface UseTimerReturn {
  readonly status: SessionStatus;
  readonly generalElapsedMs: number;
  readonly cycleElapsedMs: number;
  readonly cycles: readonly CycleRecord[];
  readonly pendingCycle: PendingCycle | null;
  readonly startSession: () => void;
  readonly pauseSession: () => void;
  readonly resumeSession: () => void;
  readonly registerCycle: () => void;
  readonly submitCycleBoxes: (boxCount: number) => void;
  readonly endSession: () => void;
  readonly isSessionActive: boolean;
  readonly isPaused: boolean;
}

/**
 * Calcula el tiempo transcurrido desde un punto de anclaje de alta resolución.
 * Combina offset acumulado (tras reinicios parciales) con el delta actual.
 */
function computeElapsed(
  anchorMs: number | null,
  offsetMs: number,
): number {
  if (anchorMs === null) {
    return offsetMs;
  }
  return offsetMs + (performance.now() - anchorMs);
}

export function useTimer(): UseTimerReturn {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [generalElapsedMs, setGeneralElapsedMs] = useState(0);
  const [cycleElapsedMs, setCycleElapsedMs] = useState(0);
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [pendingCycle, setPendingCycle] = useState<PendingCycle | null>(null);

  // Referencias mutables para anclajes temporales sin provocar re-renders.
  const sessionAnchorRef = useRef<number | null>(null);
  const cycleAnchorRef = useRef<number | null>(null);
  const generalOffsetRef = useRef(0);
  const cycleOffsetRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Inicia una nueva sesión: ambos cronómetros arrancan desde cero
   * usando el mismo instante de performance.now() como referencia común.
   */
  const startSession = useCallback((): void => {
    const now = performance.now();

    sessionAnchorRef.current = now;
    cycleAnchorRef.current = now;
    generalOffsetRef.current = 0;
    cycleOffsetRef.current = 0;

    setGeneralElapsedMs(0);
    setCycleElapsedMs(0);
    setCycles([]);
    setPendingCycle(null);
    setStatus('running');
  }, []);

  /**
   * Pausa ambos cronómetros sin finalizar la sesión.
   * Materializa el tiempo transcurrido en offsets para congelar la visualización.
   */
  const pauseSession = useCallback((): void => {
    if (status !== 'running') {
      return;
    }

    if (sessionAnchorRef.current === null || cycleAnchorRef.current === null) {
      return;
    }

    generalOffsetRef.current = computeElapsed(
      sessionAnchorRef.current,
      generalOffsetRef.current,
    );
    cycleOffsetRef.current = computeElapsed(
      cycleAnchorRef.current,
      cycleOffsetRef.current,
    );

    sessionAnchorRef.current = null;
    cycleAnchorRef.current = null;

    setGeneralElapsedMs(generalOffsetRef.current);
    setCycleElapsedMs(cycleOffsetRef.current);
    setStatus('paused');
  }, [status]);

  /**
   * Reanuda la sesión desde el tiempo acumulado en offsets,
   * estableciendo nuevos anclajes temporales sin reiniciar contadores.
   */
  const resumeSession = useCallback((): void => {
    if (status !== 'paused') {
      return;
    }

    const now = performance.now();
    sessionAnchorRef.current = now;
    cycleAnchorRef.current = now;
    setStatus('running');
  }, [status]);

  /**
   * Congela el ciclo actual, reinicia el cronómetro de ciclo de inmediato
   * (sin pausar el general) y abre el flujo de captura de cajas paletizadas.
   */
  const registerCycle = useCallback((): void => {
    if (status !== 'running') {
      return;
    }

    if (pendingCycle !== null) {
      // Evita solapar registros: el operario debe confirmar cajas antes del siguiente ciclo.
      return;
    }

    if (sessionAnchorRef.current === null || cycleAnchorRef.current === null) {
      return;
    }

    const now = performance.now();

    // Captura instantánea de ambos contadores en el momento exacto del registro.
    const frozenCycleMs = computeElapsed(cycleAnchorRef.current, cycleOffsetRef.current);
    const frozenGeneralMs = computeElapsed(
      sessionAnchorRef.current,
      generalOffsetRef.current,
    );

    // Reinicio inmediato del ciclo: nuevo anclaje sin detener el flujo temporal global.
    cycleAnchorRef.current = now;
    cycleOffsetRef.current = 0;
    setCycleElapsedMs(0);

    const nextCycleNumber = cycles.length + 1;

    setPendingCycle({
      cycleNumber: nextCycleNumber,
      cycleTimeMs: frozenCycleMs,
      generalTimeMs: frozenGeneralMs,
    });
  }, [status, pendingCycle, cycles.length]);

  /**
   * Confirma el ciclo pendiente incorporando la cantidad de cajas al historial.
   */
  const submitCycleBoxes = useCallback(
    (boxCount: number): void => {
      if (pendingCycle === null) {
        return;
      }

      if (!Number.isFinite(boxCount) || boxCount < 0) {
        return;
      }

      const completedCycle: CycleRecord = {
        cycleNumber: pendingCycle.cycleNumber,
        cycleTimeMs: pendingCycle.cycleTimeMs,
        boxCount: Math.floor(boxCount),
        generalTimeMs: pendingCycle.generalTimeMs,
      };

      setCycles((previous) => [...previous, completedCycle]);
      setPendingCycle(null);
    },
    [pendingCycle],
  );

  /**
   * Finaliza la sesión de forma definitiva, congelando ambos contadores
   * y descartando cualquier ciclo pendiente sin confirmar.
   */
  const endSession = useCallback((): void => {
    if (status !== 'running' && status !== 'paused') {
      return;
    }

    // Si está en marcha, materializa el tiempo antes de cerrar los anclajes.
    if (
      status === 'running' &&
      sessionAnchorRef.current !== null &&
      cycleAnchorRef.current !== null
    ) {
      generalOffsetRef.current = computeElapsed(
        sessionAnchorRef.current,
        generalOffsetRef.current,
      );
      cycleOffsetRef.current = computeElapsed(
        cycleAnchorRef.current,
        cycleOffsetRef.current,
      );
    }

    sessionAnchorRef.current = null;
    cycleAnchorRef.current = null;

    setGeneralElapsedMs(generalOffsetRef.current);
    setCycleElapsedMs(cycleOffsetRef.current);
    setPendingCycle(null);
    setStatus('finished');
  }, [status]);

  /**
   * Bucle de actualización de UI mientras la sesión está activa.
   * Lee performance.now() en cada tick para minimizar deriva acumulada.
   */
  useEffect(() => {
    if (status !== 'running') {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setGeneralElapsedMs(
        computeElapsed(sessionAnchorRef.current, generalOffsetRef.current),
      );
      setCycleElapsedMs(
        computeElapsed(cycleAnchorRef.current, cycleOffsetRef.current),
      );
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  const isSessionActive = status === 'running' || status === 'paused';
  const isPaused = status === 'paused';

  return {
    status,
    generalElapsedMs,
    cycleElapsedMs,
    cycles,
    pendingCycle,
    startSession,
    pauseSession,
    resumeSession,
    registerCycle,
    submitCycleBoxes,
    endSession,
    isSessionActive,
    isPaused,
  };
}
