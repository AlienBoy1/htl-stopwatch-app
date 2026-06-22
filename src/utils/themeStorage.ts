/**
 * themeStorage.ts
 *
 * Propósito: Funciones puras para leer y validar la preferencia de tema persistida.
 *
 * Responsabilidades:
 * - Acceder a localStorage de forma segura ante entornos restringidos.
 * - Validar que el valor almacenado sea un ColorScheme válido.
 *
 * Rol en la arquitectura: Utilidad de persistencia del dominio visual.
 */

import {
  DEFAULT_COLOR_SCHEME,
  THEME_STORAGE_KEY,
} from '../constants/theme';
import type { ColorScheme } from '../types/theme.types';

/** Comprueba si una cadena corresponde a un esquema de color válido. */
function isColorScheme(value: string): value is ColorScheme {
  return value === 'light' || value === 'dark';
}

/**
 * Lee el tema guardado o devuelve el esquema por defecto.
 * Usado en el arranque síncrono (index.html) y en React.
 */
export function getStoredColorScheme(): ColorScheme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored !== null && isColorScheme(stored)) {
      return stored;
    }
  } catch {
    // localStorage puede fallar en modo privado o iframes restringidos.
  }

  return DEFAULT_COLOR_SCHEME;
}

/**
 * Persiste la preferencia de tema del usuario en localStorage.
 */
export function saveColorScheme(scheme: ColorScheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, scheme);
  } catch {
    // Ignorar fallos de escritura; el tema en memoria sigue activo en la sesión.
  }
}
