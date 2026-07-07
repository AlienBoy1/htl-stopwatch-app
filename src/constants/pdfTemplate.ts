/**
 * pdfTemplate.ts
 *
 * Propósito: Centralizar la ruta y coordenadas de la plantilla PDF de reporte.
 *
 * Responsabilidades:
 * - Definir la ruta pública del template_loops_report.pdf.
 * - Mapear posiciones de texto sobre la plantilla (origen inferior izquierdo PDF).
 *
 * Rol en la arquitectura: Constantes de layout para exportación de ciclos en PDF.
 */

/** Ruta pública de la plantilla HTL Electronics Time Log. */
export const LOOPS_REPORT_TEMPLATE_PATH =
  '/templates/template_loops_report.pdf';

/** Filas de ciclos visibles por página en la plantilla. */
export const LOOPS_REPORT_ROWS_PER_PAGE = 8;

/** Dimensiones de página US Letter en puntos PDF. */
export const LOOPS_REPORT_PAGE_WIDTH = 612;
export const LOOPS_REPORT_PAGE_HEIGHT = 792;

/** Márgenes horizontales estándar del reporte. */
export const LOOPS_REPORT_MARGIN_X = 54;

/**
 * Coordenadas de campos sobre la plantilla (eje Y desde la base de la página).
 * Calibradas para template_loops_report.pdf.
 */
export const LOOPS_REPORT_LAYOUT = {
  /** Bloque de metadatos de sesión (fecha, nombre, contexto). */
  metadata: {
    dateLabel: { x: LOOPS_REPORT_MARGIN_X, y: 724, size: 8 },
    dateValue: { x: 92, y: 724, width: 120, size: 10 },
    sessionLabel: { x: LOOPS_REPORT_MARGIN_X, y: 708, size: 8 },
    sessionValue: { x: 104, y: 708, width: 340, size: 10 },
    sessionBadge: { x: 456, y: 708, width: 102, size: 9 },
    contextLine: { x: LOOPS_REPORT_MARGIN_X, y: 692, width: 504, size: 8 },
  },
  /** Encabezados de columnas sobre la tabla de ciclos. */
  tableHeader: {
    y: 632,
    size: 8,
    cycle: { x: LOOPS_REPORT_MARGIN_X, width: 36 },
    boxTime: { x: 118, width: 108 },
    boxes: { x: 268, width: 72 },
    generalTime: { x: 388, width: 170 },
  },
  /** Filas de datos de ciclos. */
  tableBody: {
    firstRowY: 608,
    rowHeight: 31,
    dataSize: 10,
    cycle: { x: LOOPS_REPORT_MARGIN_X, width: 36 },
    boxTime: { x: 118, width: 108 },
    boxes: { x: 268, width: 72 },
    generalTime: { x: 388, width: 170 },
  },
  /** Panel de totales y estadísticas al pie de la última página de cada sesión. */
  summary: {
    panelX: LOOPS_REPORT_MARGIN_X,
    panelY: 68,
    panelWidth: 504,
    panelHeight: 118,
    titleY: 174,
    titleSize: 9,
    totalTimeLabel: { x: 72, y: 156, size: 8 },
    totalTimeValue: { x: 72, y: 140, width: 130, size: 12 },
    totalBoxesLabel: { x: 230, y: 156, size: 8 },
    totalBoxesValue: { x: 230, y: 140, width: 72, size: 12 },
    totalCyclesLabel: { x: 340, y: 156, size: 8 },
    totalCyclesValue: { x: 340, y: 140, width: 48, size: 12 },
    averagesY: 124,
    averagesSize: 8,
    boxesStatsY: 108,
    cycleStatsY: 92,
    statsSize: 8,
  },
  /** Pie de página con numeración y origen del reporte. */
  footer: {
    y: 44,
    size: 7,
    leftX: LOOPS_REPORT_MARGIN_X,
    rightWidth: 200,
    rightX: 558,
  },
} as const;
