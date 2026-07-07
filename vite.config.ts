/**
 * vite.config.ts
 *
 * Propósito: Configuración del bundler Vite con React, Tailwind y PWA.
 *
 * Responsabilidades:
 * - Registrar plugins de compilación (React, Tailwind, vite-plugin-pwa).
 * - Definir estrategia GenerateSW para caché offline de assets estáticos.
 * - Sincronizar metadatos del manifiesto con public/manifest.json.
 *
 * Rol en la arquitectura: Configuración de build y ciclo de vida del Service Worker.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/htl_stopwatch_icon.png',
        'icons/*.png',
        'templates/*.pdf',
      ],
      strategies: 'generateSW',
      manifest: {
        name: 'HTL StopWatch — Cronómetro de Paletizado',
        short_name: 'HTL StopWatch',
        description:
          'PWA industrial para medir ciclos de paletizado de cajas en entornos logísticos.',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        icons: [
          {
            src: '/icons/htl_stopwatch_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/htl_stopwatch_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,pdf}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
