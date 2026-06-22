/**
 * AppRoot.tsx
 *
 * Propósito: Orquestar la transición entre la pantalla de carga inicial
 * y la aplicación principal.
 *
 * Responsabilidades:
 * - Garantizar una duración mínima de splash para percepción de marca.
 * - Coordinar el fade-out del loader y el montaje de App.
 *
 * Rol en la arquitectura: Compositor de arranque entre bootstrap y UI principal.
 */

import { useEffect, useState } from 'react';
import App from './App.tsx';
import { AppSplashScreen } from './components/AppSplashScreen.tsx';

/** Duración mínima visible del splash para que la animación sea perceptible. */
const MIN_SPLASH_MS = 1_000;

/** Duración de la animación de salida antes de desmontar el overlay. */
const SPLASH_EXIT_MS = 500;

type SplashPhase = 'loading' | 'exiting' | 'done';

export function AppRoot(): React.JSX.Element {
  const [phase, setPhase] = useState<SplashPhase>('loading');

  /**
   * Espera a que el documento esté listo y aplica un tiempo mínimo de splash
   * antes de iniciar la transición de salida hacia la interfaz principal.
   */
  useEffect(() => {
    const startedAt = performance.now();
    let exitTimer: ReturnType<typeof setTimeout> | null = null;
    let doneTimer: ReturnType<typeof setTimeout> | null = null;

    const beginExit = (): void => {
      const elapsed = performance.now() - startedAt;
      const delay = Math.max(0, MIN_SPLASH_MS - elapsed);

      exitTimer = setTimeout(() => {
        setPhase('exiting');

        doneTimer = setTimeout(() => {
          setPhase('done');
        }, SPLASH_EXIT_MS);
      }, delay);
    };

    if (document.readyState === 'complete') {
      beginExit();
    } else {
      window.addEventListener('load', beginExit, { once: true });
    }

    return () => {
      if (exitTimer !== null) {
        clearTimeout(exitTimer);
      }
      if (doneTimer !== null) {
        clearTimeout(doneTimer);
      }
    };
  }, []);

  return (
    <>
      <App />
      {phase !== 'done' && (
        <AppSplashScreen isExiting={phase === 'exiting'} />
      )}
    </>
  );
}
