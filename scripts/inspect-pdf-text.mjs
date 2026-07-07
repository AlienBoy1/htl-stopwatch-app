import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const buf = await readFile('public/templates/template_loops_report.pdf');
const data = await pdfParse(buf);
console.log('TEXT:\n', data.text);
console.log('pages', data.numpages);
