/**
 * sessionCycleStats.ts
 *
 * Propósito: Calcular métricas estadísticas de los ciclos de una sesión guardada.
 *
 * Responsabilidades:
 * - Obtener promedios, moda, mínimo y máximo de cajas y tiempos de ciclo.
 * - Calcular el rendimiento agregado en cajas por minuto.
 *
 * Rol en la arquitectura: Utilidad pura de dominio reutilizable en PDF y UI.
 */

import type { CycleRecord } from '../types/timer.types';

/** Métricas descriptivas derivadas del historial de ciclos. */
export interface SessionCycleStats {
  readonly boxesPerMinute: number;
  readonly boxesPerCycleAvg: number;
  readonly boxesMode: number | null;
  readonly boxesMin: number | null;
  readonly boxesMax: number | null;
  readonly cycleTimeModeMs: number | null;
  readonly cycleTimeMinMs: number | null;
  readonly cycleTimeMaxMs: number | null;
  readonly cycleTimeAvgMs: number;
}

/**
 * Obtiene la moda de un arreglo de enteros.
 * Ante empate, devuelve el valor más frecuente de menor magnitud.
 */
function modeOfIntegers(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const frequencies = new Map<number, number>();

  for (const value of values) {
    frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
  }

  let bestValue = values[0] ?? null;
  let bestCount = 0;

  for (const [value, count] of frequencies) {
    if (
      count > bestCount ||
      (count === bestCount && bestValue !== null && value < bestValue)
    ) {
      bestValue = value;
      bestCount = count;
    }
  }

  return bestValue;
}

/**
 * Moda de tiempos de ciclo redondeados al segundo para agrupar mediciones similares.
 */
function modeOfCycleTimesMs(cycleTimesMs: readonly number[]): number | null {
  if (cycleTimesMs.length === 0) {
    return null;
  }

  const roundedSeconds = cycleTimesMs.map((ms) => Math.round(ms / 1_000));
  const modeSeconds = modeOfIntegers(roundedSeconds);

  return modeSeconds === null ? null : modeSeconds * 1_000;
}

/**
 * Construye estadísticas descriptivas a partir del historial y tiempo total de sesión.
 */
export function buildSessionCycleStats(
  cycles: readonly CycleRecord[],
  totalSessionTimeMs: number,
): SessionCycleStats {
  const totalCycles = cycles.length;
  const boxCounts = cycles.map((cycle) => cycle.boxCount);
  const cycleTimesMs = cycles.map((cycle) => cycle.cycleTimeMs);
  const totalBoxes = boxCounts.reduce((sum, count) => sum + count, 0);

  const sessionMinutes = Math.max(totalSessionTimeMs, 0) / 60_000;
  const boxesPerMinute =
    sessionMinutes > 0 ? totalBoxes / sessionMinutes : 0;

  const boxesPerCycleAvg = totalCycles > 0 ? totalBoxes / totalCycles : 0;

  const cycleTimeTotalMs = cycleTimesMs.reduce((sum, ms) => sum + ms, 0);
  const cycleTimeAvgMs =
    totalCycles > 0 ? Math.floor(cycleTimeTotalMs / totalCycles) : 0;

  return {
    boxesPerMinute,
    boxesPerCycleAvg,
    boxesMode: modeOfIntegers(boxCounts),
    boxesMin: totalCycles > 0 ? Math.min(...boxCounts) : null,
    boxesMax: totalCycles > 0 ? Math.max(...boxCounts) : null,
    cycleTimeModeMs: modeOfCycleTimesMs(cycleTimesMs),
    cycleTimeMinMs: totalCycles > 0 ? Math.min(...cycleTimesMs) : null,
    cycleTimeMaxMs: totalCycles > 0 ? Math.max(...cycleTimesMs) : null,
    cycleTimeAvgMs,
  };
}

/** Formatea cajas por minuto con dos decimales. */
export function formatBoxesPerMinute(value: number): string {
  return value.toFixed(2);
}

/** Formatea promedio de cajas por ciclo con un decimal. */
export function formatBoxesPerCycleAvg(value: number): string {
  return value.toFixed(1);
}
