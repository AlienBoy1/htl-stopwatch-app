/**
 * pdfDrawing.ts
 *
 * Propósito: Utilidades de dibujo tipográfico y geométrico para PDFs exportados.
 *
 * Responsabilidades:
 * - Alinear texto dentro de cajas de columna (izquierda, centro, derecha).
 * - Truncar cadenas largas y dibujar reglas o fondos de fila.
 *
 * Rol en la arquitectura: Capa de presentación gráfica reutilizable por exportCyclesPdf.
 */

import type { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { rgb } from 'pdf-lib';

/** Paleta corporativa para reportes PDF sobre la plantilla HTL. */
export const PDF_REPORT_COLORS = {
  text: rgb(0.1, 0.1, 0.12),
  textMuted: rgb(0.42, 0.44, 0.48),
  textLabel: rgb(0.22, 0.24, 0.28),
  accent: rgb(0.72, 0.45, 0.08),
  rowAlt: rgb(0.955, 0.957, 0.962),
  border: rgb(0.82, 0.84, 0.88),
  summaryFill: rgb(0.93, 0.97, 0.94),
  summaryBorder: rgb(0.55, 0.72, 0.6),
  white: rgb(1, 1, 1),
} as const;

export type PdfTextAlign = 'left' | 'center' | 'right';

export interface PdfTextBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
}

/**
 * Calcula la coordenada X según la alineación dentro de una caja.
 */
function resolveAlignedX(
  font: PDFFont,
  text: string,
  box: PdfTextBox,
  size: number,
  align: PdfTextAlign,
): number {
  const textWidth = font.widthOfTextAtSize(text, size);

  if (align === 'right') {
    return box.x + box.width - textWidth;
  }

  if (align === 'center') {
    return box.x + (box.width - textWidth) / 2;
  }

  return box.x;
}

/**
 * Dibuja texto alineado dentro de una caja rectangular.
 */
export function drawAlignedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  box: PdfTextBox,
  size: number,
  align: PdfTextAlign = 'left',
  color: RGB = PDF_REPORT_COLORS.text,
): void {
  page.drawText(text, {
    x: resolveAlignedX(font, text, box, size, align),
    y: box.y,
    size,
    font,
    color,
  });
}

/**
 * Recorta una cadena con elipsis si excede el ancho disponible en la fuente.
 */
export function truncateToWidth(
  font: PDFFont,
  text: string,
  size: number,
  maxWidth: number,
): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) {
    return text;
  }

  let truncated = text;

  while (
    truncated.length > 0 &&
    font.widthOfTextAtSize(`${truncated}…`, size) > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }

  return truncated.length > 0 ? `${truncated}…` : '…';
}

/** Dibuja una línea horizontal fina. */
export function drawHorizontalRule(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  color: RGB = PDF_REPORT_COLORS.border,
  thickness = 0.75,
): void {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness,
    color,
  });
}

/** Dibuja un rectángulo relleno (fondo de fila o panel). */
export function drawFilledRect(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB,
): void {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
    borderWidth: 0,
  });
}
