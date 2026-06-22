/**
 * AppNavbar.tsx
 *
 * Propósito: Barra de navegación superior fija con branding y controles globales.
 *
 * Responsabilidades:
 * - Agrupar logo, título corporativo HTL Electronics y toggle de tema.
 * - Mantener visibilidad al hacer scroll con estilo sticky y fondo translúcido.
 * - Adaptar el layout a móvil y desktop con áreas táctiles amplias.
 *
 * Rol en la arquitectura: Componente de layout global de la PWA.
 */

import { AppLogo } from './AppLogo';
import { ThemeToggle } from './ThemeToggle';

export function AppNavbar(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <nav
        className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6"
        aria-label="Navegación principal"
      >
        {/* Marca: logo + identidad HTL Electronics */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
          <AppLogo size="sm" showFrame className="!p-1" />

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-base">
              HTL Electronics
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-500 sm:text-xs">
              StopWatch
            </p>
          </div>
        </div>

        {/* Controles globales alineados a la derecha */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
