/**
 * StopwatchDisplay.tsx
 *
 * Propósito: Renderizar la consola visual de cronómetros con jerarquía clara
 * entre tiempo general (métrica principal) y ciclo actual (métrica secundaria).
 *
 * Responsabilidades:
 * - Presentar tiempos en bloques digitales monoespaciados de alta legibilidad.
 * - Integrar indicador de estado de sesión en la misma unidad visual.
 * - Adaptar el layout a pantallas industriales móviles y desktop.
 *
 * Rol en la arquitectura: Componente de presentación puro consumido por App.
 */

import { Clock, Pause, Timer } from 'lucide-react';
import type { SessionStatus, TimerDisplayValues } from '../types/timer.types';
import { getTimeParts } from '../utils/timeFormatter';

export interface StopwatchDisplayProps {
  readonly values: TimerDisplayValues;
  readonly status: SessionStatus;
}

interface StatusBadgeProps {
  readonly status: SessionStatus;
}

/** Etiqueta de estado integrada en la consola de cronometraje. */
function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const config: Record<
    SessionStatus,
    { label: string; dotClass: string; badgeClass: string }
  > = {
    idle: {
      label: 'En espera',
      dotClass: 'bg-zinc-400',
      badgeClass:
        'border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300',
    },
    running: {
      label: 'En marcha',
      dotClass: 'bg-emerald-500 animate-pulse',
      badgeClass:
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    paused: {
      label: 'Pausado',
      dotClass: 'bg-indigo-500',
      badgeClass:
        'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300',
    },
    finished: {
      label: 'Finalizado',
      dotClass: 'bg-rose-500',
      badgeClass:
        'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300',
    },
  };

  const { label, dotClass, badgeClass } = config[status];

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider',
        badgeClass,
      ].join(' ')}
    >
      <span className={['h-2 w-2 rounded-full', dotClass].join(' ')} aria-hidden="true" />
      {label}
    </span>
  );
}

interface DigitBlockProps {
  readonly value: string;
  readonly unit: string;
}

/** Bloque individual de dígito con unidad para lectura rápida en planta. */
function DigitBlock({ value, unit }: DigitBlockProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="rounded-lg bg-zinc-100 px-2.5 py-1.5 font-mono text-2xl font-bold tabular-nums text-zinc-900 sm:px-3 sm:py-2 sm:text-3xl dark:bg-zinc-950/80 dark:text-zinc-50">
        {value}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 sm:text-xs">
        {unit}
      </span>
    </div>
  );
}

interface StructuredTimeProps {
  readonly milliseconds: number;
  readonly hideLeadingHours?: boolean;
  readonly size?: 'hero' | 'compact';
}

/**
 * Renderiza el tiempo desglosado en bloques HH · MM · SS · cs
 * para una lectura estructurada y sin saltos visuales.
 */
function StructuredTime({
  milliseconds,
  hideLeadingHours = false,
  size = 'hero',
}: StructuredTimeProps): React.JSX.Element {
  const parts = getTimeParts(milliseconds, { hideLeadingHours });
  const separatorClass =
    size === 'hero'
      ? 'pb-5 font-mono text-2xl font-light text-zinc-300 dark:text-zinc-600 sm:text-3xl'
      : 'pb-4 font-mono text-xl font-light text-zinc-300 dark:text-zinc-600';

  return (
    <div
      className="flex items-center justify-center gap-1.5 sm:gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {parts.showHours && (
        <>
          <DigitBlock value={parts.hours} unit="hr" />
          <span className={separatorClass} aria-hidden="true">
            :
          </span>
        </>
      )}
      <DigitBlock value={parts.minutes} unit="min" />
      <span className={separatorClass} aria-hidden="true">
        :
      </span>
      <DigitBlock value={parts.seconds} unit="seg" />
      <span className={separatorClass} aria-hidden="true">
        .
      </span>
      <DigitBlock value={parts.centiseconds} unit="cs" />
    </div>
  );
}

interface MetricPanelProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly subtitle: string;
  readonly accentBarClass: string;
  readonly children: React.ReactNode;
}

/** Panel de métrica con barra de acento lateral y cabecera descriptiva. */
function MetricPanel({
  icon,
  title,
  subtitle,
  accentBarClass,
  children,
}: MetricPanelProps): React.JSX.Element {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div
        className={['absolute inset-y-0 left-0 w-1', accentBarClass].join(' ')}
        aria-hidden="true"
      />
      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
        <header className="mb-3 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-600 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
        </header>
        {children}
      </div>
    </article>
  );
}

export function StopwatchDisplay({
  values,
  status,
}: StopwatchDisplayProps): React.JSX.Element {
  const isPaused = status === 'paused';

  return (
    <section
      className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none"
      aria-label="Consola de cronómetros"
    >
      {/* Cabecera de consola con estado de sesión */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Consola de medición
        </p>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-col gap-0">
        {/* Métrica principal: tiempo general acumulado de la sesión */}
        <div className="border-b border-zinc-200 px-4 py-6 dark:border-zinc-800 sm:px-6 sm:py-8">
          <div className="mb-4 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Tiempo general
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-3 py-5 dark:border-zinc-800 dark:from-zinc-900/80 dark:to-zinc-950/60 sm:px-6 sm:py-6">
            <StructuredTime milliseconds={values.generalElapsedMs} size="hero" />
          </div>

          <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Tiempo total acumulado desde el inicio de la sesión
          </p>
        </div>

        {/* Aviso de pausa integrado en la consola */}
        {isPaused && (
          <div className="flex items-center justify-center gap-2 border-b border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-800 dark:border-indigo-500/20 dark:bg-indigo-950/30 dark:text-indigo-300">
            <Pause className="h-4 w-4 shrink-0" aria-hidden="true" />
            Cronómetro en pausa — pulsa Reanudar para continuar
          </div>
        )}

        {/* Métrica secundaria: ciclo actual en curso */}
        <div className="p-4 sm:p-6">
          <MetricPanel
            icon={<Timer className="h-4 w-4" />}
            title="Ciclo actual"
            subtitle="Tiempo transcurrido en el ciclo en marcha"
            accentBarClass="bg-amber-500"
          >
            <StructuredTime
              milliseconds={values.cycleElapsedMs}
              hideLeadingHours
              size="compact"
            />
          </MetricPanel>
        </div>
      </div>
    </section>
  );
}
