/**
 * sessionSummary.ts
 *
 * Propósito: Calcular totales agregados de una sesión de paletizado finalizada.
 *
 * Responsabilidades:
 * - Sumar ciclos y cajas registradas en el historial.
 * - Combinar el tiempo general final con los contadores de ciclos y cajas.
 *
 * Rol en la arquitectura: Utilidad pura de dominio para el resumen de sesión.
 */

import type { CycleRecord, SessionSummary } from '../types/timer.types';

/**
 * Construye el resumen de sesión a partir del historial y el tiempo general final.
 *
 * @param cycles - Ciclos completados con cajas confirmadas.
 * @param totalSessionTimeMs - Tiempo total del cronómetro general al finalizar.
 */
export function buildSessionSummary(
  cycles: readonly CycleRecord[],
  totalSessionTimeMs: number,
): SessionSummary {
  const totalCycles = cycles.length;
  const totalBoxes = cycles.reduce(
    (accumulator, cycle) => accumulator + cycle.boxCount,
    0,
  );

  return {
    totalSessionTimeMs: Math.max(0, Math.floor(totalSessionTimeMs)),
    totalCycles,
    totalBoxes,
  };
}
