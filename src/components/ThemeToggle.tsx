/**
 * ThemeToggle.tsx
 *
 * Propósito: Control accesible para alternar entre modo claro y modo oscuro.
 *
 * Responsabilidades:
 * - Mostrar iconografía intuitiva (sol / luna) según el tema activo.
 * - Invocar toggleColorScheme del contexto de tema.
 * - Mantener área táctil amplia para uso industrial en móvil.
 *
 * Rol en la arquitectura: Componente de UI de preferencias visuales globales.
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

export function ThemeToggle(): React.JSX.Element {
  const { colorScheme, toggleColorScheme, isDark } = useTheme();

  const label = isDark
    ? 'Cambiar a modo claro'
    : 'Cambiar a modo oscuro';

  return (
    <button
      type="button"
      onClick={toggleColorScheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={[
        'inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-xl',
        'border border-zinc-300 bg-zinc-100 text-zinc-700',
        'transition-colors duration-150',
        'hover:bg-zinc-200 active:bg-zinc-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50',
        'dark:border-zinc-700 dark:bg-zinc-900 dark:text-amber-300',
        'dark:hover:bg-zinc-800 dark:active:bg-zinc-700',
        'dark:focus-visible:ring-offset-zinc-950',
      ].join(' ')}
    >
      {colorScheme === 'dark' ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
