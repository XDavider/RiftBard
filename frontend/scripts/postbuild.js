import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Ensure dist/venta/index.html exists for zero-config static routing on Vercel
const ventaDir = path.join(distDir, 'venta');
if (!fs.existsSync(ventaDir)) {
  fs.mkdirSync(ventaDir, { recursive: true });
}
const srcHtml = path.join(distDir, 'index.html');
const destHtml = path.join(ventaDir, 'index.html');

if (fs.existsSync(srcHtml)) {
  fs.copyFileSync(srcHtml, destHtml);
  console.log('✅ Generated static route: dist/venta/index.html');
}
