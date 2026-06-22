/**
 * App.tsx
 *
 * Propósito: Componente raíz que orquesta el layout, el flujo de interacción
 * y la coordinación entre cronómetros, acciones y historial de paletizado.
 *
 * Responsabilidades:
 * - Conectar useTimer con componentes de UI especializados.
 * - Gestionar el formulario de captura de cajas tras registrar un ciclo.
 * - Coordinar el guardado persistente de sesiones finalizadas en localStorage.
 *
 * Rol en la arquitectura: Capa de composición / página principal de la PWA.
 */

import { useCallback, useState, type FormEvent } from 'react';
import { PackagePlus } from 'lucide-react';
import { AppNavbar } from './components/AppNavbar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CycleHistoryTable } from './components/CycleHistoryTable';
import { SavedSessionsPanel } from './components/SavedSessionsPanel';
import { SaveSessionDialog } from './components/SaveSessionDialog';
import { SessionControls } from './components/SessionControls';
import { StopwatchDisplay } from './components/StopwatchDisplay';
import { Button } from './components/ui/Button';
import { useSavedSessions } from './hooks/useSavedSessions';
import { useTimer } from './hooks/useTimer';
import { formatTableTime } from './utils/timeFormatter';

/** Solicitud pendiente de confirmación para eliminar sesiones guardadas. */
type DeleteConfirmRequest =
  | {
      readonly kind: 'single';
      readonly sessionId: string;
      readonly sessionName: string;
    }
  | { readonly kind: 'all' };

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

  const { savedSessions, saveSession, deleteSession, deleteAllSessions } =
    useSavedSessions();

  const [boxInput, setBoxInput] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isCurrentSessionSaved, setIsCurrentSessionSaved] = useState(false);
  const [savedSessionLabel, setSavedSessionLabel] = useState<string | null>(null);
  const [deleteConfirmRequest, setDeleteConfirmRequest] =
    useState<DeleteConfirmRequest | null>(null);

  /**
   * Reinicia el campo de cajas cuando aparece un nuevo ciclo pendiente,
   * evitando arrastrar valores de registros anteriores.
   */
  const handleRegisterCycle = useCallback((): void => {
    registerCycle();
    setBoxInput('');
  }, [registerCycle]);

  /**
   * Inicia una nueva sesión y limpia el estado de guardado de la sesión anterior.
   */
  const handleStartSession = useCallback((): void => {
    startSession();
    setIsCurrentSessionSaved(false);
    setSavedSessionLabel(null);
    setIsSaveDialogOpen(false);
  }, [startSession]);

  /**
   * Abre el diálogo para nombrar y persistir la sesión finalizada actual.
   */
  const handleOpenSaveDialog = useCallback((): void => {
    setIsSaveDialogOpen(true);
  }, []);

  /**
   * Confirma el guardado aplicando nombre personalizado o numeración automática.
   */
  const handleConfirmSaveSession = useCallback(
    (customName: string): void => {
      const saved = saveSession({
        customName,
        cycles,
        totalSessionTimeMs: generalElapsedMs,
      });

      setIsCurrentSessionSaved(true);
      setSavedSessionLabel(saved.name);
      setIsSaveDialogOpen(false);
    },
    [saveSession, cycles, generalElapsedMs],
  );

  /**
   * Abre el diálogo interno para confirmar la eliminación de una sesión.
   */
  const handleDeleteSession = useCallback(
    (sessionId: string): void => {
      const session = savedSessions.find((item) => item.id === sessionId);
      if (session === undefined) {
        return;
      }

      setDeleteConfirmRequest({
        kind: 'single',
        sessionId,
        sessionName: session.name,
      });
    },
    [savedSessions],
  );

  /**
   * Abre el diálogo interno para confirmar el borrado de todas las sesiones.
   */
  const handleDeleteAllSessions = useCallback((): void => {
    setDeleteConfirmRequest({ kind: 'all' });
  }, []);

  /**
   * Ejecuta la eliminación confirmada desde el diálogo de la aplicación.
   */
  const handleConfirmDelete = useCallback((): void => {
    if (deleteConfirmRequest === null) {
      return;
    }

    if (deleteConfirmRequest.kind === 'single') {
      deleteSession(deleteConfirmRequest.sessionId);
    } else {
      deleteAllSessions();
    }

    setDeleteConfirmRequest(null);
  }, [deleteConfirmRequest, deleteSession, deleteAllSessions]);

  const deleteDialogTitle =
    deleteConfirmRequest?.kind === 'all'
      ? 'Eliminar todas las sesiones'
      : 'Eliminar sesión';

  const deleteDialogMessage =
    deleteConfirmRequest?.kind === 'all'
      ? 'Se borrarán permanentemente todas las sesiones guardadas en este dispositivo. Esta acción no se puede deshacer.'
      : deleteConfirmRequest?.kind === 'single'
        ? `Se eliminará permanentemente la sesión "${deleteConfirmRequest.sessionName}". Esta acción no se puede deshacer.`
        : '';

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
      <AppNavbar />

      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:min-h-[calc(100dvh-4.25rem)] sm:gap-6 sm:px-6 sm:py-6">
        <main className="flex flex-1 flex-col gap-5 sm:gap-6">
          <div className="px-0.5">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Cronómetro
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Medición de ciclos de trabajo
            </p>
          </div>

          <StopwatchDisplay
            values={{ generalElapsedMs, cycleElapsedMs }}
            status={status}
          />

          <SessionControls
            status={status}
            isSessionActive={isSessionActive}
            isPaused={isPaused}
            hasPendingCycle={hasPendingCycle}
            onStartSession={handleStartSession}
            onRegisterCycle={handleRegisterCycle}
            onPauseSession={pauseSession}
            onResumeSession={resumeSession}
            onEndSession={endSession}
            onSaveSession={handleOpenSaveDialog}
            isCurrentSessionSaved={isCurrentSessionSaved}
            savedSessionLabel={savedSessionLabel}
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

          <SavedSessionsPanel
            sessions={savedSessions}
            onDeleteSession={handleDeleteSession}
            onDeleteAllSessions={handleDeleteAllSessions}
          />
        </main>

        <footer className="border-t border-zinc-200 pt-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-600">
          HTL StopWatch PWA — Funciona sin conexión - Developed By AlienBoy1
        </footer>
      </div>

      <SaveSessionDialog
        isOpen={isSaveDialogOpen}
        existingSessionCount={savedSessions.length}
        onClose={() => setIsSaveDialogOpen(false)}
        onConfirm={handleConfirmSaveSession}
      />

      <ConfirmDialog
        isOpen={deleteConfirmRequest !== null}
        title={deleteDialogTitle}
        message={deleteDialogMessage}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onClose={() => setDeleteConfirmRequest(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
