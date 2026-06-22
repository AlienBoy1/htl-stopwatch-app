/**
 * AppLogo.tsx
 *
 * Propósito: Renderizar el logo corporativo HTL StopWatch de forma consistente
 * en distintos contextos de la interfaz (cabecera, splash, etc.).
 *
 * Responsabilidades:
 * - Mostrar el asset htl_stopwatch_icon con tamaños parametrizables.
 * - Aplicar estilos de contenedor opcionales (marco, resplandor sutil).
 *
 * Rol en la arquitectura: Componente de presentación reutilizable de branding.
 */

import {
  HTL_STOPWATCH_ICON_ALT,
  HTL_STOPWATCH_ICON_PATH,
} from '../constants/assets';

/** Tamaños predefinidos del logo según contexto de uso. */
export type AppLogoSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AppLogoProps {
  readonly size?: AppLogoSize;
  readonly showFrame?: boolean;
  readonly className?: string;
}

/** Mapa de clases Tailwind por tamaño de imagen. */
const SIZE_CLASSES: Record<AppLogoSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14 sm:h-16 sm:w-16',
  lg: 'h-20 w-20',
  xl: 'h-28 w-28 sm:h-32 sm:w-32',
};

export function AppLogo({
  size = 'md',
  showFrame = true,
  className = '',
}: AppLogoProps): React.JSX.Element {
  const frameClass = showFrame
    ? 'rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg shadow-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900/80'
    : '';

  return (
    <div
      className={['shrink-0', frameClass, className].filter(Boolean).join(' ')}
    >
      <img
        src={HTL_STOPWATCH_ICON_PATH}
        alt={HTL_STOPWATCH_ICON_ALT}
        className={['object-contain', SIZE_CLASSES[size]].join(' ')}
        width={size === 'xl' ? 128 : size === 'lg' ? 80 : size === 'md' ? 64 : 40}
        height={size === 'xl' ? 128 : size === 'lg' ? 80 : size === 'md' ? 64 : 40}
        decoding="async"
      />
    </div>
  );
}
