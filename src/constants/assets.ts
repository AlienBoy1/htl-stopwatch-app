/**
 * assets.ts
 *
 * Propósito: Centralizar rutas públicas de assets estáticos de la aplicación.
 *
 * Responsabilidades:
 * - Exponer la ruta del icono corporativo HTL StopWatch.
 * - Evitar cadenas mágicas dispersas en componentes y configuración.
 *
 * Rol en la arquitectura: Capa de constantes compartidas para UI y branding.
 */

/** Ruta pública del logo principal ubicado en public/icons. */
export const HTL_STOPWATCH_ICON_PATH = '/icons/htl_stopwatch_icon.png';

/** Icono PWA de alta resolución (mismo asset corporativo). */
export const HTL_STOPWATCH_PWA_ICON_PATH = HTL_STOPWATCH_ICON_PATH;

/** Texto alternativo accesible para el logo HTL StopWatch. */
export const HTL_STOPWATCH_ICON_ALT = 'Logo HTL StopWatch';
