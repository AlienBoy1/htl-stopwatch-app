/**
 * Button.tsx
 *
 * Propósito: Componente de botón reutilizable con variantes industriales,
 * áreas táctiles amplias y soporte de accesibilidad.
 *
 * Responsabilidades:
 * - Unificar estilos de acciones primarias, secundarias y destructivas.
 * - Garantizar altura mínima de 48px para uso en planta con guantes o táctil.
 * - Exponer una API tipada y extensible mediante props nativas de button.
 *
 * Rol en la arquitectura: Capa de UI primitiva reutilizada por App y futuros módulos.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Variantes visuales alineadas con la semántica de acciones logísticas. */
export type ButtonVariant =
  | 'primary'
  | 'cycle'
  | 'danger'
  | 'ghost'
  | 'outline';

/** Tamaños con foco en legibilidad y área de contacto en móvil. */
export type ButtonSize = 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
}

/** Mapa de clases Tailwind por variante de color de acento. */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus-visible:ring-emerald-400',
  cycle:
    'bg-amber-500 text-zinc-950 hover:bg-amber-400 active:bg-amber-600 focus-visible:ring-amber-300',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 focus-visible:ring-rose-400',
  ghost:
    'bg-transparent text-zinc-600 hover:bg-zinc-200 active:bg-zinc-300 focus-visible:ring-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500',
  outline:
    'border border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200 focus-visible:ring-zinc-400 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 dark:focus-visible:ring-zinc-500',
};

/** Mapa de clases por tamaño; `lg` y `xl` superan el mínimo táctil de 48px. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-4 py-2 text-sm',
  lg: 'min-h-14 px-6 py-3 text-base',
  xl: 'min-h-16 px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps): React.JSX.Element {
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled
    ? 'cursor-not-allowed opacity-50 pointer-events-none'
    : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold shadow-sm',
        'transition-all duration-150 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        widthClass,
        disabledClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {leadingIcon !== undefined && (
        <span className="shrink-0" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
      {trailingIcon !== undefined && (
        <span className="shrink-0" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
}
