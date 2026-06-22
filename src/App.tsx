/**
 * App.tsx
 *
 * Propósito: Componente raíz que orquesta el layout, el flujo de interacción
 * y la coordinación entre cronómetros, acciones y historial de paletizado.
 *
 * Responsabilidades:
 * - Conectar useTimer con componentes de UI especializados.
 * - Gestionar el formulario de captura de cajas tras registrar un ciclo.
 * - Exponer controles industriales de inicio, pausa, reanudación, registro y finalización.
 *
 * Rol en la arquitectura: Capa de composición / página principal de la PWA.
 */

import { useCallback, useState, type FormEvent } from 'react';
import { PackagePlus } from 'lucide-react';
import { AppLogo } from './components/AppLogo';
import { CycleHistoryTable } from './components/CycleHistoryTable';
import { SessionControls } from './components/SessionControls';
import { StopwatchDisplay } from './components/StopwatchDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/Button';
import { useTimer } from './hooks/useTimer';
import { formatTableTime } from './utils/timeFormatter';

export default function App(): React.JSX.Element {
  const {
    status,
    generalElapsedMs,
    cycleElapsedMs,
    cycles,
    pendingCycle,
    startSession,
    pauseSession,
    resumeSession,
    registerCycle,
    submitCycleBoxes,
    endSession,
    isSessionActive,
    isPaused,
  } = useTimer();

  const [boxInput, setBoxInput] = useState('');

  /**
   * Reinicia el campo de cajas cuando aparece un nuevo ciclo pendiente,
   * evitando arrastrar valores de registros anteriores.
   */
  const handleRegisterCycle = useCallback((): void => {
    registerCycle();
    setBoxInput('');
  }, [registerCycle]);

  /**
   * Valida y envía la cantidad de cajas al hook de dominio.
   * Solo acepta enteros no negativos para mantener coherencia operativa.
   */
  const handleSubmitBoxes = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      const parsed = Number.parseInt(boxInput, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return;
      }

      submitCycleBoxes(parsed);
      setBoxInput('');
    },
    [boxInput, submitCycleBoxes],
  );

  const isFinished = status === 'finished';
  const hasPendingCycle = pendingCycle !== null;

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Cabecera con logo corporativo, toggle de tema e identificación industrial */}
        <header className="flex items-start gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:items-center sm:gap-5">
          <AppLogo size="md" />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
              HTL Electronics
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Cronómetro
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 sm:mt-2">
              Medición de ciclos de trabajo
            </p>
          </div>

          <ThemeToggle />
        </header>

        <main className="flex flex-1 flex-col gap-5 sm:gap-6">
          <StopwatchDisplay
            values={{ generalElapsedMs, cycleElapsedMs }}
            status={status}
          />

          <SessionControls
            status={status}
            isSessionActive={isSessionActive}
            isPaused={isPaused}
            hasPendingCycle={hasPendingCycle}
            onStartSession={startSession}
            onRegisterCycle={handleRegisterCycle}
            onPauseSession={pauseSession}
            onResumeSession={resumeSession}
            onEndSession={endSession}
          />

          {/* Formulario de captura de cajas visible solo tras registrar un ciclo */}
          {hasPendingCycle && pendingCycle !== null && (
            <section
              className="rounded-2xl border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-500/40 dark:bg-indigo-950/30 sm:p-6"
              aria-label="Registro de cajas del ciclo"
            >
              <h2 className="text-base font-semibold text-indigo-800 dark:text-indigo-200">
                Ciclo #{pendingCycle.cycleNumber} — Introducir cajas paletizadas
              </h2>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Tiempo del ciclo congelado:{' '}
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-300">
                  {formatTableTime(pendingCycle.cycleTimeMs)}
                </span>
              </p>

              <form
                onSubmit={handleSubmitBoxes}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="box-count"
                    className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Cantidad de cajas
                  </label>
                  <input
                    id="box-count"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    required
                    autoFocus
                    value={boxInput}
                    onChange={(event) => setBoxInput(event.target.value)}
                    placeholder="Ej: 24"
                    className="min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-lg font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-indigo-400"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  className="sm:min-w-48"
                  leadingIcon={<PackagePlus className="h-5 w-5" />}
                >
                  Confirmar Cajas
                </Button>
              </form>
            </section>
          )}

          <CycleHistoryTable
            cycles={cycles}
            isSessionFinished={isFinished}
            totalSessionTimeMs={generalElapsedMs}
          />
        </main>

        <footer className="border-t border-zinc-200 pt-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-600">
          HTL StopWatch PWA — Funciona sin conexión - Developed By AlienBoy1 
        </footer>
      </div>
    </div>
  );
}
