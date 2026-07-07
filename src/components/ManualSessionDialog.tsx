/**
 * ManualSessionDialog.tsx
 *
 * Propósito: Formulario modal para registrar sesiones de paletizado manualmente.
 *
 * Responsabilidades:
 * - Capturar nombre, ciclos (tiempo y cajas) con alta interacción.
 * - Calcular totales en vivo y validar antes de persistir.
 * - Ofrecer animaciones de alta, baja y guardado con feedback visual.
 *
 * Rol en la arquitectura: Componente transitorio de captura de sesiones manuales.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import {
  Check,
  ClipboardPenLine,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type { SaveSessionPayload } from '../types/timer.types';
import type { ManualCycleDraft, ManualCycleFieldErrors } from '../types/manualSession.types';
import {
  buildCycleRecordsFromDrafts,
  computeManualSessionTotals,
  createManualCycleDraft,
  validateManualSessionDrafts,
} from '../utils/manualSessionBuilder';
import { resolveSessionName } from '../utils/sessionNaming';
import { formatElapsedTime } from '../utils/timeFormatter';
import { Button } from './ui/Button';

type ManualDialogMode = 'editing' | 'saving' | 'success';

export interface ManualSessionDialogProps {
  readonly isOpen: boolean;
  readonly existingSessionCount: number;
  readonly onClose: () => void;
  readonly onSave: (payload: SaveSessionPayload) => Promise<void>;
}

interface ManualCycleRowProps {
  readonly index: number;
  readonly draft: ManualCycleDraft;
  readonly canRemove: boolean;
  readonly isRemoving: boolean;
  readonly isDisabled: boolean;
  readonly cycleTimeError?: string;
  readonly boxCountError?: string;
  readonly onChange: (
    cycleId: string,
    field: 'cycleTimeInput' | 'boxCountInput',
    value: string,
  ) => void;
  readonly onRemove: (cycleId: string) => void;
}

function ManualCycleRow({
  index,
  draft,
  canRemove,
  isRemoving,
  isDisabled,
  cycleTimeError,
  boxCountError,
  onChange,
  onRemove,
}: ManualCycleRowProps): React.JSX.Element {
  return (
    <li
      className={[
        'rounded-2xl border bg-white p-3 shadow-sm transition-all duration-200 dark:bg-zinc-900/70 sm:p-4',
        isRemoving ? 'animate-manual-cycle-exit' : 'animate-manual-cycle-enter',
        cycleTimeError !== undefined || boxCountError !== undefined
          ? 'border-rose-300 dark:border-rose-500/40'
          : 'border-zinc-200 dark:border-zinc-800',
      ].join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
          Ciclo #{index + 1}
        </span>

        <button
          type="button"
          onClick={() => onRemove(draft.id)}
          disabled={!canRemove || isDisabled}
          aria-label={`Eliminar ciclo ${index + 1}`}
          className={[
            'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'text-rose-600 hover:bg-rose-50 active:bg-rose-100',
            'dark:text-rose-400 dark:hover:bg-rose-950/40 dark:active:bg-rose-950/60',
          ].join(' ')}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`manual-cycle-time-${draft.id}`}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Tiempo de ciclo
          </label>
          <input
            id={`manual-cycle-time-${draft.id}`}
            type="text"
            inputMode="decimal"
            value={draft.cycleTimeInput}
            disabled={isDisabled}
            onChange={(event) =>
              onChange(draft.id, 'cycleTimeInput', event.target.value)
            }
            placeholder="02:35.40"
            className={[
              'min-h-12 w-full rounded-xl border bg-white px-3 font-mono text-sm font-semibold',
              'transition-colors duration-200 focus:outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
              'dark:bg-zinc-950 dark:text-zinc-50',
              cycleTimeError === undefined
                ? 'border-zinc-300 focus:border-emerald-500 focus:ring-emerald-500/30 dark:border-zinc-700'
                : 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500/50',
            ].join(' ')}
          />
          {cycleTimeError !== undefined && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {cycleTimeError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`manual-cycle-boxes-${draft.id}`}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Cajas
          </label>
          <input
            id={`manual-cycle-boxes-${draft.id}`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={draft.boxCountInput}
            disabled={isDisabled}
            onChange={(event) =>
              onChange(draft.id, 'boxCountInput', event.target.value)
            }
            placeholder="Ej: 24"
            className={[
              'min-h-12 w-full rounded-xl border bg-white px-3 text-sm font-semibold',
              'transition-colors duration-200 focus:outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
              'dark:bg-zinc-950 dark:text-zinc-50',
              boxCountError === undefined
                ? 'border-zinc-300 focus:border-emerald-500 focus:ring-emerald-500/30 dark:border-zinc-700'
                : 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500/50',
            ].join(' ')}
          />
          {boxCountError !== undefined && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {boxCountError}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export function ManualSessionDialog({
  isOpen,
  existingSessionCount,
  onClose,
  onSave,
}: ManualSessionDialogProps): React.JSX.Element | null {
  const [mode, setMode] = useState<ManualDialogMode>('editing');
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [cycleDrafts, setCycleDrafts] = useState<ManualCycleDraft[]>([
    createManualCycleDraft(),
  ]);
  const [removingCycleIds, setRemovingCycleIds] = useState<readonly string[]>(
    [],
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [cycleErrors, setCycleErrors] = useState<
    Record<string, ManualCycleFieldErrors>
  >({});
  const [savedSessionName, setSavedSessionName] = useState('');

  const defaultSessionName = resolveSessionName('', existingSessionCount);
  const totals = useMemo(
    () => computeManualSessionTotals(cycleDrafts),
    [cycleDrafts],
  );

  const resetForm = useCallback((): void => {
    setMode('editing');
    setSessionNameInput('');
    setCycleDrafts([createManualCycleDraft()]);
    setRemovingCycleIds([]);
    setValidationError(null);
    setCycleErrors({});
    setSavedSessionName('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (mode !== 'success') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
      resetForm();
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mode, onClose, resetForm]);

  const handleAddCycle = useCallback((): void => {
    if (mode !== 'editing') {
      return;
    }

    setCycleDrafts((previous) => [...previous, createManualCycleDraft()]);
    setValidationError(null);
  }, [mode]);

  const handleUpdateCycle = useCallback(
    (
      cycleId: string,
      field: 'cycleTimeInput' | 'boxCountInput',
      value: string,
    ): void => {
      setCycleDrafts((previous) =>
        previous.map((draft) =>
          draft.id === cycleId ? { ...draft, [field]: value } : draft,
        ),
      );
      setValidationError(null);
      setCycleErrors((previous) => {
        if (!(cycleId in previous)) {
          return previous;
        }

        const next = { ...previous };
        delete next[cycleId];
        return next;
      });
    },
    [],
  );

  const handleRemoveCycle = useCallback(
    (cycleId: string): void => {
      if (mode !== 'editing' || cycleDrafts.length <= 1) {
        return;
      }

      setRemovingCycleIds((previous) => [...previous, cycleId]);

      window.setTimeout(() => {
        setCycleDrafts((previous) =>
          previous.filter((draft) => draft.id !== cycleId),
        );
        setRemovingCycleIds((previous) =>
          previous.filter((id) => id !== cycleId),
        );
      }, 220);
    },
    [cycleDrafts.length, mode],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();

      if (mode !== 'editing') {
        return;
      }

      const validation = validateManualSessionDrafts(cycleDrafts);

      if (!validation.isValid) {
        setValidationError(validation.globalError);
        setCycleErrors(validation.cycleErrors);
        return;
      }

      const cycles = buildCycleRecordsFromDrafts(cycleDrafts);
      const sessionName = resolveSessionName(
        sessionNameInput,
        existingSessionCount,
      );

      setMode('saving');
      setValidationError(null);
      setCycleErrors({});

      try {
        await onSave({
          customName: sessionNameInput,
          cycles,
          totalSessionTimeMs: totals.totalSessionTimeMs,
        });

        setSavedSessionName(sessionName);
        setMode('success');
      } catch {
        setValidationError(
          'No se pudo guardar la sesión manual. Inténtalo de nuevo.',
        );
        setMode('editing');
      }
    },
    [
      cycleDrafts,
      existingSessionCount,
      mode,
      onSave,
      sessionNameInput,
      totals.totalSessionTimeMs,
    ],
  );

  if (!isOpen) {
    return null;
  }

  const isBusy = mode === 'saving';
  const isSuccess = mode === 'success';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/65 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onClick={isBusy || isSuccess ? undefined : onClose}
    >
      <div
        className="animate-manual-dialog-enter flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-session-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                <ClipboardPenLine className="h-5 w-5" aria-hidden="true" />
              </span>

              <div>
                <h2
                  id="manual-session-title"
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
                >
                  Registrar sesión manual
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Agrega ciclos con tiempo y cajas. El tiempo total es la suma de
                  cada ciclo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
              aria-label="Cerrar registro manual"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {isSuccess ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="h-7 w-7 animate-session-name-success" />
            </span>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Sesión guardada
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {savedSessionName}
              </span>{' '}
              ya está disponible para exportar en PDF.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="mb-4">
                <label
                  htmlFor="manual-session-name"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Nombre de la sesión (opcional)
                </label>
                <input
                  id="manual-session-name"
                  type="text"
                  maxLength={80}
                  disabled={isBusy}
                  value={sessionNameInput}
                  onChange={(event) => setSessionNameInput(event.target.value)}
                  placeholder={defaultSessionName}
                  className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>

              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Ciclos registrados
                </h3>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {cycleDrafts.length}
                </span>
              </div>

              <ul className="space-y-3">
                {cycleDrafts.map((draft, index) => {
                  const fieldErrors = cycleErrors[draft.id];

                  return (
                    <ManualCycleRow
                      key={draft.id}
                      index={index}
                      draft={draft}
                      canRemove={cycleDrafts.length > 1}
                      isRemoving={removingCycleIds.includes(draft.id)}
                      isDisabled={isBusy}
                      cycleTimeError={fieldErrors?.cycleTime}
                      boxCountError={fieldErrors?.boxCount}
                      onChange={handleUpdateCycle}
                      onRemove={handleRemoveCycle}
                    />
                  );
                })}
              </ul>

              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                disabled={isBusy}
                leadingIcon={<Plus className="h-5 w-5" />}
                onClick={handleAddCycle}
                className="mt-3"
              >
                Agregar ciclo
              </Button>

              {validationError !== null && (
                <p
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-300"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
            </div>

            <footer className="border-t border-zinc-200 bg-zinc-50/90 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-6">
              <dl className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs dark:border-emerald-500/30 dark:bg-emerald-950/20">
                <div>
                  <dt className="text-zinc-500">Tiempo total</dt>
                  <dd className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatElapsedTime(totals.totalSessionTimeMs)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Ciclos</dt>
                  <dd className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {totals.totalCycles}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Cajas</dt>
                  <dd className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {totals.totalBoxes}
                  </dd>
                </div>
              </dl>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={isBusy}
                  onClick={onClose}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isBusy}
                  leadingIcon={
                    isBusy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )
                  }
                >
                  {isBusy ? 'Guardando sesión…' : 'Guardar sesión manual'}
                </Button>
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
