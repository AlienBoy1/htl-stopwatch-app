/**
 * ConfirmDialog.tsx
 *
 * Propósito: Diálogo modal reutilizable de confirmación dentro de la aplicación.
 *
 * Responsabilidades:
 * - Mostrar título, mensaje y acciones Cancelar / Confirmar sin usar alertas del navegador.
 * - Soportar variantes visuales según la severidad de la acción (p. ej. eliminación).
 * - Garantizar accesibilidad con roles ARIA y cierre por overlay o botón.
 *
 * Rol en la arquitectura: Componente transitorio de confirmación genérico de la UI.
 */

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './ui/Button';

/** Variante visual del diálogo según el tipo de acción confirmada. */
export type ConfirmDialogVariant = 'danger' | 'default';

export interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly variant?: ConfirmDialogVariant;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onClose,
  onConfirm,
}: ConfirmDialogProps): React.JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  const isDanger = variant === 'danger';

  const iconWrapperClass = isDanger
    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';

  const Icon = isDanger ? Trash2 : AlertTriangle;

  const handleConfirm = (): void => {
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 sm:p-6"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-start gap-3">
          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              iconWrapperClass,
            ].join(' ')}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-message"
              className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
            >
              {message}
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button type="button" variant="outline" size="lg" fullWidth onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDanger ? 'danger' : 'primary'}
            size="lg"
            fullWidth
            leadingIcon={isDanger ? <Trash2 className="h-5 w-5" /> : undefined}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
