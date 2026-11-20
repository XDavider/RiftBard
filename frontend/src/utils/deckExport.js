const EXPORT_SECTIONS = [
  { key: 'legend', label: 'Legend:' },
  { key: 'champion', label: 'Champion:' },
  { key: 'rune', label: 'Runes:' },
  { key: 'battlefield', label: 'Battlefields:' },
  { key: 'main', label: 'MainDeck:' },
  { key: 'sideboard', label: 'SideBoard:' },
];

/**
 * Normalizes a card name for text decklist export.
 * Strips trailing printing/art variant suffixes (e.g. "(Alternate Art)", "(Overnumbered)")
 * and removes commas for Legend cards (e.g. "Vi, Piltover Enforcer" -> "Vi Piltover Enforcer").
 */
export function formatExportCardName(rawName, section) {
  let clean = String(rawName || '').replace(/\s*\([^)]+\)\s*$/, '').trim();
  if (String(section || '').toLowerCase() === 'legend') {
    clean = clean.replace(/,/g, '').replace(/\s+/g, ' ').trim();
  }
  return clean;
}

/**
 * Formats an array of deck cards (flat or nested `{ card, section, quantity }`)
 * into the standard Riftbound text export format.
 */
export function formatDeckForExport(cards = []) {
  if (!Array.isArray(cards) || cards.length === 0) return '';

  const blocks = [];

  for (const sec of EXPORT_SECTIONS) {
    const grouped = new Map();

    for (const item of cards) {
      if ((item?.section || '').toLowerCase() !== sec.key) continue;
      const rawName = item.card ? item.card.name : item.name;
      const name = formatExportCardName(rawName, sec.key);
      if (!name) continue;
      const qty = Number(item.quantity) || 1;
      if (qty <= 0) continue;
      grouped.set(name, (grouped.get(name) || 0) + qty);
    }

    if (grouped.size > 0) {
      const lines = [
        sec.label,
        ...Array.from(grouped.entries()).map(([name, qty]) => `${qty} ${name}`),
      ];
      blocks.push(lines.join('\n'));
    }
  }

  return blocks.join('\n\n');
}

/**
 * Copies plain text to the clipboard, falling back to a temporary textarea
 * when the Clipboard API is unavailable (e.g. non-HTTPS LAN contexts).
 */
export async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback
    }
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard unavailable in non-browser environment');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const copied = document.execCommand('copy');
    if (!copied) throw new Error('execCommand copy failed');
    return true;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Copies asynchronously resolved text while preserving the initial user gesture
 * via ClipboardItem when supported (Safari/iOS), with a fallback to writeText/execCommand.
 */
export async function copyAsyncTextToClipboard(textPromise) {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.write &&
    typeof ClipboardItem !== 'undefined'
  ) {
    try {
      const item = new ClipboardItem({
        'text/plain': Promise.resolve(textPromise).then(
          (t) => new Blob([t], { type: 'text/plain' })
        ),
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch {
      // Fall through to resolving text and copying normally
    }
  }

  const text = await textPromise;
  return copyTextToClipboard(text);
}
