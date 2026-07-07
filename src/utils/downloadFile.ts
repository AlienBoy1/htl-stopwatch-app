/**
 * downloadFile.ts
 *
 * Propósito: Utilidades puras para descargar archivos generados en el cliente.
 *
 * Responsabilidades:
 * - Crear enlaces temporales de descarga y liberar recursos blob.
 *
 * Rol en la arquitectura: Utilidad transversal de exportación de archivos.
 */

/**
 * Descarga un archivo en el navegador mediante un enlace temporal.
 */
export function downloadFile(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
): void {
  const normalizedBytes = new Uint8Array(bytes);
  const blob = new Blob([normalizedBytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.click();

  URL.revokeObjectURL(url);
}

/** Tiempo de retención del blob URL al abrir archivos en una pestaña nueva. */
const BLOB_URL_RETENTION_MS = 120_000;

/**
 * Abre un archivo en una pestaña nueva del navegador (visor PDF integrado).
 *
 * @throws Error con código `POPUP_BLOCKED` si el navegador bloquea la ventana.
 */
export function openFileInBrowser(bytes: Uint8Array, mimeType: string): void {
  const normalizedBytes = new Uint8Array(bytes);
  const blob = new Blob([normalizedBytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');

  if (openedWindow === null) {
    URL.revokeObjectURL(url);
    throw new Error('POPUP_BLOCKED');
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, BLOB_URL_RETENTION_MS);
}
