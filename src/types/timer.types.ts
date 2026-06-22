/**
 * timer.types.ts
 *
 * Propósito: Centralizar las definiciones de tipos e interfaces del dominio
 * del cronómetro de paletizado.
 *
 * Responsabilidades:
 * - Describir el estado de la sesión de medición (idle, running, paused, finished).
 * - Modelar un ciclo registrado y un ciclo pendiente de confirmación de cajas.
 * - Garantizar tipado estricto en toda la aplicación sin uso de `any`.
 *
 * Rol en la arquitectura: Capa de dominio / contratos de datos compartidos
 * entre hooks, componentes y utilidades.
 */

/** Estados posibles de una sesión de medición industrial. */
export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished';

/**
 * Registro inmutable de un ciclo completado, incluido en el historial final.
 * Cada entrada captura el instante exacto de la línea de tiempo general.
 */
export interface CycleRecord {
  /** Número secuencial del ciclo dentro de la sesión (base 1). */
  readonly cycleNumber: number;
  /** Duración del ciclo en milisegundos, congelada al pulsar "Registrar Ciclo". */
  readonly cycleTimeMs: number;
  /** Cantidad de cajas paletizadas introducidas por el operario. */
  readonly boxCount: number;
  /** Tiempo general acumulado en el momento del registro del ciclo. */
  readonly generalTimeMs: number;
}

/**
 * Ciclo con tiempo ya congelado pero pendiente de introducir la cantidad de cajas.
 * Existe entre "Registrar Ciclo" y la confirmación del operario.
 */
export interface PendingCycle {
  readonly cycleNumber: number;
  readonly cycleTimeMs: number;
  readonly generalTimeMs: number;
}

/**
 * Instantánea de los valores visibles de los cronómetros.
 * Usada por componentes de presentación desacoplados de la lógica del hook.
 */
export interface TimerDisplayValues {
  readonly generalElapsedMs: number;
  readonly cycleElapsedMs: number;
}

/**
 * Resumen agregado mostrado al finalizar una sesión de medición.
 * Consolida tiempo total, cantidad de ciclos y cajas paletizadas.
 */
export interface SessionSummary {
  readonly totalSessionTimeMs: number;
  readonly totalCycles: number;
  readonly totalBoxes: number;
}

/**
 * Sesión de cronometraje persistida en el almacenamiento local de la PWA.
 * Incluye historial de ciclos y resumen al momento de guardar.
 */
export interface SavedSession {
  readonly id: string;
  /** Número secuencial global de la sesión guardada (base 1). */
  readonly sessionNumber: number;
  /** Nombre visible: personalizado o "Sesión #N" por defecto. */
  readonly name: string;
  readonly savedAt: string;
  readonly cycles: readonly CycleRecord[];
  readonly summary: SessionSummary;
}

/** Datos necesarios para persistir una sesión recién finalizada. */
export interface SaveSessionPayload {
  readonly customName: string;
  readonly cycles: readonly CycleRecord[];
  readonly totalSessionTimeMs: number;
}
