/**
 * ThemeProvider.tsx
 *
 * Propósito: Proveer el estado global del tema claro/oscuro a toda la aplicación.
 *
 * Responsabilidades:
 * - Sincronizar la clase `dark` en document.documentElement.
 * - Persistir la preferencia del usuario en localStorage.
 * - Actualizar meta theme-color para navegador y PWA instalada.
 *
 * Rol en la arquitectura: Capa de contexto transversal de apariencia visual.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { THEME_META_COLORS } from '../constants/theme';
import type { ColorScheme, ThemeContextValue } from '../types/theme.types';
import {
  getStoredColorScheme,
  saveColorScheme,
} from '../utils/themeStorage';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  readonly children: ReactNode;
}

/**
 * Aplica el esquema de color al DOM: clase dark, meta tags y color-scheme nativo.
 */
function applyColorSchemeToDocument(scheme: ColorScheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', scheme === 'dark');
  root.style.colorScheme = scheme;

  const { themeColor } = THEME_META_COLORS[scheme];
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  themeMeta?.setAttribute('content', themeColor);

  const appleStatusMeta = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  appleStatusMeta?.setAttribute(
    'content',
    scheme === 'dark' ? 'black-translucent' : 'default',
  );
}

export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    getStoredColorScheme,
  );

  /**
   * Sincroniza DOM y almacenamiento cada vez que cambia el esquema activo.
   */
  useEffect(() => {
    applyColorSchemeToDocument(colorScheme);
    saveColorScheme(colorScheme);
  }, [colorScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme): void => {
    setColorSchemeState(scheme);
  }, []);

  const toggleColorScheme = useCallback((): void => {
    setColorSchemeState((current) =>
      current === 'dark' ? 'light' : 'dark',
    );
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      setColorScheme,
      toggleColorScheme,
      isDark: colorScheme === 'dark',
    }),
    [colorScheme, setColorScheme, toggleColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook de consumo del contexto de tema con validación en tiempo de ejecución.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }

  return context;
}
