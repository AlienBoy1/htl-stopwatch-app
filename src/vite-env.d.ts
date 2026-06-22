/**
 * vite-env.d.ts
 *
 * Propósito: Declaraciones de tipos para módulos virtuales de Vite y PWA.
 *
 * Responsabilidades:
 * - Referenciar tipos del cliente Vite.
 * - Extender tipos para vite-plugin-pwa cuando sea necesario.
 *
 * Rol en la arquitectura: Soporte de tipado estricto en tiempo de compilación.
 */

/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    readonly immediate?: boolean;
    readonly onNeedRefresh?: () => void;
    readonly onOfflineReady?: () => void;
    readonly onRegistered?: (
      registration: ServiceWorkerRegistration | undefined,
    ) => void;
    readonly onRegisterError?: (error: unknown) => void;
  }

  export function registerSW(
    options?: RegisterSWOptions,
  ): (reloadPage?: boolean) => Promise<void>;
}
