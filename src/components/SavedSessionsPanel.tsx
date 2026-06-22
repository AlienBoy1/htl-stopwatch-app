/**
 * SavedSessionsPanel.tsx
 *
 * Propósito: Mostrar el listado de sesiones previamente guardadas en la PWA.
 *
 * Responsabilidades:
 * - Renderizar nombre, fecha y totales de cada sesión persistida.
 * - Permitir expandir el detalle de ciclos de una sesión guardada.
 * - Ofrecer eliminación individual o total sin acceder al localStorage del navegador.
 *
 * Rol en la arquitectura: Componente de consulta y gestión de historial persistido.
 */

import { useState } from 'react';
import { Archive, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { SavedSession } from '../types/timer.types';
import { formatElapsedTime, formatTableTime } from '../utils/timeFormatter';

export interface SavedSessionsPanelProps {
  readonly sessions: readonly SavedSession[];
  readonly onDeleteSession: (sessionId: string) => void;
  readonly onDeleteAllSessions: () => void;
}

interface SavedSessionCardProps {
  readonly session: SavedSession;
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
  readonly children: React.ReactNode;
}

/**
 * Botón de icono accesible para acciones secundarias (eliminar, etc.).
 */
function IconButton({
  label,
  onClick,
  className = '',
  children,
}: IconButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/**
 * Tarjeta expandible con resumen, detalle de ciclos y opción de eliminación.
 */
function SavedSessionCard({
  session,
  onDelete,
}: SavedSessionCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = (): void => {
    onDelete(session.id);
  };

  return (
    <li className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-start gap-1 p-2 sm:gap-2 sm:p-3">
        <button
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 sm:p-3"
          aria-expanded={isExpanded}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Archive className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
              {session.name}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {formatSavedDate(session.savedAt)}
            </p>

            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
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
          </div>

          <span className="shrink-0 self-center text-zinc-400" aria-hidden="true">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </span>
        </button>

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
}: SavedSessionsPanelProps): React.JSX.Element {
  const hasSessions = sessions.length > 0;

  return (
    <section
      className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none"
      aria-label="Sesiones guardadas"
    >
      <header className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40 sm:px-6">
        <Archive className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Sesiones guardadas
        </h2>

        {hasSessions && (
          <>
            <span className="ml-auto rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {sessions.length}
            </span>

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
          <p className="py-6 text-center text-sm text-zinc-500">
            Aún no hay sesiones guardadas. Finaliza un cronómetro y pulsa
            &quot;Guardar sesión&quot;.
          </p>
        ) : (
          <ul className="space-y-3">
            {[...sessions].reverse().map((session) => (
              <SavedSessionCard
                key={session.id}
                session={session}
                onDelete={onDeleteSession}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
