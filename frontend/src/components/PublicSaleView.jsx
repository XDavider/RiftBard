import React, { useState, useEffect, useMemo, useRef } from 'react';
import appLogo from '../assets/logo.png';
import {
  Search, Filter, ShoppingBag, X, Copy,
  RotateCcw, Sparkles, ArrowUpDown, Instagram,
  Star, BookmarkCheck, Check, Plus, Minus, Sun, Moon, MessageCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('172.') ||
    window.location.hostname.startsWith('10.')
  )
    ? `${window.location.protocol}//${window.location.hostname}:3001/api`
    : '/api'
);

const DOMAINS_LIST = [
  { key: 'Multi', label: 'Multidominio' },
  { key: 'Order', label: 'Orden' },
  { key: 'Fury', label: 'Furia' },
  { key: 'Mind', label: 'Mente' },
  { key: 'Chaos', label: 'Caos' },
  { key: 'Body', label: 'Cuerpo' },
  { key: 'Calm', label: 'Calma' },
  { key: 'Colorless', label: 'Incoloro' }
];

const RARITY_BADGE = {
  Common: 'bg-subtle text-ink-secondary border-line',
  Uncommon: 'bg-green-50 dark:bg-green-950/50 text-[#15803D] dark:text-green-300 border-green-200 dark:border-green-800',
  Rare: 'bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Epic: 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Promo: 'bg-red-50 dark:bg-red-950/50 text-[#B91C1C] dark:text-red-300 border-red-200 dark:border-red-800',
  Showcase: 'bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border-[#FDE68A] dark:border-amber-700/60'
};

const DiscordIcon = ({ size = 16, className = 'shrink-0 fill-current' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

function getCardDomainKey(card) {
  const elem = (card.element || '').trim();
  if (!elem || elem.toLowerCase() === 'colorless') return 'Colorless';
  if (elem.includes(',') || elem.toLowerCase().includes('multi')) return 'Multi';
  return elem;
}

export default function PublicSaleView() {
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState({ owner: {}, stats: {}, cards: [] });
  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedExpansions, setSelectedExpansions] = useState([]);
  const [sortBy, setSortBy] = useState('cost');
  const [showFilters, setShowFilters] = useState(false);
  const [desiredCards, setDesiredCards] = useState([]);
  const [offeredCards, setOfferedCards] = useState([]);
  const [order, setOrder] = useState({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('riftbard_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('riftbard_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  useEffect(() => {
    const fetchPublicSale = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/public/sale`);
        if (!res.ok) throw new Error('Error al cargar catálogo de venta');
        const data = await res.json();
        setSaleData(data);
        if (data.wishlist && Array.isArray(data.wishlist)) {
          setDesiredCards(data.wishlist);
        }
      } catch (err) {
        console.error('Error fetching public sale catalog:', err);
        showToast('Error cargando catálogo');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicSale();
  }, []);

  const allCards = saleData.cards || [];
  const owner = saleData.owner || {
    username: 'XDavider',
    displayName: 'David Bermúdez',
    discord: 'xdavider',
    instagram: 'david_de_dora',
    instagramUrl: 'https://www.instagram.com/david_de_dora/'
  };

  const featuredCards = useMemo(() => {
    const list = allCards.filter(c => c.featured);
    return list.slice().sort((a, b) => {
      const aIsLegend = (a.card_type || '').toLowerCase() === 'legend' || (a.rarity || '').toLowerCase() === 'legend';
      const bIsLegend = (b.card_type || '').toLowerCase() === 'legend' || (b.rarity || '').toLowerCase() === 'legend';
      if (aIsLegend && !bIsLegend) return -1;
      if (!aIsLegend && bIsLegend) return 1;
      return 0;
    });
  }, [allCards]);

  const sortedDesiredCards = useMemo(() => {
    return (desiredCards || []).slice().sort((a, b) => {
      const aIsLegend = (a.card_type || '').toLowerCase() === 'legend' || (a.rarity || '').toLowerCase() === 'legend';
      const bIsLegend = (b.card_type || '').toLowerCase() === 'legend' || (b.rarity || '').toLowerCase() === 'legend';
      if (aIsLegend && !bIsLegend) return -1;
      if (!aIsLegend && bIsLegend) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [desiredCards]);

  const expansionOptions = useMemo(() => {
    const counts = {};
    allCards.forEach(card => {
      if (card.set_name) counts[card.set_name] = (counts[card.set_name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allCards]);

  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      if (search) {
        const q = search.trim().toLowerCase();
        const hit =
          card.name?.toLowerCase().includes(q) ||
          card.card_code?.toLowerCase().includes(q) ||
          card.ability_text?.toLowerCase().includes(q) ||
          card.card_type?.toLowerCase().includes(q) ||
          card.rarity?.toLowerCase().includes(q) ||
          card.element?.toLowerCase().includes(q) ||
          card.set_name?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (selectedDomains.length > 0) {
        if (!selectedDomains.some(d => {
          if (d === 'Multi') return (card.element || '').includes(',') || (card.element || '').toLowerCase().includes('multi');
          if (d === 'Colorless') return !card.element || card.element.toLowerCase() === 'colorless';
          return card.element?.toLowerCase().includes(d.toLowerCase());
        })) return false;
      }
      if (selectedRarities.length > 0) {
        if (!selectedRarities.some(r => card.rarity?.toLowerCase() === r.toLowerCase())) return false;
      }
      if (selectedTypes.length > 0) {
        if (!selectedTypes.some(t => card.card_type?.toLowerCase().includes(t.toLowerCase()))) return false;
      }
      if (selectedExpansions.length > 0) {
        if (!selectedExpansions.includes(card.set_name)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'cost') {
        const costA = a.energy_cost ?? 999;
        const costB = b.energy_cost ?? 999;
        if (costA !== costB) return costA - costB;
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'stock') return (b.saleTotal || 0) - (a.saleTotal || 0);
      return 0;
    });
  }, [allCards, search, selectedDomains, selectedRarities, selectedTypes, selectedExpansions, sortBy]);

  const groupedCards = useMemo(() => {
    const map = {};
    DOMAINS_LIST.forEach(d => { map[d.key] = []; });
    filteredCards.forEach(card => {
      const key = getCardDomainKey(card);
      if (!map[key]) map[key] = [];
      map[key].push(card);
    });
    return DOMAINS_LIST.map(domain => ({ ...domain, cards: map[domain.key] || [] })).filter(g => g.cards.length > 0);
  }, [filteredCards]);

  const handleToggleOfferDesired = (card) => {
    setOfferedCards(prev => {
      const exists = prev.some(c => c.id === card.id);
      if (exists) {
        showToast(`Quitada de tu propuesta: ${card.name}`);
        return prev.filter(c => c.id !== card.id);
      }
      showToast(`Añadida para cambio: ${card.name}`);
      return [...prev, card];
    });
  };

  const handleUpdateOrder = (cardId, delta, maxAvailable) => {
    setOrder(prev => {
      const current = prev[cardId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      const updated = { ...prev };
      if (next === 0) delete updated[cardId];
      else updated[cardId] = next;
      return updated;
    });
  };

  const orderItems = useMemo(() => {
    return Object.entries(order).map(([cardId, qty]) => {
      const card = allCards.find(c => c.id === cardId);
      return { card, qty };
    }).filter(item => item.card && item.qty > 0);
  }, [order, allCards]);

  const totalOrderCount = useMemo(() => orderItems.reduce((acc, curr) => acc + curr.qty, 0), [orderItems]);

  const generateOrderMessage = () => {
    const lines = [];
    lines.push('👋 ¡Hola David! He visto tus cartas a la venta en RiftBard y me interesa pedirte estas:');
    lines.push('');
    if (orderItems.length > 0) {
      lines.push('📋 Mi Pedido:');
      orderItems.forEach(({ card, qty }) => {
        const details = [];
        const normalPart = Math.min(card.saleNormal || 0, qty);
        const foilPart = qty - normalPart;
        if (normalPart > 0) details.push(`${normalPart} Normal`);
        if (foilPart > 0) details.push(`${foilPart} Foil`);
        lines.push(`• ${qty}x ${card.name} [${card.rarity}] (${details.join(', ')}) - ${card.set_name || 'Riftbound'}`);
      });
      lines.push('');
      lines.push(`Total: ${totalOrderCount} cartas.`);
    }
    if (offeredCards.length > 0) {
      lines.push('');
      lines.push('🤝 De tu WishList, tengo estas para ofrecerte / cambio:');
      offeredCards.forEach(c => {
        const qtyNotice = c.quantity > 1 ? ` (buscas ${c.quantity}x)` : '';
        lines.push(`• ${c.name} [${c.rarity}] (${c.set_name || 'Riftbound'})${qtyNotice}`);
      });
    }
    lines.push('');
    lines.push('¿Las tienes disponibles y me confirmas precios / cambio? ¡Gracias!');
    return lines.join('\n');
  };

  const handleCopyOrderText = () => {
    navigator.clipboard.writeText(generateOrderMessage());
    showToast('¡Pedido copiado al portapapeles!');
  };

  const handleSendWhatsApp = () => {
    const text = generateOrderMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDomains([]);
    setSelectedRarities([]);
    setSelectedTypes([]);
    setSelectedExpansions([]);
    setSortBy('cost');
  };

  const activeFiltersCount = selectedDomains.length + selectedRarities.length + selectedTypes.length + selectedExpansions.length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-app font-sans text-ink-primary flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] bg-[#161615] dark:bg-[#F3F4F6] text-white dark:text-[#161615] px-4 py-2.5 rounded-xl shadow-lg font-semibold text-xs sm:text-sm flex items-center gap-2">
          <Check size={15} className="text-[#15803D] dark:text-green-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimalist Public Store Header (No management nav) */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-subtle border border-line flex items-center justify-center overflow-hidden p-0.5 shrink-0">
              <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold font-display text-ink-primary truncate">RiftBard</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/50 text-[#15803D] dark:text-green-300 border border-green-200 dark:border-green-800 shrink-0">
                  Venta
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary truncate">
                Escaparate de <strong className="text-ink-primary">{owner.displayName || 'David'}</strong> · {allCards.length} cartas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-line bg-surface hover:bg-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
              aria-label="Cambiar tema"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <a
              href={owner.instagramUrl || 'https://www.instagram.com/david_de_dora/'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex min-w-[40px] min-h-[40px] sm:px-3 rounded-lg bg-subtle hover:bg-line border border-line text-ink-primary text-xs font-semibold items-center justify-center gap-1.5"
              title="Instagram"
            >
              <Instagram size={15} />
              <span className="hidden sm:inline">Instagram</span>
            </a>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(owner.discord || 'xdavider');
                showToast(`Discord copiado: ${owner.discord || 'xdavider'}`);
              }}
              className="hidden sm:flex min-w-[40px] min-h-[40px] sm:px-3 rounded-lg bg-subtle hover:bg-line border border-line text-ink-primary text-xs font-semibold items-center justify-center gap-1.5 cursor-pointer"
              title="Copiar Discord"
            >
              <DiscordIcon size={15} />
              <span className="hidden md:inline">{owner.discord || 'xdavider'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOrderModalOpen(true)}
              className={`min-h-[40px] px-2.5 sm:px-3 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                totalOrderCount + offeredCards.length > 0
                  ? 'bg-[#B45309] border-[#B45309] text-white'
                  : 'bg-surface hover:bg-subtle border-line text-ink-primary'
              }`}
              title="Abrir cesta"
            >
              <ShoppingBag size={14} />
              <span className="hidden sm:inline">Cesta</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-black/15 dark:bg-white/15 leading-none tabular-nums">
                {totalOrderCount + offeredCards.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col gap-5 pb-28">
        {/* Compact Price Reference Notice */}
        <div className="px-3.5 py-2.5 rounded-xl bg-surface border border-line flex items-center justify-between gap-2 text-xs text-ink-secondary">
          <span>
            <strong className="text-ink-primary">Referencia de precios:</strong> Venta y trade al precio mínimo de Cardmarket España.
          </span>
        </div>

        {/* Search & Filter Trigger */}
        <section className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cartas en venta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] bg-surface border border-line rounded-[10px] pl-10 pr-9 py-2 text-base sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-[#B45309]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-secondary hover:text-ink-primary"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className={`min-h-[44px] px-3.5 rounded-[10px] text-xs font-semibold border flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
              activeFiltersCount > 0
                ? 'bg-[#B45309] border-[#B45309] text-white'
                : 'bg-surface border-line text-ink-primary hover:bg-subtle'
            }`}
          >
            <Filter size={15} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#B45309] text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </section>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#B45309]/20 border-t-[#B45309] animate-spin" />
            <p className="text-sm text-ink-secondary font-medium">Cargando escaparate...</p>
          </div>
        ) : (
          <>
            {/* Featured Carousel — Differentiated Amber-Accented Container */}
            {featuredCards.length > 0 && (
              <section className="p-4 sm:p-5 rounded-2xl bg-surface border border-[#E4E2DC] dark:border-[#2C303A] border-l-4 border-l-[#B45309] space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[#FFFBEB] dark:bg-amber-950/50 border border-[#FDE68A] dark:border-amber-700/60 flex items-center justify-center text-[#B45309] dark:text-amber-400 shrink-0">
                    <Star size={18} className="fill-current" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-ink-primary font-display flex items-center gap-2">
                      <span>Ventas Destacadas</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-700/60">
                        {featuredCards.length}
                      </span>
                    </h2>
                    <p className="text-xs text-ink-secondary">Recomendaciones clave a la venta</p>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 no-scrollbar">
                  {featuredCards.map(card => {
                    const qty = order[card.id] || 0;
                    const max = card.saleTotal || 1;
                    return (
                      <article
                        key={`feat-${card.id}`}
                        className="snap-start shrink-0 w-44 sm:w-48 rounded-xl overflow-hidden bg-app border border-[#FDE68A] dark:border-amber-700/60 flex flex-col"
                      >
                        <div
                          className="aspect-[2.5/3.5] w-full bg-subtle overflow-hidden cursor-pointer"
                          onClick={() => setSelectedCardForModal(card)}
                        >
                          {card.image_url && (
                            <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="p-2.5 flex flex-col gap-2 bg-surface border-t border-line">
                          <div>
                            <h3 className="text-xs font-bold text-ink-primary truncate">{card.name}</h3>
                            <p className="text-[11px] text-ink-secondary truncate">
                              {max}x disp. · {card.rarity}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-1 bg-[#FFFBEB] dark:bg-amber-950/40 border border-[#FDE68A] dark:border-amber-700/50 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => handleUpdateOrder(card.id, -1, max)}
                              disabled={qty === 0}
                              className="min-w-[36px] min-h-[36px] rounded-md bg-surface border border-line text-ink-primary disabled:opacity-30 flex items-center justify-center cursor-pointer"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="text-xs font-bold text-[#92400E] dark:text-amber-300 tabular-nums">
                              {qty > 0 ? `${qty} pedida${qty > 1 ? 's' : ''}` : 'Pedir'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrder(card.id, 1, max)}
                              disabled={qty >= max}
                              className="min-w-[36px] min-h-[36px] rounded-md bg-[#B45309] hover:bg-[#92400E] text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* David's Wishlist — Differentiated Blue/Indigo-Accented Container */}
            {sortedDesiredCards.length > 0 && (
              <section className="p-4 sm:p-5 rounded-2xl bg-surface border border-[#E4E2DC] dark:border-[#2C303A] border-l-4 border-l-[#1D4ED8] space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#1D4ED8] dark:text-blue-400 shrink-0">
                    <BookmarkCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-ink-primary font-display flex items-center gap-2">
                      <span>Busca para cambio (WishList)</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {sortedDesiredCards.length}
                      </span>
                    </h2>
                    <p className="text-xs text-ink-secondary">Cartas que busco para cambio o compra</p>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 no-scrollbar">
                  {sortedDesiredCards.map(card => {
                    const isOffered = offeredCards.some(c => c.id === card.id);
                    return (
                      <article
                        key={`wish-${card.id}`}
                        className={`snap-start shrink-0 w-40 sm:w-44 rounded-xl overflow-hidden bg-app border flex flex-col ${
                          isOffered ? 'border-[#1D4ED8] ring-1 ring-[#1D4ED8]/30' : 'border-blue-200/80 dark:border-blue-900/60'
                        }`}
                      >
                        <div
                          className="aspect-[2.5/3.5] w-full bg-subtle overflow-hidden cursor-pointer"
                          onClick={() => setSelectedCardForModal(card)}
                        >
                          {card.image_url && (
                            <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="p-2.5 flex flex-col gap-2 bg-surface border-t border-line">
                          <h3 className="text-xs font-bold text-ink-primary truncate">{card.name}</h3>
                          <button
                            type="button"
                            onClick={() => handleToggleOfferDesired(card)}
                            className={`w-full min-h-[40px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              isOffered
                                ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white'
                                : 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-[#1D4ED8] dark:text-blue-300'
                            }`}
                          >
                            {isOffered ? 'Ofrecida ✓' : '¡La tengo!'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Catalog Grouped by Domain */}
            {groupedCards.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-surface border border-line rounded-xl p-6">
                <p className="text-sm font-semibold text-ink-primary">No hay cartas con esos filtros</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-[44px] px-4 rounded-[10px] bg-[#B45309] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <RotateCcw size={13} /> Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedCards.map(group => (
                  <section key={group.key} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-line pb-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-ink-primary font-display">{group.label}</h2>
                      <span className="text-xs font-semibold text-ink-secondary bg-surface border border-line px-2.5 py-0.5 rounded-full">
                        {group.cards.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-3 sm:gap-4">
                      {group.cards.map(card => {
                        const qty = order[card.id] || 0;
                        const max = card.saleTotal || 1;
                        const rarityCls = RARITY_BADGE[card.rarity] || RARITY_BADGE.Common;
                        return (
                          <article
                            key={card.id}
                            className={`rounded-xl overflow-hidden bg-surface border flex flex-col transition-colors ${
                              qty > 0 ? 'border-[#15803D] ring-1 ring-[#15803D]/25' : 'border-line hover:border-[#B45309]/60'
                            }`}
                          >
                            <div
                              className="aspect-[2.5/3.5] w-full bg-subtle overflow-hidden cursor-pointer"
                              onClick={() => setSelectedCardForModal(card)}
                            >
                              {card.image_url ? (
                                <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">Sin Imagen</div>
                              )}
                            </div>

                            <div className="p-2.5 sm:p-3 flex flex-col gap-2 bg-surface border-t border-line flex-1 justify-between">
                              <div className="space-y-1 cursor-pointer" onClick={() => setSelectedCardForModal(card)}>
                                <h3 className="text-[13px] sm:text-sm font-semibold text-ink-primary truncate">{card.name}</h3>
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${rarityCls}`}>
                                    {card.rarity}
                                  </span>
                                  <span className="text-[11px] font-semibold text-ink-secondary tabular-nums">
                                    {max}x disp.
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-1 bg-app border border-line p-1 rounded-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrder(card.id, -1, max)}
                                  disabled={qty === 0}
                                  className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] rounded-lg bg-surface hover:bg-subtle border border-line text-ink-primary disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                  aria-label="Restar"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className={`text-xs font-bold tabular-nums ${qty > 0 ? 'text-[#15803D] dark:text-green-400' : 'text-ink-secondary'}`}>
                                  {qty > 0 ? `${qty}x` : 'Pedir'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrder(card.id, 1, max)}
                                  disabled={qty >= max}
                                  className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] rounded-lg bg-[#15803D] hover:bg-[#166534] text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                                  aria-label="Añadir"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Bottom Cart Bar when items are selected */}
      {(totalOrderCount > 0 || offeredCards.length > 0) && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-3 sm:px-6 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(true)}
              className="min-h-[44px] px-3 rounded-[10px] bg-subtle border border-line text-ink-primary text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={16} className="text-[#B45309]" />
              <span>{totalOrderCount} pedidas{offeredCards.length > 0 ? ` · ${offeredCards.length} cambio` : ''}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyOrderText}
                className="min-h-[44px] px-3.5 rounded-[10px] bg-surface hover:bg-subtle border border-line text-ink-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy size={14} />
                <span className="hidden sm:inline">Copiar pedido</span>
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="min-h-[44px] px-4 rounded-[10px] bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bottom-Sheet (Mobile) / Drawer (Desktop) */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
          <div
            className="w-full sm:max-w-md bg-surface border-t sm:border-t-0 sm:border-l border-line rounded-t-2xl sm:rounded-none flex flex-col max-h-[88vh] sm:max-h-full sm:h-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-line-strong" />
            </div>
            <div className="px-4 py-3 border-b border-line bg-app flex items-center justify-between">
              <span className="text-sm font-bold text-ink-primary flex items-center gap-2">
                <Filter size={15} className="text-[#B45309]" /> Filtros
              </span>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#B45309] px-2 py-1">
                    Limpiar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-ink-secondary hover:text-ink-primary"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {/* Ordenar */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpDown size={12} className="text-[#B45309]" /> Ordenar por
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cost', label: 'Coste' },
                    { id: 'name', label: 'Nombre' },
                    { id: 'stock', label: 'Stock' }
                  ].map(o => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSortBy(o.id)}
                      className={`min-h-[40px] rounded-[10px] text-xs font-semibold border cursor-pointer ${
                        sortBy === o.id ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-surface border-line text-ink-primary'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dominios */}
              <div className="space-y-2 pt-3 border-t border-line">
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Dominios</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DOMAINS_LIST.map(d => {
                    const active = selectedDomains.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDomains(prev => prev.includes(d.key) ? prev.filter(x => x !== d.key) : [...prev, d.key])}
                        className={`min-h-[40px] px-3 rounded-[10px] text-xs font-semibold border text-left cursor-pointer ${
                          active ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-surface border-line text-ink-primary'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rareza */}
              <div className="space-y-2 pt-3 border-t border-line">
                <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Rareza</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Common', 'Uncommon', 'Rare', 'Epic', 'Promo', 'Showcase'].map(r => {
                    const active = selectedRarities.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRarities(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                        className={`min-h-[40px] px-3 rounded-[10px] text-xs font-semibold border text-left cursor-pointer ${
                          active ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-surface border-line text-ink-primary'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expansiones */}
              {expansionOptions.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-line">
                  <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Expansión</label>
                  <div className="space-y-1.5">
                    {expansionOptions.map(([expName, count]) => {
                      const active = selectedExpansions.includes(expName);
                      return (
                        <button
                          key={expName}
                          type="button"
                          onClick={() => setSelectedExpansions(prev => prev.includes(expName) ? prev.filter(x => x !== expName) : [...prev, expName])}
                          className={`w-full min-h-[40px] px-3 rounded-[10px] text-xs font-semibold border flex items-center justify-between cursor-pointer ${
                            active ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-surface border-line text-ink-primary'
                          }`}
                        >
                          <span className="truncate">{expName}</span>
                          <span className="text-[11px] opacity-80">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-line bg-app pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="w-full min-h-[44px] bg-[#B45309] hover:bg-[#92400E] text-white font-semibold text-sm rounded-[10px] cursor-pointer"
              >
                Ver {filteredCards.length} cartas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary Modal / Bottom-Sheet */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4" onClick={() => setIsOrderModalOpen(false)}>
          <div
            className="w-full sm:max-w-lg bg-surface border border-line rounded-t-2xl sm:rounded-2xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-line-strong" />
            </div>
            <div className="px-5 py-3.5 border-b border-line bg-app flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink-primary font-display">Tu selección ({totalOrderCount})</h3>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-ink-secondary hover:text-ink-primary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {orderItems.map(({ card, qty }) => (
                <div key={card.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-app border border-line">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink-primary truncate">{card.name}</p>
                    <p className="text-[11px] text-ink-secondary">{card.rarity} · {card.set_name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateOrder(card.id, -1, card.saleTotal || 1)}
                      className="min-w-[36px] min-h-[36px] rounded-lg bg-surface border border-line flex items-center justify-center"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-xs font-bold tabular-nums w-6 text-center">{qty}x</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrder(card.id, 1, card.saleTotal || 1)}
                      disabled={qty >= (card.saleTotal || 1)}
                      className="min-w-[36px] min-h-[36px] rounded-lg bg-[#15803D] text-white disabled:opacity-30 flex items-center justify-center"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {offeredCards.length > 0 && (
                <div className="pt-3 border-t border-line space-y-1.5">
                  <p className="text-xs font-bold text-[#1D4ED8] dark:text-blue-400">Ofreces para cambio:</p>
                  {offeredCards.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
                      <span className="font-semibold text-ink-primary truncate">{c.name}</span>
                      <button type="button" onClick={() => handleToggleOfferDesired(c)} className="text-[#B91C1C] font-semibold px-2">Quitar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-line bg-app flex flex-col sm:flex-row gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
              <button
                type="button"
                onClick={handleCopyOrderText}
                className="flex-1 min-h-[44px] rounded-[10px] bg-surface border border-line text-ink-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy size={14} /> Copiar texto
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 min-h-[44px] rounded-[10px] bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle size={15} /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Card Inspection Modal */}
      {selectedCardForModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4" onClick={() => setSelectedCardForModal(null)}>
          <div
            className="w-full sm:max-w-md bg-surface border border-line rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink-primary font-display truncate pr-2">{selectedCardForModal.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedCardForModal(null)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-subtle text-ink-primary"
              >
                <X size={18} />
              </button>
            </div>
            {selectedCardForModal.image_url && (
              <img
                src={selectedCardForModal.image_url}
                alt={selectedCardForModal.name}
                className="w-56 mx-auto rounded-xl border border-line"
              />
            )}
            <div className="text-xs text-ink-secondary space-y-1 text-center">
              <p><strong className="text-ink-primary">{selectedCardForModal.rarity}</strong> · {selectedCardForModal.set_name}</p>
              {selectedCardForModal.ability_text && (
                <p className="text-ink-primary bg-app p-3 rounded-xl border border-line text-left leading-relaxed mt-2">
                  {selectedCardForModal.ability_text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
