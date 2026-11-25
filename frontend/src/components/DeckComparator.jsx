import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Layers, GitCompare, List, LayoutGrid, Check } from 'lucide-react';
import { showHoverCard, hideHoverCard } from './DeckManager';

export default function DeckComparator({ deck1Id, deck2Id, API_URL, collection, onBack, onCreateMergedDeck }) {
  const [deck1, setDeck1] = useState(null);
  const [deck2, setDeck2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [mobileTab, setMobileTab] = useState('unique1'); // 'unique1' | 'shared' | 'unique2' | 'merged'
  const [selectedExtras, setSelectedExtras] = useState({});

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const [res1, res2] = await Promise.all([
          fetch(`${API_URL}/decks/${deck1Id}`),
          fetch(`${API_URL}/decks/${deck2Id}`)
        ]);
        const data1 = await res1.json();
        const data2 = await res2.json();
        setDeck1(data1);
        setDeck2(data2);
      } catch (err) {
        console.error('Error fetching decks for comparison:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, [deck1Id, deck2Id, API_URL]);

  const sections = ['legend', 'champion', 'rune', 'battlefield', 'main', 'sideboard'];

  const comparisonData = useMemo(() => {
    if (!deck1 || !deck2) return null;
    const data = {};
    sections.forEach(section => {
      const s1 = deck1.cards.filter(c => c.section === section);
      const s2 = deck2.cards.filter(c => c.section === section);
      const allCardIds = new Set([...s1.map(c => c.card_id), ...s2.map(c => c.card_id)]);

      const unique1 = [];
      const shared = [];
      const unique2 = [];

      allCardIds.forEach(id => {
        const c1 = s1.find(c => c.card_id === id);
        const c2 = s2.find(c => c.card_id === id);
        const q1 = c1 ? c1.quantity : 0;
        const q2 = c2 ? c2.quantity : 0;
        const cardData = c1 || c2;

        if (q1 > 0 && q2 > 0) {
          const minQ = Math.min(q1, q2);
          shared.push({ ...cardData, quantity: minQ });
          if (q1 > q2) unique1.push({ ...cardData, quantity: q1 - q2 });
          else if (q2 > q1) unique2.push({ ...cardData, quantity: q2 - q1 });
        } else if (q1 > 0) {
          unique1.push({ ...cardData, quantity: q1 });
        } else if (q2 > 0) {
          unique2.push({ ...cardData, quantity: q2 });
        }
      });

      data[section] = { unique1, shared, unique2 };
    });
    return data;
  }, [deck1, deck2]);

  const getMergedCardsForSection = (sectionName) => {
    if (!comparisonData) return [];
    const { shared, unique1, unique2 } = comparisonData[sectionName];
    const map = new Map();

    shared.forEach(c => map.set(c.card_id, { ...c, quantity: c.quantity }));

    const addUnique = (uniqueCards) => {
      uniqueCards.forEach(c => {
        const key = `${c.card_id}_${sectionName}`;
        const selectedQty = selectedExtras[key] || 0;
        if (selectedQty > 0) {
          if (map.has(c.card_id)) map.get(c.card_id).quantity += selectedQty;
          else map.set(c.card_id, { ...c, quantity: selectedQty });
        }
      });
    };

    addUnique(unique1);
    addUnique(unique2);
    return Array.from(map.values()).sort((a, b) => (a.energy_cost || 0) - (b.energy_cost || 0));
  };

  const handleCreateDeck = () => {
    const allMerged = [];
    sections.forEach(sec => {
      getMergedCardsForSection(sec).forEach(c => allMerged.push({ ...c, section: sec }));
    });
    if (onCreateMergedDeck) onCreateMergedDeck(allMerged);
  };

  const toggleExtra = (card, section, maxQty) => {
    const key = `${card.card_id}_${section}`;
    setSelectedExtras(prev => {
      const current = prev[key] || 0;
      const next = current === maxQty ? 0 : current + 1;
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const totals = useMemo(() => {
    if (!comparisonData) return { u1: 0, shared: 0, u2: 0, merged: 0 };
    let u1 = 0, shared = 0, u2 = 0, merged = 0;
    sections.forEach(sec => {
      u1 += comparisonData[sec].unique1.reduce((a, c) => a + c.quantity, 0);
      shared += comparisonData[sec].shared.reduce((a, c) => a + c.quantity, 0);
      u2 += comparisonData[sec].unique2.reduce((a, c) => a + c.quantity, 0);
      merged += getMergedCardsForSection(sec).reduce((a, c) => a + c.quantity, 0);
    });
    return { u1, shared, u2, merged };
  }, [comparisonData, selectedExtras]);

  if (loading || !comparisonData) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-app justify-center items-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#B45309]/20 border-t-[#B45309] animate-spin" />
        <p className="text-ink-secondary mt-4 text-sm font-medium">Cargando mazos para comparar...</p>
      </div>
    );
  }

  const renderCardRow = (c, accent, isInteractive = false, selectedQty = 0, availableQty = 0, onClick = null) => {
    const isFullySelected = isInteractive && selectedQty > 0 && selectedQty === availableQty;
    const isPartiallySelected = isInteractive && selectedQty > 0 && selectedQty < availableQty;

    const qtyBadge =
      accent === 'red'
        ? 'bg-red-50 dark:bg-red-950/50 text-[#B91C1C] dark:text-red-300 border-red-200 dark:border-red-800'
        : accent === 'blue'
          ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border-blue-200 dark:border-blue-800'
          : 'bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border-[#FDE68A] dark:border-amber-700/60';

    return (
      <button
        key={c.card_id + c.section}
        type="button"
        onClick={onClick || undefined}
        disabled={!onClick}
        onMouseEnter={(e) => showHoverCard(c, e)}
        onMouseLeave={() => hideHoverCard()}
        className={`w-full min-h-[48px] flex items-center justify-between gap-2.5 p-2 rounded-[10px] border text-left transition-colors ${
          isFullySelected
            ? 'bg-subtle border-[#B45309]/50 opacity-75'
            : 'bg-surface border-line hover:bg-subtle'
        } ${onClick ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-subtle border border-line shrink-0">
            {c.image_url && (
              <img src={c.image_url} alt={c.name} className="w-full h-full object-cover object-[center_20%]" />
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-md border text-xs font-bold tabular-nums shrink-0 ${qtyBadge}`}>
            x{isInteractive ? availableQty : c.quantity}
          </span>
          <span className="text-sm font-semibold text-ink-primary truncate">{c.name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isPartiallySelected && (
            <span className="text-[11px] font-bold text-[#15803D] dark:text-green-300 bg-green-50 dark:bg-green-950/50 px-2 py-0.5 rounded-md border border-green-200 dark:border-green-800 tabular-nums">
              {selectedQty}/{availableQty}
            </span>
          )}
          {isFullySelected && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#15803D] px-2 py-0.5 rounded-md">
              <Check size={11} /> Añadida
            </span>
          )}
        </div>
      </button>
    );
  };

  const renderPreviewCard = (c, accent, isBattlefield, isInteractive = false, selectedQty = 0, availableQty = 0, onClick = null) => {
    const aspect = isBattlefield ? 'aspect-[88/63]' : 'aspect-[63/88]';
    const isFullySelected = isInteractive && selectedQty > 0 && selectedQty === availableQty;
    const isPartiallySelected = isInteractive && selectedQty > 0 && selectedQty < availableQty;

    return (
      <article
        key={c.card_id + c.section}
        onClick={onClick || undefined}
        onMouseEnter={(e) => showHoverCard(c, e)}
        onMouseLeave={() => hideHoverCard()}
        className={`rounded-xl overflow-hidden bg-surface border flex flex-col transition-colors ${
          isFullySelected ? 'border-[#15803D] opacity-75' : 'border-line hover:border-[#B45309]/60'
        } ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className={`relative ${aspect} w-full bg-subtle overflow-hidden`}>
          {c.image_url && (
            <img
              src={c.image_url}
              alt={c.name}
              className={`w-full h-full object-cover ${isBattlefield ? 'object-center' : 'object-top'}`}
            />
          )}
        </div>
        <div className="p-2 flex items-center justify-between gap-1 bg-surface border-t border-line">
          <span className="text-[11px] font-semibold text-ink-primary truncate">{c.name}</span>
          <span className="text-[11px] font-bold text-ink-secondary shrink-0 tabular-nums">
            {isPartiallySelected ? `${selectedQty}/${availableQty}` : `x${isInteractive ? availableQty : c.quantity}`}
          </span>
        </div>
      </article>
    );
  };

  const renderColumnItems = (items, accent, sectionName, isInteractive) => {
    if (items.length === 0) {
      return <p className="text-xs text-ink-muted py-3 text-center">Sin cartas</p>;
    }
    if (viewMode === 'list') {
      return (
        <div className="space-y-1.5">
          {items.map(c => {
            const selQty = selectedExtras[`${c.card_id}_${sectionName}`] || 0;
            return renderCardRow(
              c,
              accent,
              isInteractive,
              selQty,
              c.quantity,
              isInteractive ? () => toggleExtra(c, sectionName, c.quantity) : null
            );
          })}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map(c => {
          const selQty = selectedExtras[`${c.card_id}_${sectionName}`] || 0;
          return renderPreviewCard(
            c,
            accent,
            sectionName === 'battlefield',
            isInteractive,
            selQty,
            c.quantity,
            isInteractive ? () => toggleExtra(c, sectionName, c.quantity) : null
          );
        })}
      </div>
    );
  };

  const sectionTitle = (sec) => (sec === 'main' ? 'Main Deck' : sec.charAt(0).toUpperCase() + sec.slice(1));

  const mergedPanelContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-line bg-subtle/50">
        <h2 className="text-base sm:text-lg font-extrabold text-ink-primary font-display flex items-center gap-2">
          <Layers size={18} className="text-[#B45309]" /> Mazo Combinado
        </h2>
        <p className="text-xs text-ink-secondary mt-1">
          Toca cartas únicas para añadirlas al mazo combinado.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {sections.map(sec => {
          const cards = getMergedCardsForSection(sec);
          if (cards.length === 0 && sec !== 'main' && sec !== 'legend' && sec !== 'champion') return null;
          const total = cards.reduce((a, c) => a + c.quantity, 0);
          const max = sec === 'legend' || sec === 'champion' ? 1 : sec === 'rune' ? 12 : sec === 'battlefield' ? 3 : sec === 'main' ? 40 : 10;

          return (
            <div key={sec} className="bg-app p-3 rounded-xl border border-line">
              <h4 className="text-[11px] uppercase font-bold mb-2.5 flex justify-between text-ink-secondary border-b border-line pb-2">
                <span>{sectionTitle(sec)}</span>
                <span className={total > max ? 'text-[#B91C1C]' : total === max ? 'text-[#15803D]' : 'text-[#B45309]'}>
                  {total}/{max}
                </span>
              </h4>
              <div className="space-y-1.5">
                {cards.length === 0 ? (
                  <p className="text-xs text-ink-muted text-center py-2">Vacío</p>
                ) : (
                  cards.map(c => renderCardRow(c, 'amber', false))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-line bg-surface">
        <button
          type="button"
          onClick={handleCreateDeck}
          className="w-full min-h-[44px] bg-[#B45309] hover:bg-[#92400E] text-white font-semibold py-2.5 px-4 rounded-[10px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <GitCompare size={18} /> Crear Mazo Combinado ({totals.merged})
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full bg-app overflow-hidden text-ink-primary">
      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-line p-3 sm:p-4 flex flex-col gap-3 bg-surface/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-subtle hover:bg-line rounded-[10px] text-ink-primary border border-line transition-colors shrink-0 cursor-pointer"
                aria-label="Volver"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-extrabold text-ink-primary font-display flex items-center gap-2 truncate">
                  <GitCompare size={20} className="text-[#B45309] shrink-0" />
                  <span className="truncate">Comparar Mazos</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-subtle p-1 rounded-[10px] border border-line shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`min-w-[40px] min-h-[38px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#B45309] text-white' : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="Vista Lista"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`min-w-[40px] min-h-[38px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'visual' ? 'bg-[#B45309] text-white' : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="Vista Visual"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          {/* Deck 1 vs Deck 2 Summary */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 py-2 px-3 rounded-xl min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#B91C1C] dark:text-red-400 block">Mazo 1</span>
              <span className="text-xs sm:text-sm font-bold text-ink-primary truncate block">{deck1.name}</span>
            </div>
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 py-2 px-3 rounded-xl min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#1D4ED8] dark:text-blue-400 block">Mazo 2</span>
              <span className="text-xs sm:text-sm font-bold text-ink-primary truncate block">{deck2.name}</span>
            </div>
          </div>

          {/* Mobile Tabs (375px-430px): Solo Mazo 1 | En ambos | Solo Mazo 2 | Combinado */}
          <div className="lg:hidden flex items-center gap-1 bg-subtle p-1 rounded-[10px] border border-line overflow-x-auto no-scrollbar">
            {[
              { id: 'unique1', label: `Mazo 1 (${totals.u1})` },
              { id: 'shared', label: `Comunes (${totals.shared})` },
              { id: 'unique2', label: `Mazo 2 (${totals.u2})` },
              { id: 'merged', label: `Combinado (${totals.merged})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMobileTab(tab.id)}
                className={`flex-1 min-h-[44px] px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                  mobileTab === tab.id
                    ? 'bg-[#B45309] text-white'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Mobile View (< lg) */}
        <div className="lg:hidden flex-1 overflow-y-auto p-3 pb-24 space-y-4 custom-scrollbar">
          {mobileTab === 'merged' ? (
            <div className="bg-surface border border-line rounded-xl overflow-hidden">
              {mergedPanelContent}
            </div>
          ) : (
            sections.map(sec => {
              const items = comparisonData[sec][mobileTab];
              if (items.length === 0) return null;
              const accent = mobileTab === 'unique1' ? 'red' : mobileTab === 'unique2' ? 'blue' : 'amber';
              const isInteractive = mobileTab !== 'shared';
              return (
                <div key={sec} className="bg-surface border border-line rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary">{sectionTitle(sec)}</h3>
                    <span className="text-xs font-bold text-ink-primary tabular-nums">
                      {items.reduce((a, c) => a + c.quantity, 0)}
                    </span>
                  </div>
                  {renderColumnItems(items, accent, sec, isInteractive)}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View (lg+) */}
        <div className="hidden lg:block flex-1 overflow-y-auto p-6 space-y-6 pb-12 custom-scrollbar">
          {sections.map(sec => {
            const { unique1, shared, unique2 } = comparisonData[sec];
            if (unique1.length === 0 && shared.length === 0 && unique2.length === 0) return null;
            return (
              <section key={sec} className="space-y-3">
                <h3 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider border-b border-line pb-2">
                  {sectionTitle(sec)}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface p-3 rounded-xl border border-line">
                    <h4 className="text-xs uppercase font-bold text-[#B91C1C] dark:text-red-400 mb-3 flex justify-between">
                      <span className="truncate">Solo {deck1.name}</span>
                      <span>{unique1.reduce((a, c) => a + c.quantity, 0)}</span>
                    </h4>
                    {renderColumnItems(unique1, 'red', sec, true)}
                  </div>

                  <div className="bg-surface p-3 rounded-xl border border-line">
                    <h4 className="text-xs uppercase font-bold text-[#B45309] mb-3 flex justify-between">
                      <span>En ambos</span>
                      <span>{shared.reduce((a, c) => a + c.quantity, 0)}</span>
                    </h4>
                    {renderColumnItems(shared, 'amber', sec, false)}
                  </div>

                  <div className="bg-surface p-3 rounded-xl border border-line">
                    <h4 className="text-xs uppercase font-bold text-[#1D4ED8] dark:text-blue-400 mb-3 flex justify-between">
                      <span className="truncate">Solo {deck2.name}</span>
                      <span>{unique2.reduce((a, c) => a + c.quantity, 0)}</span>
                    </h4>
                    {renderColumnItems(unique2, 'blue', sec, true)}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Desktop Right Sidebar: Merged Deck */}
      <aside className="hidden lg:flex w-[23rem] flex-col bg-surface border-l border-line shrink-0 h-full">
        {mergedPanelContent}
      </aside>
    </div>
  );
}
