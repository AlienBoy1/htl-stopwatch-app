/**
 * SessionNameField.tsx
 *
 * Propósito: Edición inline del nombre de una sesión guardada con feedback visual.
 *
 * Responsabilidades:
 * - Alternar entre vista, edición, guardado y confirmación animada.
 * - Validar y enviar el nuevo nombre al callback de persistencia.
 *
 * Rol en la arquitectura: Componente de UI especializado en renombrado de sesiones.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { normalizeRenamedSessionName } from '../utils/sessionNaming';

type SessionNameMode = 'view' | 'editing' | 'saving' | 'success';

export interface SessionNameFieldProps {
  readonly sessionId: string;
  readonly name: string;
  readonly sessionNumber: number;
  readonly onRename: (sessionId: string, customName: string) => Promise<void>;
}

interface SessionNameIconButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly children: React.ReactNode;
}

function SessionNameIconButton({
  label,
  onClick,
  disabled = false,
  className = '',
  children,
}: SessionNameIconButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function SessionNameField({
  sessionId,
  name,
  sessionNumber,
  onRename,
}: SessionNameFieldProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<SessionNameMode>('view');
  const [draftName, setDraftName] = useState(name);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'view' || mode === 'success') {
      setDraftName(name);
    }
  }, [name, mode]);

  useEffect(() => {
    if (mode !== 'editing') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'success') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMode('view');
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mode]);

  const startEditing = useCallback((): void => {
    setDraftName(name);
    setErrorMessage(null);
    setMode('editing');
  }, [name]);

  const cancelEditing = useCallback((): void => {
    setDraftName(name);
    setErrorMessage(null);
    setMode('view');
  }, [name]);

  const submitRename = useCallback(async (): Promise<void> => {
    const nextName = normalizeRenamedSessionName(draftName, sessionNumber);

    if (nextName === name) {
      setMode('view');
      return;
    }

    setMode('saving');
    setErrorMessage(null);

    try {
      await onRename(sessionId, draftName);
      setMode('success');
    } catch {
      setErrorMessage('No se pudo actualizar el nombre. Inténtalo de nuevo.');
      setMode('editing');
    }
  }, [draftName, name, onRename, sessionId, sessionNumber]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submitRename();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  const isBusy = mode === 'saving';
  const fallbackName = normalizeRenamedSessionName('', sessionNumber);

  return (
    <div className="min-w-0">
      <div
        className={[
          'relative rounded-xl transition-all duration-300',
          mode === 'editing' || mode === 'saving'
            ? 'bg-zinc-50 p-1.5 dark:bg-zinc-950/50'
            : '',
          mode === 'success' ? 'animate-session-name-success' : '',
        ].join(' ')}
      >
        {mode === 'view' && (
          <div className="animate-session-name-enter flex min-w-0 items-center gap-1">
            <p className="min-w-0 flex-1 truncate font-semibold text-zinc-900 dark:text-zinc-100">
              {name}
            </p>

            <SessionNameIconButton
              label={`Editar nombre de ${name}`}
              onClick={startEditing}
              className="text-zinc-500 hover:bg-zinc-100 hover:text-emerald-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </SessionNameIconButton>
          </div>
        )}

        {mode === 'success' && (
          <div className="animate-session-name-enter flex min-w-0 items-center gap-2">
            <Check
              className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <p className="min-w-0 flex-1 truncate font-semibold text-emerald-700 dark:text-emerald-300">
              {name}
            </p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Actualizado
            </span>
          </div>
        )}

        {(mode === 'editing' || mode === 'saving') && (
          <div className="animate-session-name-enter flex min-w-0 items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              maxLength={80}
              value={draftName}
              disabled={isBusy}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={fallbackName}
              aria-label="Nuevo nombre de la sesión"
              className={[
                'min-h-9 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm font-semibold text-zinc-900',
                'transition-all duration-200',
                'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
                'disabled:cursor-wait disabled:opacity-70',
                'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
                errorMessage === null
                  ? 'border-zinc-300 dark:border-zinc-700'
                  : 'border-rose-400 dark:border-rose-500/60',
              ].join(' ')}
            />

            {isBusy ? (
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-emerald-600 dark:text-emerald-400"
                aria-live="polite"
                aria-label="Guardando nombre"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              </span>
            ) : (
              <>
                <SessionNameIconButton
                  label="Confirmar nuevo nombre"
                  onClick={() => {
                    void submitRename();
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </SessionNameIconButton>

                <SessionNameIconButton
                  label="Cancelar edición"
                  onClick={cancelEditing}
                  className="text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </SessionNameIconButton>
              </>
            )}
          </div>
        )}

        {isBusy && (
          <p className="mt-1.5 px-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Guardando nombre…
          </p>
        )}
      </div>

      {errorMessage !== null && !isBusy && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
