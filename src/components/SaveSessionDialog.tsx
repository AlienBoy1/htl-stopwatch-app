/**
 * SaveSessionDialog.tsx
 *
 * Propósito: Diálogo modal para nombrar y confirmar el guardado de una sesión.
 *
 * Responsabilidades:
 * - Solicitar nombre opcional al operario antes de persistir.
 * - Mostrar el nombre por defecto que se aplicará si el campo queda vacío.
 * - Gestionar cierre, confirmación y accesibilidad del formulario modal.
 *
 * Rol en la arquitectura: Componente transitorio de captura de metadatos de sesión.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { resolveSessionName } from '../utils/sessionNaming';
import { Button } from './ui/Button';

export interface SaveSessionDialogProps {
  readonly isOpen: boolean;
  readonly existingSessionCount: number;
  readonly onClose: () => void;
  readonly onConfirm: (customName: string) => void;
}

export function SaveSessionDialog({
  isOpen,
  existingSessionCount,
  onClose,
  onConfirm,
}: SaveSessionDialogProps): React.JSX.Element | null {
  const [nameInput, setNameInput] = useState('');

  const defaultName = resolveSessionName('', existingSessionCount);

  /**
   * Reinicia el campo al abrir el diálogo para no arrastrar nombres previos.
   */
  useEffect(() => {
    if (isOpen) {
      setNameInput('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onConfirm(nameInput);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-session-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="save-session-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
            >
              Guardar sesión
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Asigna un nombre o deja el campo vacío para usar{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {defaultName}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Cerrar diálogo"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="session-name"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nombre de la sesión (opcional)
            </label>
            <input
              id="session-name"
              type="text"
              maxLength={80}
              autoFocus
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder={defaultName}
              className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" size="lg" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              leadingIcon={<Save className="h-5 w-5" />}
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
