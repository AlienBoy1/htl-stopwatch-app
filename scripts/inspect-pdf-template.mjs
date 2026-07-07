import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';

const bytes = await readFile('public/templates/template_loops_report.pdf');
const pdf = await PDFDocument.load(bytes);

console.log('pages', pdf.getPageCount());
const form = pdf.getForm();
const fields = form.getFields();
console.log('fields', fields.length);
for (const field of fields) {
  console.log(field.getName(), field.constructor.name);
}

const page = pdf.getPage(0);
const { width, height } = page.getSize();
console.log('page size', width, height);
