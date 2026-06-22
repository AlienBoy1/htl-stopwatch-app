/**
 * SavedSessionsPanel.tsx
 *
 * Propósito: Mostrar el listado de sesiones previamente guardadas en la PWA.
 *
 * Responsabilidades:
 * - Renderizar nombre, fecha y totales de cada sesión persistida.
 * - Permitir expandir el detalle de ciclos de una sesión guardada.
 *
 * Rol en la arquitectura: Componente de consulta de historial persistido.
 */

import { useState } from 'react';
import { Archive, ChevronDown, ChevronUp } from 'lucide-react';
import type { SavedSession } from '../types/timer.types';
import { formatElapsedTime, formatTableTime } from '../utils/timeFormatter';

export interface SavedSessionsPanelProps {
  readonly sessions: readonly SavedSession[];
}

interface SavedSessionCardProps {
  readonly session: SavedSession;
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

/**
 * Tarjeta expandible con resumen y detalle de ciclos de una sesión guardada.
 */
function SavedSessionCard({ session }: SavedSessionCardProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <button
        type="button"
        onClick={() => setIsExpanded((previous) => !previous)}
        className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
        aria-expanded={isExpanded}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <Archive className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
            {session.name}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{formatSavedDate(session.savedAt)}</p>

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

        <span className="shrink-0 text-zinc-400" aria-hidden="true">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </span>
      </button>

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
          <span className="ml-auto rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {sessions.length}
          </span>
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
              <SavedSessionCard key={session.id} session={session} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
