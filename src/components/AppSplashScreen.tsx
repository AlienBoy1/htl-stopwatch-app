/**
 * AppSplashScreen.tsx
 *
 * Propósito: Pantalla de carga inicial con animación del logo HTL StopWatch
 * al abrir la aplicación.
 *
 * Responsabilidades:
 * - Mostrar overlay de carga a pantalla completa.
 * - Animar el icono corporativo con pulso y anillo rotatorio.
 * - Soportar transición de salida suave hacia la interfaz principal.
 *
 * Rol en la arquitectura: Componente transitorio de bootstrap visual de la PWA.
 */

import {
  HTL_STOPWATCH_ICON_ALT,
  HTL_STOPWATCH_ICON_PATH,
} from '../constants/assets';

export interface AppSplashScreenProps {
  readonly isExiting?: boolean;
}

export function AppSplashScreen({
  isExiting = false,
}: AppSplashScreenProps): React.JSX.Element {
  const visibilityClass = isExiting
    ? 'pointer-events-none opacity-0'
    : 'opacity-100';

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950',
        'transition-opacity duration-500 ease-out',
        visibilityClass,
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-busy={!isExiting}
      aria-label="Cargando HTL StopWatch"
    >
      {/* Contenedor del logo con anillo animado que simula actividad de carga */}
      <div className="relative flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40">
        <div
          className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 animate-splash-ring rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-500/40"
          aria-hidden="true"
        />
        <div
          className="absolute inset-3 animate-splash-ring-reverse rounded-full border-2 border-transparent border-b-amber-400/70 border-l-amber-500/30"
          aria-hidden="true"
        />

        <img
          src={HTL_STOPWATCH_ICON_PATH}
          alt={HTL_STOPWATCH_ICON_ALT}
          className="relative z-10 h-24 w-24 animate-splash-pulse object-contain sm:h-28 sm:w-28"
          width={112}
          height={112}
          decoding="async"
        />
      </div>

      <p className="mt-8 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-500">
        Cargando cronómetro…
      </p>
    </div>
  );
}
