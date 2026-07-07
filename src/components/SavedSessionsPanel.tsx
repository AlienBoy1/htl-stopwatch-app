/**
 * SavedSessionsPanel.tsx
 *
 * Propósito: Mostrar el listado de sesiones previamente guardadas en la PWA.
 *
 * Responsabilidades:
 * - Renderizar nombre, fecha y totales de cada sesión persistida.
 * - Permitir selección múltiple para abrir o descargar reportes PDF de ciclos.
 * - Gestionar eliminación individual o total sin acceder al localStorage del navegador.
 * - Permitir renombrar sesiones guardadas con edición inline animada.
 * - Abrir registro manual de sesiones con ciclos editables.
 *
 * Rol en la arquitectura: Componente de consulta y gestión de historial persistido.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  Archive,
  ChevronDown,
  ChevronUp,
  ClipboardPenLine,
  ExternalLink,
  FileDown,
  Trash2,
} from 'lucide-react';
import type { SaveSessionPayload, SavedSession } from '../types/timer.types';
import { formatElapsedTime, formatTableTime } from '../utils/timeFormatter';
import { Button } from './ui/Button';
import { ManualSessionDialog } from './ManualSessionDialog';
import { SessionNameField } from './SessionNameField';

export interface SavedSessionsPanelProps {
  readonly sessions: readonly SavedSession[];
  readonly onDeleteSession: (sessionId: string) => void;
  readonly onDeleteAllSessions: () => void;
  readonly onRenameSession: (sessionId: string, customName: string) => Promise<void>;
  readonly onSaveManualSession: (payload: SaveSessionPayload) => Promise<void>;
  readonly onOpenSessionsPdf: (sessions: readonly SavedSession[]) => Promise<void>;
  readonly onDownloadSessionsPdf: (sessions: readonly SavedSession[]) => Promise<void>;
}

interface SavedSessionCardProps {
  readonly session: SavedSession;
  readonly isSelected: boolean;
  readonly onToggleSelect: (sessionId: string) => void;
  readonly onRename: (sessionId: string, customName: string) => Promise<void>;
  readonly onDelete: (sessionId: string) => void;
}

/** Formatea la fecha de guardado en locale español. */
function formatSavedDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface IconButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly children: React.ReactNode;
}

/**
 * Botón de icono accesible para acciones secundarias (eliminar, etc.).
 */
function IconButton({
  label,
  onClick,
  className = '',
  disabled = false,
  children,
}: IconButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/**
 * Tarjeta expandible con selección, resumen, detalle de ciclos y eliminación.
 */
function SavedSessionCard({
  session,
  isSelected,
  onToggleSelect,
  onRename,
  onDelete,
}: SavedSessionCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleSelect = (): void => {
    onToggleSelect(session.id);
  };

  const handleDelete = (): void => {
    onDelete(session.id);
  };

  const handleToggleExpanded = (): void => {
    setIsExpanded((previous) => !previous);
  };

  return (
    <li
      className={[
        'overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900/60',
        isSelected
          ? 'border-emerald-400 ring-1 ring-emerald-400/40 dark:border-emerald-500/60'
          : 'border-zinc-200 dark:border-zinc-800',
      ].join(' ')}
    >
      <div className="flex items-start gap-1 p-2 sm:gap-2 sm:p-3">
        <label className="flex shrink-0 cursor-pointer items-center p-2 sm:p-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelect}
            aria-label={`Seleccionar sesión ${session.name} para exportar`}
            className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>

        <div className="flex min-w-0 flex-1 items-start gap-3 p-2 sm:p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Archive className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <SessionNameField
              sessionId={session.id}
              name={session.name}
              sessionNumber={session.sessionNumber}
              onRename={onRename}
            />

            <p className="mt-0.5 text-xs text-zinc-500">
              {formatSavedDate(session.savedAt)}
            </p>

            <button
              type="button"
              onClick={handleToggleExpanded}
              className="mt-3 w-full rounded-xl text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              aria-expanded={isExpanded}
            >
              <dl className="grid grid-cols-3 gap-2 px-1 text-xs">
                <div>
                  <dt className="text-zinc-500">Tiempo</dt>
                  <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatElapsedTime(session.summary.totalSessionTimeMs)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Ciclos</dt>
                  <dd className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {session.summary.totalCycles}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Cajas</dt>
                  <dd className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {session.summary.totalBoxes}
                  </dd>
                </div>
              </dl>
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleExpanded}
            className="shrink-0 self-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label={isExpanded ? 'Contraer detalle de ciclos' : 'Expandir detalle de ciclos'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <IconButton
          label={`Eliminar sesión ${session.name}`}
          onClick={handleDelete}
          className="text-rose-600 hover:bg-rose-50 active:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:active:bg-rose-950/60"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>

      {isExpanded && session.cycles.length > 0 && (
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-5">
          <ul className="space-y-2">
            {session.cycles.map((cycle) => (
              <li
                key={`${session.id}-${cycle.cycleNumber}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-950/50"
              >
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Ciclo #{cycle.cycleNumber}
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {formatTableTime(cycle.cycleTimeMs)}
                </span>
                <span className="text-indigo-600 dark:text-indigo-300">
                  {cycle.boxCount} cajas
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function SavedSessionsPanel({
  sessions,
  onDeleteSession,
  onDeleteAllSessions,
  onRenameSession,
  onSaveManualSession,
  onOpenSessionsPdf,
  onDownloadSessionsPdf,
}: SavedSessionsPanelProps): React.JSX.Element {
  const hasSessions = sessions.length > 0;
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<readonly string[]>(
    [],
  );
  const [isPdfBusy, setIsPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const selectedSessions = useMemo(
    () => sessions.filter((session) => selectedSessionIds.includes(session.id)),
    [sessions, selectedSessionIds],
  );

  const allSelected =
    hasSessions && selectedSessionIds.length === sessions.length;
  const hasSelection = selectedSessionIds.length > 0;

  const handleToggleSelect = useCallback((sessionId: string): void => {
    setSelectedSessionIds((previous) =>
      previous.includes(sessionId)
        ? previous.filter((id) => id !== sessionId)
        : [...previous, sessionId],
    );
  }, []);

  const handleToggleSelectAll = useCallback((): void => {
    setSelectedSessionIds((previous) =>
      previous.length === sessions.length
        ? []
        : sessions.map((session) => session.id),
    );
  }, [sessions]);

  /**
   * Genera el PDF y lo abre o descarga según la acción elegida.
   */
  const handlePdfAction = useCallback(
    async (action: 'open' | 'download'): Promise<void> => {
      if (selectedSessions.length === 0 || isPdfBusy) {
        return;
      }

      setIsPdfBusy(true);
      setPdfError(null);

      try {
        if (action === 'open') {
          await onOpenSessionsPdf(selectedSessions);
        } else {
          await onDownloadSessionsPdf(selectedSessions);
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'POPUP_BLOCKED') {
          setPdfError(
            'El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio e inténtalo de nuevo.',
          );
        } else {
          setPdfError(
            'No se pudo generar el PDF. Verifica la plantilla e inténtalo de nuevo.',
          );
        }
      } finally {
        setIsPdfBusy(false);
      }
    },
    [selectedSessions, isPdfBusy, onOpenSessionsPdf, onDownloadSessionsPdf],
  );

  const selectionLabel = `(${selectedSessionIds.length})`;

  return (
    <section
      className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none"
      aria-label="Sesiones guardadas"
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40 sm:px-6">
        <Archive className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Sesiones guardadas
        </h2>

        <button
          type="button"
          onClick={() => setIsManualDialogOpen(true)}
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
            'bg-indigo-500/15 text-indigo-700 hover:bg-indigo-500/25',
            'dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30',
            hasSessions ? '' : 'ml-auto',
          ].join(' ')}
        >
          <ClipboardPenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Sesión manual
        </button>

        {hasSessions && (
          <>
            <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {sessions.length}
            </span>

            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>

            <IconButton
              label="Eliminar todas las sesiones guardadas"
              onClick={onDeleteAllSessions}
              className="text-rose-600 hover:bg-rose-50 active:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:active:bg-rose-950/60"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </>
        )}
      </header>

      <div className="p-4 sm:p-6">
        {!hasSessions ? (
          <div className="py-6 text-center">
            <p className="text-sm text-zinc-500">
              Aún no hay sesiones guardadas. Finaliza un cronómetro y pulsa
              &quot;Guardar sesión&quot;, o registra una sesión manualmente.
            </p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-4"
              leadingIcon={<ClipboardPenLine className="h-5 w-5" />}
              onClick={() => setIsManualDialogOpen(true)}
            >
              Registrar sesión manual
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {[...sessions].reverse().map((session) => (
                <SavedSessionCard
                  key={session.id}
                  session={session}
                  isSelected={selectedSessionIds.includes(session.id)}
                  onToggleSelect={handleToggleSelect}
                  onRename={onRenameSession}
                  onDelete={onDeleteSession}
                />
              ))}
            </ul>

            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              {pdfError !== null && (
                <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-300">
                  {pdfError}
                </p>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={!hasSelection || isPdfBusy}
                  leadingIcon={<ExternalLink className="h-5 w-5" />}
                  onClick={() => {
                    void handlePdfAction('open');
                  }}
                >
                  {isPdfBusy
                    ? 'Generando PDF…'
                    : `Abrir PDF en navegador ${selectionLabel}`}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!hasSelection || isPdfBusy}
                  leadingIcon={<FileDown className="h-5 w-5" />}
                  onClick={() => {
                    void handlePdfAction('download');
                  }}
                >
                  {isPdfBusy
                    ? 'Generando PDF…'
                    : `Descargar PDF ${selectionLabel}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ManualSessionDialog
        isOpen={isManualDialogOpen}
        existingSessionCount={sessions.length}
        onClose={() => setIsManualDialogOpen(false)}
        onSave={onSaveManualSession}
      />
    </section>
  );
}
