import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Upload, Check } from 'lucide-react';
import { getDeckFromCode, getCodeFromDeck } from '@piltoverarchive/riftbound-deck-codes';
import { formatDeckForExport } from '../utils/deckExport';

export default function ImportExportModal({ isOpen, onClose, deckCards, deckName, setDeckCards, setDeckName, API_URL, onImportSuccess, initialMode = 'export' }) {
  const [mode, setMode] = useState(initialMode); // 'export' | 'import'
  const [format, setFormat] = useState('code'); // 'text' | 'code'
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialMode === 'export') {
        generateExport();
      }
    }
  }, [isOpen, initialMode, format, deckCards, deckName]);

  const generateExport = () => {
    const flat = {};
    deckCards.forEach(c => {
      const id = c.card ? c.card.id : c.card_id;
      flat[id] = (flat[id] || 0) + c.quantity;
    });

    if (format === 'text') {
      setExportText(formatDeckForExport(deckCards));
    } else if (format === 'code') {
      try {
        let mainDeckArr = [];
        let sideboardArr = [];
        let chosenChampion = undefined;

        deckCards.forEach(c => {
          // Priority to card_code, fallback to id
          let cardObj = c.card || c;
          let id = cardObj.card_code || cardObj.id || cardObj.card_id;
          
          if (c.section === 'sideboard') {
            sideboardArr.push({ cardCode: id, count: c.quantity });
          } else {
            mainDeckArr.push({ cardCode: id, count: c.quantity });
            if (c.section === 'champion') {
              chosenChampion = id;
            }
          }
        });
        const code = getCodeFromDeck(mainDeckArr, sideboardArr, chosenChampion);
        setExportText(code);
      } catch (e) {
        console.error(e);
        setExportText('Error generating code');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    try {
      setError(null);
      setLoading(true);
      const text = importText.trim();
      if (!text) throw new Error("Input is empty.");

      let parsedCards = []; // { id, qty }
      let newName = "Imported Deck";

      // 1. Detect format
      if (text.startsWith('C') && !text.includes(' ') && !text.includes('\n')) {
        // CODE format
        const deckData = getDeckFromCode(text);
        deckData.mainDeck.forEach(c => {
           let targetSec = 'main';
           if (c.cardCode === deckData.chosenChampion) targetSec = 'champion';
           parsedCards.push({ id: c.cardCode, qty: c.count, targetSection: targetSec });
        });
        deckData.sideboard.forEach(c => {
           parsedCards.push({ id: c.cardCode, qty: c.count, targetSection: 'sideboard' });
        });
      } else {
        // Text format
        const sections = ['Legend:', 'Champion:', 'MainDeck:', 'Battlefields:', 'Runes:', 'Sideboard:'];
        let safeText = text;
        sections.forEach(s => {
          safeText = safeText.replace(new RegExp(s, 'gi'), ` |||${s}||| `);
        });
        
        const blocks = safeText.split('|||').map(b => b.trim()).filter(b => b);
        let currentSection = 'main';
        
        for (const block of blocks) {
           const lower = block.toLowerCase();
           if (lower === 'legend:') { currentSection = 'legend'; continue; }
           if (lower === 'champion:') { currentSection = 'champion'; continue; }
           if (lower === 'maindeck:') { currentSection = 'main'; continue; }
           if (lower === 'battlefields:') { currentSection = 'battlefield'; continue; }
           if (lower === 'runes:') { currentSection = 'rune'; continue; }
           if (lower === 'sideboard:') { currentSection = 'sideboard'; continue; }
           
           // Card list block
           const cardParts = block.split(/(?=\b\d+\s+)/).map(p => p.trim()).filter(p => p);
           for (const p of cardParts) {
              const match = p.match(/^(\d+)\s+(.+)$/);
              if (match) {
                 parsedCards.push({ qty: parseInt(match[1]), name: match[2].trim(), targetSection: currentSection });
              }
           }
        }
      }

      if (parsedCards.length === 0) throw new Error("No cards found in input.");

      // 2. Fetch all cards to resolve IDs
      const res = await fetch(`${API_URL}/cards?limit=10000`);
      const allCards = await res.json();
      const cardMap = {};
      allCards.forEach(c => cardMap[c.id] = c);

      // 3. Build new deck
      const normalizeNoComma = (s) => s.replace(/,/g, '').replace(/\s+/g, ' ').trim();
      let newDeck = [];
      for (const p of parsedCards) {
        // Match by ID (or card_code) or Name
        const card = Object.values(cardMap).find(c => {
          if (p.id && (c.id === p.id || c.card_code === p.id)) return true;
          if (p.name) {
            const cName = c.name.toLowerCase();
            const pName = p.name.toLowerCase();
            return (
              cName === pName ||
              cName.replace(' - ', ', ') === pName ||
              cName.replace(',', ' -') === pName ||
              normalizeNoComma(cName) === normalizeNoComma(pName)
            );
          }
          return false;
        });

        if (!card) continue; // Skip unknown cards

        let section = p.targetSection || 'main';
        
        // Auto-correct section based on type if missing or default 'main'
        if (section === 'main') {
          const type = card.card_type?.toLowerCase();
          if (type === 'legend') section = 'legend';
          else if (type === 'rune') section = 'rune';
          else if (type === 'battlefield') section = 'battlefield';
        }

        newDeck.push({ card, section, quantity: p.qty });
      }

      // 4. Auto-assign Champion if missing
      const legend = newDeck.find(c => c.section === 'legend');
      const champion = newDeck.find(c => c.section === 'champion');
      
      if (legend && !champion) {
        const legBaseName = legend.card.name.split(/[-–,]/)[0].trim().toLowerCase();
        const potentialChamp = newDeck.find(c => c.section === 'main' && c.card.card_type?.toLowerCase() === 'unit' && c.card.name.toLowerCase().startsWith(legBaseName));
        
        if (potentialChamp) {
          if (potentialChamp.quantity > 1) {
            potentialChamp.quantity -= 1;
          } else {
            newDeck = newDeck.filter(c => c !== potentialChamp);
          }
          newDeck.push({ card: potentialChamp.card, section: 'champion', quantity: 1 });
        }
      }

      setDeckCards(newDeck);
      setDeckName(newName);
      setImportText('');
      onClose();
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to parse deck.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        className="bg-surface border border-line w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D0CEC6]" />
        </div>
        <header className="px-5 py-3.5 border-b border-line flex justify-between items-center bg-app">
          <h2 className="text-lg font-bold text-ink-primary font-display flex items-center gap-2">
            <Upload size={18} className="text-[#B45309]" />
            Importar Mazo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors rounded-[10px] hover:bg-subtle"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Text Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
              Pega los datos del mazo (TEXT o CODE)
            </label>
            <textarea
              className="w-full h-56 sm:h-64 bg-app border border-line rounded-[10px] p-3.5 text-base sm:text-sm text-ink-primary font-mono focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all resize-none placeholder:text-ink-muted"
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Pega aquí el código, JSON o texto del mazo..."
            />
            {error && mode === 'import' && (
              <p className="text-[#B91C1C] text-xs font-semibold bg-red-50 border border-red-200 p-2.5 rounded-lg">{error}</p>
            )}
          </div>
        </div>

        <footer className="px-5 py-3.5 border-t border-line bg-app flex justify-end gap-2.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:pb-3.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-ink-secondary hover:text-ink-primary bg-surface border border-line rounded-[10px] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !importText.trim()}
            className="min-h-[44px] flex items-center gap-2 px-5 py-2 bg-[#B45309] hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[10px] text-sm font-semibold transition-colors"
          >
            {loading ? <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span> : <Upload size={16} />}
            Importar Mazo
          </button>
        </footer>
      </div>
    </div>
  );
}
