/**
 * sessionNaming.ts
 *
 * Propósito: Resolver el nombre visible de una sesión al guardarla.
 *
 * Responsabilidades:
 * - Aplicar nombre personalizado si el operario lo introduce.
 * - Generar "Sesión #N" cuando el campo queda vacío, según el total guardado.
 *
 * Rol en la arquitectura: Utilidad pura de dominio para nomenclatura de sesiones.
 */

/**
 * Determina el nombre final de una sesión a guardar.
 *
 * @param customName - Texto introducido por el usuario (puede estar vacío).
 * @param existingSessionCount - Cantidad de sesiones ya persistidas en la app.
 * @returns Nombre personalizado o "Sesión #N" con N = existingSessionCount + 1.
 */
export function resolveSessionName(
  customName: string,
  existingSessionCount: number,
): string {
  const trimmed = customName.trim();

  if (trimmed.length > 0) {
    return trimmed;
  }

  return `Sesión #${existingSessionCount + 1}`;
}
