/**
 * theme.types.ts
 *
 * Propósito: Definir tipos del sistema de apariencia claro/oscuro de la PWA.
 *
 * Responsabilidades:
 * - Describir los esquemas de color soportados por la aplicación.
 * - Tipar el contrato del contexto de tema compartido en la UI.
 *
 * Rol en la arquitectura: Capa de dominio visual / contratos de tema.
 */

/** Esquemas de color disponibles en la interfaz. */
export type ColorScheme = 'light' | 'dark';

/** Valor expuesto por el proveedor de tema a toda la aplicación. */
export interface ThemeContextValue {
  readonly colorScheme: ColorScheme;
  readonly setColorScheme: (scheme: ColorScheme) => void;
  readonly toggleColorScheme: () => void;
  readonly isDark: boolean;
}
