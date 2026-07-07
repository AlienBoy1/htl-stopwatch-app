/**
 * exportCyclesPdf.ts
 *
 * Propósito: Generar PDFs de ciclos usando la plantilla corporativa HTL.
 *
 * Responsabilidades:
 * - Cargar template_loops_report.pdf como fondo de cada página.
 * - Volcar metadatos, tabla de ciclos y resumen con formato profesional.
 * - Soportar varias sesiones seleccionadas y paginación (>8 ciclos).
 *
 * Rol en la arquitectura: Capa de utilidades de exportación documental.
 */

import {
  PDFDocument,
  StandardFonts,
  type PDFPage,
  type PDFFont,
} from 'pdf-lib';
import {
  LOOPS_REPORT_LAYOUT,
  LOOPS_REPORT_MARGIN_X,
  LOOPS_REPORT_PAGE_HEIGHT,
  LOOPS_REPORT_PAGE_WIDTH,
  LOOPS_REPORT_ROWS_PER_PAGE,
  LOOPS_REPORT_TEMPLATE_PATH,
} from '../constants/pdfTemplate';
import type { CycleRecord, SavedSession } from '../types/timer.types';
import { downloadFile, openFileInBrowser } from './downloadFile';
import {
  drawAlignedText,
  drawFilledRect,
  drawHorizontalRule,
  PDF_REPORT_COLORS,
  truncateToWidth,
} from './pdfDrawing';
import { formatElapsedTime, formatTableTime } from './timeFormatter';
import {
  buildSessionCycleStats,
  formatBoxesPerCycleAvg,
  formatBoxesPerMinute,
} from './sessionCycleStats';

interface PdfFonts {
  readonly regular: PDFFont;
  readonly bold: PDFFont;
}

interface SessionPageContext {
  readonly session: SavedSession;
  readonly pageIndex: number;
  readonly totalPages: number;
  readonly cycleOffset: number;
  readonly cycleChunk: readonly CycleRecord[];
  readonly isLastPageForSession: boolean;
  readonly documentPageNumber: number;
  readonly totalDocumentPages: number;
}

/** Resultado de la generación del reporte PDF en memoria. */
export interface GeneratedPdfReport {
  readonly bytes: Uint8Array;
  readonly fileName: string;
}

const PDF_MIME_TYPE = 'application/pdf';

/**
 * Divide un arreglo en fragmentos de tamaño fijo para paginación del reporte.
 */
function chunkCycles(
  cycles: readonly CycleRecord[],
  chunkSize: number,
): CycleRecord[][] {
  if (cycles.length === 0) {
    return [[]];
  }

  const chunks: CycleRecord[][] = [];

  for (let index = 0; index < cycles.length; index += chunkSize) {
    chunks.push(cycles.slice(index, index + chunkSize));
  }

  return chunks;
}

/** Formatea la fecha de sesión con hora para el encabezado del reporte. */
function formatReportDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Marca temporal corta para el pie de página del documento. */
function formatGeneratedAt(date: Date): string {
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Genera un nombre de archivo seguro para la descarga del reporte. */
function buildExportFileName(sessionCount: number): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = sessionCount === 1 ? 'sesion' : 'sesiones';
  return `HTL-ciclos-${stamp}-${sessionCount}-${suffix}.pdf`;
}

/** Formatea un valor entero o muestra guión si no hay datos. */
function formatOptionalCount(value: number | null): string {
  return value === null ? '—' : String(value);
}

/** Formatea un tiempo opcional para estadísticas de ciclo. */
function formatOptionalCycleTime(value: number | null): string {
  return value === null ? '—' : formatTableTime(value);
}

/**
 * Construye la línea contextual bajo el nombre de sesión (paginación y rango).
 */
function buildContextLine(context: SessionPageContext): string {
  const { session, pageIndex, totalPages, cycleOffset, cycleChunk } = context;
  const totalCycles = session.cycles.length;

  if (totalCycles === 0) {
    return 'Sin ciclos registrados en esta sesión.';
  }

  const rangeStart = cycleOffset + 1;
  const rangeEnd = cycleOffset + cycleChunk.length;

  if (totalPages === 1) {
    return `${totalCycles} ciclo${totalCycles === 1 ? '' : 's'} registrado${totalCycles === 1 ? '' : 's'} · ${session.summary.totalBoxes} caja${session.summary.totalBoxes === 1 ? '' : 's'} en total`;
  }

  return `Página ${pageIndex + 1} de ${totalPages} · Ciclos ${rangeStart}–${rangeEnd} de ${totalCycles}`;
}

/** Dibuja el bloque de metadatos de la sesión en la parte superior. */
function drawSessionMetadata(
  page: PDFPage,
  fonts: PdfFonts,
  context: SessionPageContext,
): void {
  const { metadata } = LOOPS_REPORT_LAYOUT;
  const { session } = context;

  drawAlignedText(
    page,
    fonts.bold,
    'Fecha:',
    { x: metadata.dateLabel.x, y: metadata.dateLabel.y, width: 40 },
    metadata.dateLabel.size,
    'left',
    PDF_REPORT_COLORS.textLabel,
  );

  drawAlignedText(
    page,
    fonts.regular,
    formatReportDateTime(session.savedAt),
    {
      x: metadata.dateValue.x,
      y: metadata.dateValue.y,
      width: metadata.dateValue.width,
    },
    metadata.dateValue.size,
    'left',
  );

  drawAlignedText(
    page,
    fonts.bold,
    'Sesión:',
    { x: metadata.sessionLabel.x, y: metadata.sessionLabel.y, width: 44 },
    metadata.sessionLabel.size,
    'left',
    PDF_REPORT_COLORS.textLabel,
  );

  const sessionTitle = truncateToWidth(
    fonts.regular,
    session.name,
    metadata.sessionValue.size,
    metadata.sessionValue.width,
  );

  drawAlignedText(
    page,
    fonts.regular,
    sessionTitle,
    {
      x: metadata.sessionValue.x,
      y: metadata.sessionValue.y,
      width: metadata.sessionValue.width,
    },
    metadata.sessionValue.size,
    'left',
  );

  drawAlignedText(
    page,
    fonts.bold,
    `#${session.sessionNumber}`,
    {
      x: metadata.sessionBadge.x,
      y: metadata.sessionBadge.y,
      width: metadata.sessionBadge.width,
    },
    metadata.sessionBadge.size,
    'right',
    PDF_REPORT_COLORS.accent,
  );

  drawAlignedText(
    page,
    fonts.regular,
    buildContextLine(context),
    {
      x: metadata.contextLine.x,
      y: metadata.contextLine.y,
      width: metadata.contextLine.width,
    },
    metadata.contextLine.size,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );
}

/** Dibuja los encabezados de columna de la tabla de ciclos. */
function drawTableHeader(page: PDFPage, fonts: PdfFonts): void {
  const { tableHeader } = LOOPS_REPORT_LAYOUT;
  const headerY = tableHeader.y;

  drawHorizontalRule(
    page,
    LOOPS_REPORT_MARGIN_X,
    headerY + 10,
    LOOPS_REPORT_LAYOUT.summary.panelWidth,
  );

  const headers = [
    { label: 'Ciclo', box: tableHeader.cycle },
    { label: 'Tiempo ciclo', box: tableHeader.boxTime },
    { label: 'Cajas', box: tableHeader.boxes },
    { label: 'Tiempo general', box: tableHeader.generalTime },
  ] as const;

  for (const header of headers) {
    drawAlignedText(
      page,
      fonts.bold,
      header.label,
      { x: header.box.x, y: headerY, width: header.box.width },
      tableHeader.size,
      header.label === 'Ciclo' ? 'left' : 'right',
      PDF_REPORT_COLORS.textLabel,
    );
  }

  drawHorizontalRule(
    page,
    LOOPS_REPORT_MARGIN_X,
    headerY - 4,
    LOOPS_REPORT_LAYOUT.summary.panelWidth,
  );
}

/** Dibuja las filas de ciclos con zebra striping y columnas alineadas. */
function drawCycleRows(
  page: PDFPage,
  fonts: PdfFonts,
  cycleChunk: readonly CycleRecord[],
): void {
  const { tableBody } = LOOPS_REPORT_LAYOUT;
  const tableWidth = LOOPS_REPORT_LAYOUT.summary.panelWidth;

  cycleChunk.forEach((cycle, index) => {
    const rowY = tableBody.firstRowY - index * tableBody.rowHeight;
    const rowBottom = rowY - tableBody.rowHeight + 8;

    if (index % 2 === 1) {
      drawFilledRect(
        page,
        LOOPS_REPORT_MARGIN_X,
        rowBottom,
        tableWidth,
        tableBody.rowHeight,
        PDF_REPORT_COLORS.rowAlt,
      );
    }

    drawAlignedText(
      page,
      fonts.bold,
      `#${cycle.cycleNumber}`,
      { x: tableBody.cycle.x, y: rowY, width: tableBody.cycle.width },
      tableBody.dataSize,
      'left',
      PDF_REPORT_COLORS.accent,
    );

    drawAlignedText(
      page,
      fonts.regular,
      formatTableTime(cycle.cycleTimeMs),
      { x: tableBody.boxTime.x, y: rowY, width: tableBody.boxTime.width },
      tableBody.dataSize,
      'right',
    );

    drawAlignedText(
      page,
      fonts.regular,
      String(cycle.boxCount),
      { x: tableBody.boxes.x, y: rowY, width: tableBody.boxes.width },
      tableBody.dataSize,
      'right',
    );

    drawAlignedText(
      page,
      fonts.regular,
      formatElapsedTime(cycle.generalTimeMs),
      {
        x: tableBody.generalTime.x,
        y: rowY,
        width: tableBody.generalTime.width,
      },
      tableBody.dataSize,
      'right',
      PDF_REPORT_COLORS.textMuted,
    );
  });

  if (cycleChunk.length > 0) {
    const lastRowY =
      tableBody.firstRowY - (cycleChunk.length - 1) * tableBody.rowHeight;
    drawHorizontalRule(
      page,
      LOOPS_REPORT_MARGIN_X,
      lastRowY - tableBody.rowHeight + 6,
      tableWidth,
    );
  }
}

/** Dibuja el panel de resumen con totales y promedios al cierre de la sesión. */
function drawSessionSummary(
  page: PDFPage,
  fonts: PdfFonts,
  session: SavedSession,
): void {
  const { summary } = LOOPS_REPORT_LAYOUT;
  const { totalSessionTimeMs, totalBoxes, totalCycles } = session.summary;
  const stats = buildSessionCycleStats(session.cycles, totalSessionTimeMs);
  const contentWidth = summary.panelWidth - 32;
  const contentX = summary.panelX + 16;

  drawFilledRect(
    page,
    summary.panelX,
    summary.panelY,
    summary.panelWidth,
    summary.panelHeight,
    PDF_REPORT_COLORS.summaryFill,
  );

  page.drawRectangle({
    x: summary.panelX,
    y: summary.panelY,
    width: summary.panelWidth,
    height: summary.panelHeight,
    borderColor: PDF_REPORT_COLORS.summaryBorder,
    borderWidth: 1,
    color: PDF_REPORT_COLORS.summaryFill,
  });

  drawAlignedText(
    page,
    fonts.bold,
    'Resumen de sesión',
    { x: contentX, y: summary.titleY, width: contentWidth },
    summary.titleSize,
    'left',
    PDF_REPORT_COLORS.textLabel,
  );

  drawAlignedText(
    page,
    fonts.bold,
    'Tiempo total',
    {
      x: summary.totalTimeLabel.x,
      y: summary.totalTimeLabel.y,
      width: summary.totalTimeValue.width,
    },
    summary.totalTimeLabel.size,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );

  drawAlignedText(
    page,
    fonts.bold,
    formatElapsedTime(totalSessionTimeMs),
    {
      x: summary.totalTimeValue.x,
      y: summary.totalTimeValue.y,
      width: summary.totalTimeValue.width,
    },
    summary.totalTimeValue.size,
    'left',
  );

  drawAlignedText(
    page,
    fonts.bold,
    'Total cajas',
    {
      x: summary.totalBoxesLabel.x,
      y: summary.totalBoxesLabel.y,
      width: summary.totalBoxesValue.width,
    },
    summary.totalBoxesLabel.size,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );

  drawAlignedText(
    page,
    fonts.bold,
    String(totalBoxes),
    {
      x: summary.totalBoxesValue.x,
      y: summary.totalBoxesValue.y,
      width: summary.totalBoxesValue.width,
    },
    summary.totalBoxesValue.size,
    'left',
  );

  drawAlignedText(
    page,
    fonts.bold,
    'Ciclos',
    {
      x: summary.totalCyclesLabel.x,
      y: summary.totalCyclesLabel.y,
      width: summary.totalCyclesValue.width,
    },
    summary.totalCyclesLabel.size,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );

  drawAlignedText(
    page,
    fonts.bold,
    String(totalCycles),
    {
      x: summary.totalCyclesValue.x,
      y: summary.totalCyclesValue.y,
      width: summary.totalCyclesValue.width,
    },
    summary.totalCyclesValue.size,
    'left',
  );

  const averagesText = [
    `Promedio por ciclo: ${formatTableTime(stats.cycleTimeAvgMs)}`,
    `Promedio cajas/ciclo: ${formatBoxesPerCycleAvg(stats.boxesPerCycleAvg)}`,
    `Cajas/min: ${formatBoxesPerMinute(stats.boxesPerMinute)}`,
  ].join('   ·   ');

  drawAlignedText(
    page,
    fonts.regular,
    averagesText,
    { x: contentX, y: summary.averagesY, width: contentWidth },
    summary.averagesSize,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );

  const boxesStatsText = [
    'Cajas',
    `Moda: ${formatOptionalCount(stats.boxesMode)}`,
    `Mayor: ${formatOptionalCount(stats.boxesMax)}`,
    `Menor: ${formatOptionalCount(stats.boxesMin)}`,
  ].join('   ·   ');

  drawAlignedText(
    page,
    fonts.regular,
    boxesStatsText,
    { x: contentX, y: summary.boxesStatsY, width: contentWidth },
    summary.statsSize,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );

  const cycleStatsText = [
    'Tiempo de ciclo',
    `Moda: ${formatOptionalCycleTime(stats.cycleTimeModeMs)}`,
    `Mayor: ${formatOptionalCycleTime(stats.cycleTimeMaxMs)}`,
    `Menor: ${formatOptionalCycleTime(stats.cycleTimeMinMs)}`,
  ].join('   ·   ');

  drawAlignedText(
    page,
    fonts.regular,
    cycleStatsText,
    { x: contentX, y: summary.cycleStatsY, width: contentWidth },
    summary.statsSize,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );
}

/** Dibuja el pie de página con numeración global del documento. */
function drawPageFooter(
  page: PDFPage,
  fonts: PdfFonts,
  documentPageNumber: number,
  totalDocumentPages: number,
  generatedAt: Date,
): void {
  const { footer } = LOOPS_REPORT_LAYOUT;

  drawHorizontalRule(
    page,
    LOOPS_REPORT_MARGIN_X,
    footer.y + 10,
    LOOPS_REPORT_LAYOUT.summary.panelWidth,
    PDF_REPORT_COLORS.border,
    0.5,
  );

  drawAlignedText(
    page,
    fonts.regular,
    `Generado por HTL StopWatch · ${formatGeneratedAt(generatedAt)}`,
    { x: footer.leftX, y: footer.y, width: 340 },
    footer.size,
    'left',
    PDF_REPORT_COLORS.textMuted,
  );

  drawAlignedText(
    page,
    fonts.regular,
    `Pág. ${documentPageNumber} / ${totalDocumentPages}`,
    { x: footer.rightX - footer.rightWidth, y: footer.y, width: footer.rightWidth },
    footer.size,
    'right',
    PDF_REPORT_COLORS.textMuted,
  );
}

/**
 * Dibuja una página de reporte con la plantilla de fondo y los datos de ciclos.
 */
async function drawReportPage(
  outputDoc: PDFDocument,
  templateDoc: PDFDocument,
  fonts: PdfFonts,
  context: SessionPageContext,
  generatedAt: Date,
): Promise<void> {
  const [embeddedTemplatePage] = await outputDoc.embedPdf(templateDoc, [0]);
  const page = outputDoc.addPage([
    LOOPS_REPORT_PAGE_WIDTH,
    LOOPS_REPORT_PAGE_HEIGHT,
  ]);

  page.drawPage(embeddedTemplatePage, {
    x: 0,
    y: 0,
    width: LOOPS_REPORT_PAGE_WIDTH,
    height: LOOPS_REPORT_PAGE_HEIGHT,
  });

  drawSessionMetadata(page, fonts, context);
  drawTableHeader(page, fonts);
  drawCycleRows(page, fonts, context.cycleChunk);

  if (context.isLastPageForSession) {
    drawSessionSummary(page, fonts, context.session);
  }

  drawPageFooter(
    page,
    fonts,
    context.documentPageNumber,
    context.totalDocumentPages,
    generatedAt,
  );
}

/** Calcula el total de páginas del documento antes de renderizar. */
function countTotalPages(sessions: readonly SavedSession[]): number {
  return sessions.reduce((total, session) => {
    const chunks = chunkCycles(session.cycles, LOOPS_REPORT_ROWS_PER_PAGE);
    return total + chunks.length;
  }, 0);
}

/**
 * Genera el PDF de las sesiones seleccionadas sin descargarlo ni abrirlo.
 */
export async function generateSessionsPdfReport(
  sessions: readonly SavedSession[],
): Promise<GeneratedPdfReport> {
  if (sessions.length === 0) {
    throw new Error('No hay sesiones seleccionadas para generar el reporte.');
  }

  const templateResponse = await fetch(LOOPS_REPORT_TEMPLATE_PATH);

  if (!templateResponse.ok) {
    throw new Error('No se pudo cargar la plantilla PDF de reporte.');
  }

  const templateBytes = await templateResponse.arrayBuffer();
  const templateDoc = await PDFDocument.load(templateBytes);
  const outputDoc = await PDFDocument.create();
  const fonts: PdfFonts = {
    regular: await outputDoc.embedFont(StandardFonts.Helvetica),
    bold: await outputDoc.embedFont(StandardFonts.HelveticaBold),
  };

  const generatedAt = new Date();
  const totalDocumentPages = countTotalPages(sessions);
  let documentPageNumber = 0;

  for (const session of sessions) {
    const chunks = chunkCycles(session.cycles, LOOPS_REPORT_ROWS_PER_PAGE);

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunk = chunks[chunkIndex] ?? [];
      documentPageNumber += 1;

      await drawReportPage(
        outputDoc,
        templateDoc,
        fonts,
        {
          session,
          pageIndex: chunkIndex,
          totalPages: chunks.length,
          cycleOffset: chunkIndex * LOOPS_REPORT_ROWS_PER_PAGE,
          cycleChunk: chunk,
          isLastPageForSession: chunkIndex === chunks.length - 1,
          documentPageNumber,
          totalDocumentPages,
        },
        generatedAt,
      );
    }
  }

  const pdfBytes = await outputDoc.save();

  return {
    bytes: pdfBytes,
    fileName: buildExportFileName(sessions.length),
  };
}

/**
 * Descarga el reporte PDF de las sesiones seleccionadas.
 */
export async function downloadSessionsPdfReport(
  sessions: readonly SavedSession[],
): Promise<void> {
  const report = await generateSessionsPdfReport(sessions);
  downloadFile(report.bytes, report.fileName, PDF_MIME_TYPE);
}

/**
 * Abre el reporte PDF en una pestaña nueva del navegador.
 */
export async function openSessionsPdfReport(
  sessions: readonly SavedSession[],
): Promise<void> {
  const report = await generateSessionsPdfReport(sessions);
  openFileInBrowser(report.bytes, PDF_MIME_TYPE);
}
