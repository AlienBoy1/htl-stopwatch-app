/**
 * generate-icons.mjs
 *
 * Propósito: Generar iconos PWA en tamaños estándar a partir del logo
 * corporativo htl_stopwatch_icon.png.
 *
 * Responsabilidades:
 * - Redimensionar el asset fuente sin distorsionar la proporción.
 * - Escribir icon-192x192.png e icon-512x512.png para el manifiesto.
 *
 * Rol en la arquitectura: Script de build previo a la compilación de producción.
 */

import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');
const sourceIconPath = join(iconsDir, 'htl_stopwatch_icon.png');

const sizes = [192, 512];

try {
  await access(sourceIconPath);
} catch {
  console.error(
    'No se encontró public/icons/htl_stopwatch_icon.png. Coloca el logo antes del build.',
  );
  process.exit(1);
}

for (const size of sizes) {
  await sharp(sourceIconPath)
    .resize(size, size, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } })
    .png()
    .toFile(join(iconsDir, `icon-${size}x${size}.png`));

  console.log(`Generated icon-${size}x${size}.png from htl_stopwatch_icon.png`);
}
