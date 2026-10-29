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
  let html = fs.readFileSync(srcHtml, 'utf8');

  // Replace Title & Description for the Sale Page
  html = html.replace(
    /<title>.*?<\/title>/,
    '<title>🃏 Mis Cartas a la Venta | RiftBard</title>'
  );
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    '<meta name="description" content="Catálogo de cartas disponibles para compra o cambio en Riftbound TCG. Precios basados en el mínimo de Cardmarket España. ¡Elige tus cartas y pídeme la lista directamente!" />'
  );

  // Replace Open Graph Tags
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    '<meta property="og:url" content="https://riftbard.vercel.app/venta" />'
  );
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    '<meta property="og:title" content="🃏 Mis Cartas a la Venta | RiftBard" />'
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    '<meta property="og:description" content="Catálogo de cartas disponibles para compra o cambio en Riftbound TCG (Precios mín. Cardmarket España). Elige tus cartas y pídeme la lista directamente." />'
  );

  // Replace Schema.org / WhatsApp itemprop tags
  html = html.replace(
    /<meta itemprop="name" content=".*?" \/>/,
    '<meta itemprop="name" content="🃏 Mis Cartas a la Venta | RiftBard" />'
  );
  html = html.replace(
    /<meta itemprop="description" content=".*?" \/>/,
    '<meta itemprop="description" content="Catálogo de cartas disponibles para compra o cambio en Riftbound TCG (Precios mín. Cardmarket España)." />'
  );

  // Replace Twitter Card Tags
  html = html.replace(
    /<meta name="twitter:url" content=".*?" \/>/,
    '<meta name="twitter:url" content="https://riftbard.vercel.app/venta" />'
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    '<meta name="twitter:title" content="🃏 Mis Cartas a la Venta | RiftBard" />'
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    '<meta name="twitter:description" content="Catálogo de cartas disponibles para compra o cambio en Riftbound TCG (Precios mín. Cardmarket España)." />'
  );

  fs.writeFileSync(destHtml, html, 'utf8');
  console.log('✅ Generated static route with sale Open Graph metadata: dist/venta/index.html');
}
