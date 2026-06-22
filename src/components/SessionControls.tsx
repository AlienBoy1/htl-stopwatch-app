/**
 * SessionControls.tsx
 *
 * Propósito: Agrupar y estructurar los controles de sesión del cronómetro
 * en un panel de acciones jerárquico y de fácil uso táctil.
 *
 * Responsabilidades:
 * - Organizar acciones por prioridad (inicio, registro, pausa, finalización).
 * - Presentar botones con iconografía, título y descripción contextual.
 * - Mantener áreas de contacto amplias para entorno industrial.
 *
 * Rol en la arquitectura: Componente de control de sesión desacoplado de App.
 */

import {
  Flag,
  PackagePlus,
  Pause,
  Play,
  Square,
} from 'lucide-react';
import type { SessionStatus } from '../types/timer.types';
import { Button } from './ui/Button';

export interface SessionControlsProps {
  readonly status: SessionStatus;
  readonly isSessionActive: boolean;
  readonly isPaused: boolean;
  readonly hasPendingCycle: boolean;
  readonly onStartSession: () => void;
  readonly onRegisterCycle: () => void;
  readonly onPauseSession: () => void;
  readonly onResumeSession: () => void;
  readonly onEndSession: () => void;
}

interface ControlActionProps {
  readonly label: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly variant: 'primary' | 'cycle' | 'danger' | 'outline';
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly ariaLabel: string;
}

/**
 * Botón de acción estructurado con icono destacado, título y descripción breve.
 * Mejora la escaneabilidad en pantallas táctiles industriales.
 */
function ControlAction({
  label,
  description,
  icon,
  variant,
  onClick,
  disabled = false,
  ariaLabel,
}: ControlActionProps): React.JSX.Element {
  const iconWrapperClass: Record<ControlActionProps['variant'], string> = {
    primary:
      'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
    cycle:
      'bg-amber-500/25 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    danger:
      'bg-rose-500/20 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300',
    outline:
      'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  };

  return (
    <Button
      variant={variant}
      size="xl"
      fullWidth
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="!h-auto !min-h-[4.5rem] !flex-col !items-start !justify-center !gap-2 !rounded-2xl !px-4 !py-4 !text-left sm:!min-h-[5rem] sm:!px-5"
    >
      <span className="flex w-full items-center gap-3">
        <span
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            iconWrapperClass[variant],
          ].join(' ')}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-bold leading-tight sm:text-lg">{label}</span>
          <span className="text-xs font-normal leading-snug opacity-80 sm:text-sm">
            {description}
          </span>
        </span>
      </span>
    </Button>
  );
}

export function SessionControls({
  status,
  isSessionActive,
  isPaused,
  hasPendingCycle,
  onStartSession,
  onRegisterCycle,
  onPauseSession,
  onResumeSession,
  onEndSession,
}: SessionControlsProps): React.JSX.Element {
  const isIdle = status === 'idle';
  const isFinished = status === 'finished';

  return (
    <section
      className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none"
      aria-label="Panel de control de sesión"
    >
      <header className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40 sm:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Panel de control
        </h2>
      </header>

      <div className="space-y-4 p-4 sm:p-6">
        {isIdle && (
          <ControlAction
            label="Iniciar cronómetro"
            description="Comienza una nueva sesión de medición de ciclos"
            icon={<Play className="h-5 w-5" />}
            variant="primary"
            onClick={onStartSession}
            ariaLabel="Iniciar cronómetro"
          />
        )}

        {isSessionActive && (
          <>
            {/* Acción principal: registrar el ciclo en curso */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Acción principal
              </p>
              <ControlAction
                label="Registrar ciclo"
                description="Congela el tiempo del ciclo e introduce las cajas paletizadas"
                icon={<PackagePlus className="h-5 w-5" />}
                variant="cycle"
                onClick={onRegisterCycle}
                disabled={hasPendingCycle || isPaused}
                ariaLabel="Registrar ciclo actual"
              />
            </div>

            {/* Acciones secundarias: pausa/reanudar y finalizar */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Control de sesión
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isPaused ? (
                  <ControlAction
                    label="Reanudar"
                    description="Continúa el cronometraje desde donde se pausó"
                    icon={<Play className="h-5 w-5" />}
                    variant="primary"
                    onClick={onResumeSession}
                    ariaLabel="Reanudar cronómetro"
                  />
                ) : (
                  <ControlAction
                    label="Pausar"
                    description="Detiene temporalmente ambos contadores"
                    icon={<Pause className="h-5 w-5" />}
                    variant="outline"
                    onClick={onPauseSession}
                    disabled={hasPendingCycle}
                    ariaLabel="Pausar cronómetro"
                  />
                )}

                <ControlAction
                  label="Finalizar"
                  description="Cierra la sesión y congela el historial"
                  icon={<Square className="h-5 w-5" />}
                  variant="danger"
                  onClick={onEndSession}
                  disabled={hasPendingCycle}
                  ariaLabel="Finalizar sesión de medición"
                />
              </div>
            </div>
          </>
        )}

        {isFinished && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-950/50 sm:p-5">
            <p className="flex items-center justify-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <Flag className="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
              Sesión finalizada. Los datos quedan congelados para consulta.
            </p>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              className="mt-4"
              onClick={onStartSession}
              leadingIcon={<Play className="h-5 w-5" />}
            >
              Nueva sesión
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
