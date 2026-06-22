/**
 * theme.ts
 *
 * Propósito: Centralizar constantes del sistema de tema claro/oscuro.
 *
 * Responsabilidades:
 * - Definir la clave de persistencia en localStorage.
 * - Exponer colores de meta theme-color y fondo PWA por esquema.
 *
 * Rol en la arquitectura: Constantes compartidas entre hook, provider y HTML.
 */

import type { ColorScheme } from '../types/theme.types';

/** Clave de almacenamiento local para la preferencia de tema del usuario. */
export const THEME_STORAGE_KEY = 'htl-stopwatch-color-scheme';

/** Esquema por defecto al primer arranque sin preferencia guardada. */
export const DEFAULT_COLOR_SCHEME: ColorScheme = 'dark';

/** Metadatos de color por esquema para barra del navegador y splash PWA. */
export const THEME_META_COLORS: Record<
  ColorScheme,
  { readonly themeColor: string; readonly backgroundColor: string }
> = {
  light: {
    themeColor: '#fafafa',
    backgroundColor: '#fafafa',
  },
  dark: {
    themeColor: '#09090b',
    backgroundColor: '#09090b',
  },
};
