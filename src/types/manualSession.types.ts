/**
 * manualSession.types.ts
 *
 * Propósito: Tipos del dominio para construcción manual de sesiones guardadas.
 *
 * Responsabilidades:
 * - Modelar borradores editables de ciclos antes de persistir.
 * - Describir resultados de validación del formulario manual.
 *
 * Rol en la arquitectura: Contratos compartidos entre utilidades y UI de sesión manual.
 */

/** Borrador editable de un ciclo dentro del formulario manual. */
export interface ManualCycleDraft {
  readonly id: string;
  readonly cycleTimeInput: string;
  readonly boxCountInput: string;
}

/** Totales en vivo calculados desde los borradores de ciclos. */
export interface ManualSessionTotals {
  readonly totalSessionTimeMs: number;
  readonly totalCycles: number;
  readonly totalBoxes: number;
}

/** Error de validación asociado a un campo de un ciclo. */
export interface ManualCycleFieldErrors {
  readonly cycleTime?: string;
  readonly boxCount?: string;
}

/** Resultado de validar un formulario de sesión manual. */
export interface ManualSessionValidation {
  readonly isValid: boolean;
  readonly globalError: string | null;
  readonly cycleErrors: Readonly<Record<string, ManualCycleFieldErrors>>;
}
