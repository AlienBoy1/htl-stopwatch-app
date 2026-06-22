/**
 * CycleHistoryTable.tsx
 *
 * Propósito: Mostrar el historial estructurado de ciclos registrados durante
 * la sesión de paletizado en formato tabular responsive.
 *
 * Responsabilidades:
 * - Renderizar columnas: ciclo, tiempo de ciclo, cajas y tiempo general acumulado.
 * - Ofrecer vista de tarjetas en móvil y tabla en pantallas amplias.
 * - Mostrar resumen de totales al finalizar la sesión (tiempo, ciclos y cajas).
 *
 * Rol en la arquitectura: Componente de presentación de datos históricos, sin mutación de estado.
 */

import { Clock, History, Layers, Package } from 'lucide-react';
import type { CycleRecord, SessionSummary } from '../types/timer.types';
import { formatElapsedTime, formatTableTime } from '../utils/timeFormatter';
import { buildSessionSummary } from '../utils/sessionSummary';

export interface CycleHistoryTableProps {
  readonly cycles: readonly CycleRecord[];
  readonly isSessionFinished: boolean;
  /** Tiempo general acumulado al cierre de sesión; alimenta el resumen final. */
  readonly totalSessionTimeMs: number;
}

interface CycleRowCardProps {
  readonly record: CycleRecord;
}

/**
 * Tarjeta compacta para visualización móvil de un único ciclo registrado.
 */
function CycleRowCard({ record }: CycleRowCardProps): React.JSX.Element {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          Ciclo #{record.cycleNumber}
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          <Package className="h-4 w-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
          {record.boxCount} cajas
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-500">Tiempo ciclo</dt>
          <dd className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {formatTableTime(record.cycleTimeMs)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Tiempo general</dt>
          <dd className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {formatElapsedTime(record.generalTimeMs)}
          </dd>
        </div>
      </dl>
    </li>
  );
}

interface SessionSummaryPanelProps {
  readonly summary: SessionSummary;
}

/**
 * Panel de resumen final con totales de tiempo, ciclos y cajas de la sesión.
 */
function SessionSummaryPanel({
  summary,
}: SessionSummaryPanelProps): React.JSX.Element {
  return (
    <footer
      className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20 sm:p-5"
      aria-label="Resumen de la sesión"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
        Resumen de sesión
      </h3>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-zinc-900/50">
          <Clock
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Total de tiempo
            </dt>
            <dd className="mt-1 font-mono text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatElapsedTime(summary.totalSessionTimeMs)}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-zinc-900/50">
          <Layers
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Total de ciclos
            </dt>
            <dd className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {summary.totalCycles}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-zinc-900/50">
          <Package
            className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400"
            aria-hidden="true"
          />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Total de cajas
            </dt>
            <dd className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {summary.totalBoxes}
            </dd>
          </div>
        </div>
      </dl>
    </footer>
  );
}

export function CycleHistoryTable({
  cycles,
  isSessionFinished,
  totalSessionTimeMs,
}: CycleHistoryTableProps): React.JSX.Element {
  const hasCycles = cycles.length > 0;

  /**
   * Solo se calcula y muestra el resumen cuando la sesión ha sido finalizada,
   * congelando los totales para consulta estática.
   */
  const sessionSummary = isSessionFinished
    ? buildSessionSummary(cycles, totalSessionTimeMs)
    : null;

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-zinc-100/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-6"
      aria-label="Historial de ciclos registrados"
    >
      <header className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Historial de Resultados
        </h2>
        {isSessionFinished && (
          <span className="ml-auto rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Sesión finalizada
          </span>
        )}
      </header>

      {!hasCycles ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          {isSessionFinished
            ? 'No se registraron ciclos en esta sesión.'
            : 'Aún no hay ciclos registrados. Pulsa "Registrar Ciclo" para comenzar el historial.'}
        </p>
      ) : (
        <>
          {/* Vista móvil: lista de tarjetas apiladas */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {cycles.map((record) => (
              <CycleRowCard key={record.cycleNumber} record={record} />
            ))}
          </ul>

          {/* Vista desktop: tabla con scroll horizontal de seguridad */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Ciclo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tiempo Ciclo
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Cajas
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tiempo General
                  </th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((record) => (
                  <tr
                    key={record.cycleNumber}
                    className="border-b border-zinc-200/80 transition-colors hover:bg-zinc-200/50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">
                      #{record.cycleNumber}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatTableTime(record.cycleTimeMs)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-300">
                      {record.boxCount}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatElapsedTime(record.generalTimeMs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sessionSummary !== null && (
        <SessionSummaryPanel summary={sessionSummary} />
      )}
    </section>
  );
}
