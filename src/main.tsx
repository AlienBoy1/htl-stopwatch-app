/**
 * main.tsx
 *
 * Propósito: Punto de entrada de la aplicación React en el DOM.
 *
 * Responsabilidades:
 * - Montar el árbol de componentes en el elemento #root.
 * - Montar ThemeProvider y AppRoot con soporte de tema claro/oscuro.
 *
 * Rol en la arquitectura: Bootstrap de la capa de presentación cliente.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { ThemeProvider } from './context/ThemeProvider.tsx';
import './index.css';
import { AppRoot } from './AppRoot.tsx';

/**
 * Registra el Service Worker generado por vite-plugin-pwa (estrategia GenerateSW)
 * para habilitar caché offline y actualizaciones automáticas de la PWA.
 */
registerSW({ immediate: true });

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('No se encontró el elemento #root en index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <AppRoot />
    </ThemeProvider>
  </StrictMode>,
);
