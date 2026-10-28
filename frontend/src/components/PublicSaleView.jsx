import React, { useState, useEffect, useMemo } from 'react';
import appLogo from '../assets/logo.png';
import {
  Search, Filter, ShoppingBag, X, Check, Copy, ExternalLink,
  ChevronDown, RotateCcw, Sparkles, Layers, Shield, Eye, Lock, ArrowUpDown
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

const DOMAIN_STYLES = {
  Mind: {
    border: 'hover:border-blue-500/60',
    activeBg: 'bg-blue-600 border-blue-400 text-white shadow-[0_0_16px_rgba(59,130,246,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-blue-950/40 hover:text-blue-300',
    dot: 'bg-blue-400'
  },
  Order: {
    border: 'hover:border-yellow-500/60',
    activeBg: 'bg-yellow-600 border-yellow-400 text-white shadow-[0_0_16px_rgba(234,179,8,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-yellow-950/40 hover:text-yellow-300',
    dot: 'bg-yellow-400'
  },
  Body: {
    border: 'hover:border-orange-500/60',
    activeBg: 'bg-orange-600 border-orange-400 text-white shadow-[0_0_16px_rgba(249,115,22,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-orange-950/40 hover:text-orange-300',
    dot: 'bg-orange-400'
  },
  Chaos: {
    border: 'hover:border-purple-500/60',
    activeBg: 'bg-purple-600 border-purple-400 text-white shadow-[0_0_16px_rgba(168,85,247,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-purple-950/40 hover:text-purple-300',
    dot: 'bg-purple-400'
  },
  Fury: {
    border: 'hover:border-red-500/60',
    activeBg: 'bg-red-600 border-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-red-950/40 hover:text-red-300',
    dot: 'bg-red-400'
  },
  Calm: {
    border: 'hover:border-emerald-500/60',
    activeBg: 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.45)]',
    inactiveBg: 'bg-dark-900/80 text-slate-300 border-white/[0.08] hover:bg-emerald-950/40 hover:text-emerald-300',
    dot: 'bg-emerald-400'
  }
};

const RARITY_COLORS = {
  Common: 'text-slate-300 border-slate-600/40 bg-slate-800/40',
  Uncommon: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
  Rare: 'text-blue-400 border-blue-500/40 bg-blue-950/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
  Epic: 'text-purple-400 border-purple-500/40 bg-purple-950/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
  Promo: 'text-rose-400 border-rose-500/40 bg-rose-950/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
  Showcase: 'text-amber-300 border-amber-400/60 bg-amber-950/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
};

export default function PublicSaleView({ onExitPublicMode }) {
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState({ owner: {}, stats: {}, cards: [] });
  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  
  // Cart / Order state: { [cardId]: requestedQuantity }
  const [order, setOrder] = useState({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const fetchPublicSale = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/public/sale`);
        if (!res.ok) throw new Error('Error al cargar catálogo de venta');
        const data = await res.json();
        setSaleData(data);
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
    instagramUrl: 'https://www.instagram.com/david_de_dora/',
    linkedinUrl: 'https://www.linkedin.com/in/david-bermudez-445785403',
    githubUrl: 'https://github.com/David-BermudezFP'
  };

  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      if (search) {
        const query = search.trim().toLowerCase();
        const matchesName = card.name?.toLowerCase().includes(query);
        const matchesCode = card.card_code?.toLowerCase().includes(query);
        const matchesText = card.ability_text?.toLowerCase().includes(query);
        const matchesType = card.card_type?.toLowerCase().includes(query);
        const matchesRarity = card.rarity?.toLowerCase().includes(query);
        const matchesElement = card.element?.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesText && !matchesType && !matchesRarity && !matchesElement) {
          return false;
        }
      }
      if (selectedDomains.length > 0) {
        if (!selectedDomains.some(d => card.element?.toLowerCase().includes(d.toLowerCase()))) return false;
      }
      if (selectedRarities.length > 0) {
        if (!selectedRarities.some(r => card.rarity?.toLowerCase() === r.toLowerCase())) return false;
      }
      if (selectedTypes.length > 0) {
        if (!selectedTypes.some(t => card.card_type?.toLowerCase().includes(t.toLowerCase()))) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'cost') {
        const costA = a.energy_cost ?? 999;
        const costB = b.energy_cost ?? 999;
        return costA - costB;
      }
      if (sortBy === 'stock') {
        return (b.saleTotal || 0) - (a.saleTotal || 0);
      }
      return 0;
    });
  }, [allCards, search, selectedDomains, selectedRarities, selectedTypes, sortBy]);

  const handleUpdateOrder = (cardId, delta, maxAvailable) => {
    setOrder(prev => {
      const current = prev[cardId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      const updated = { ...prev };
      if (next === 0) {
        delete updated[cardId];
      } else {
        updated[cardId] = next;
      }
      return updated;
    });
  };

  const orderItems = useMemo(() => {
    return Object.entries(order).map(([cardId, qty]) => {
      const card = allCards.find(c => c.id === cardId);
      return { card, qty };
    }).filter(item => item.card && item.qty > 0);
  }, [order, allCards]);

  const totalOrderCount = useMemo(() => {
    return orderItems.reduce((acc, curr) => acc + curr.qty, 0);
  }, [orderItems]);

  const generateOrderMessage = () => {
    const lines = [];
    lines.push(`👋 ¡Hola David! He visto tus cartas a la venta en RiftBard y me interesa pedirte estas:`);
    lines.push('');
    lines.push('📋 Mi Pedido:');
    orderItems.forEach(({ card, qty }) => {
      const details = [];
      const normalPart = Math.min(card.saleNormal || 0, qty);
      const foilPart = qty - normalPart;
      if (normalPart > 0) details.push(`${normalPart} Normal`);
      if (foilPart > 0) details.push(`${foilPart} Foil✨`);
      lines.push(`• ${qty}x ${card.name} [${card.rarity}] (${details.join(', ')}) - ${card.set_name || 'Set 1'}`);
    });
    lines.push('');
    lines.push(`Total: ${totalOrderCount} cartas.`);
    lines.push('¿Las tienes disponibles y me confirmas precios / cambio? ¡Gracias!');
    return lines.join('\n');
  };

  const handleCopyOrderText = () => {
    const text = generateOrderMessage();
    navigator.clipboard.writeText(text);
    showToast('¡Mensaje de pedido copiado al portapapeles!');
  };

  const handleOrderInstagram = () => {
    const text = generateOrderMessage();
    navigator.clipboard.writeText(text);
    showToast('¡Texto copiado! Pégalo en el chat de Instagram de David');
    window.open(owner.instagramUrl || 'https://www.instagram.com/david_de_dora/', '_blank');
  };

  const handleOrderDiscord = () => {
    const text = generateOrderMessage();
    navigator.clipboard.writeText(text);
    showToast(`¡Texto copiado! Abre MD a ${owner.discord || 'xdavider'} en Discord y pégalo`);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDomains([]);
    setSelectedRarities([]);
    setSelectedTypes([]);
    setSortBy('name');
  };

  const activeFiltersCount = (search ? 1 : 0) + selectedDomains.length + selectedRarities.length + selectedTypes.length;

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-dark-950 font-sans text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-amber-300/40 font-semibold text-xs sm:text-sm flex items-center gap-2.5 animate-card-pop">
          <Sparkles size={16} className="text-amber-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Owner Identity */}
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 opacity-50 blur-md group-hover:opacity-80 transition-opacity" />
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-dark-900 border border-amber-400/50 flex items-center justify-center overflow-hidden p-1 shadow-glow-primary">
                <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                  RiftBard
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Venta Pública
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5">
                <span>Catálogo de cartas de</span>
                <span className="text-slate-200 font-semibold">David (@XDavider)</span>
              </p>
            </div>
          </div>

          {/* Socials & Vault Access */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Instagram Contact */}
            <a
              href={owner.instagramUrl || 'https://www.instagram.com/david_de_dora/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/80 to-pink-950/80 border border-pink-500/30 text-pink-300 hover:text-white hover:border-pink-500/60 text-xs font-semibold transition-all shadow-sm"
              title="Ver perfil de Instagram"
            >
              <span className="text-sm">📸</span>
              <span className="hidden sm:inline">Instagram</span>
            </a>

            {/* Discord Contact */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(owner.discord || 'xdavider');
                showToast(`Discord copiado: ${owner.discord || 'xdavider'}`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-500/60 text-xs font-semibold transition-all shadow-sm"
              title="Copiar Discord"
            >
              <span className="text-sm">💬</span>
              <span className="hidden sm:inline">Discord ({owner.discord || 'xdavider'})</span>
            </button>

            {/* Back to Vault / Owner Login */}
            {onExitPublicMode && (
              <button
                onClick={onExitPublicMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-xs font-medium transition-all"
                title="Acceder a la Bóveda con contraseña"
              >
                <Lock size={13} />
                <span className="hidden md:inline">Acceso Bóveda</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col gap-6">
        
        {/* Hero Banner */}
        <section className="relative rounded-3xl bg-gradient-to-br from-dark-900/90 via-dark-950 to-dark-900/80 border border-white/10 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Sparkles size={13} className="text-amber-400" />
                <span>Cartas disponibles para compra o trade</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                Elige tus cartas y pídeme tu lista directamente
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Aquí tienes todas las cartas de mi colección que están a la venta (excedentes &gt;3 copias y piezas seleccionadas). 
                Haz clic en <span className="text-amber-300 font-semibold">+ Añadir al pedido</span> en las cartas que necesites y pulsa en solicitar para mandarme tu mensaje por Instagram o Discord.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">A la venta</span>
                <span className="text-lg sm:text-xl font-black text-amber-400">{saleData.stats?.totalCopies || 0}</span>
                <span className="text-[10px] text-slate-400 block">copias</span>
              </div>
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Distintas</span>
                <span className="text-lg sm:text-xl font-black text-white">{saleData.stats?.uniqueCards || 0}</span>
                <span className="text-[10px] text-slate-400 block">cartas</span>
              </div>
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Normales</span>
                <span className="text-lg sm:text-xl font-black text-slate-200">{saleData.stats?.normalCopies || 0}</span>
                <span className="text-[10px] text-slate-400 block">copias</span>
              </div>
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Foils✨</span>
                <span className="text-lg sm:text-xl font-black text-amber-300">{saleData.stats?.foilCopies || 0}</span>
                <span className="text-[10px] text-slate-400 block">brillantes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-dark-900/90 border border-white/[0.08] rounded-2xl p-4 shadow-xl flex flex-col gap-3.5 backdrop-blur-xl">
          
          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o texto de habilidad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                <ArrowUpDown size={13} />
                <span>Ordenar:</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="name">Nombre (A-Z)</option>
                <option value="cost">Coste de Energía</option>
                <option value="stock">Mayor Stock</option>
              </select>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RotateCcw size={13} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Elemental Domain Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.05]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Dominio:</span>
            {['Mind', 'Order', 'Body', 'Chaos', 'Fury', 'Calm'].map(dom => {
              const active = selectedDomains.includes(dom);
              const styles = DOMAIN_STYLES[dom];
              return (
                <button
                  key={dom}
                  onClick={() => {
                    setSelectedDomains(prev => 
                      active ? prev.filter(d => d !== dom) : [...prev, dom]
                    );
                  }}
                  className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all flex items-center gap-1.5 ${
                    active ? styles.activeBg : styles.inactiveBg
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  <span>{dom}</span>
                </button>
              );
            })}
          </div>

          {/* Rarity & Card Type Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.05]">
            {/* Rarities */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Rareza:</span>
              {['Common', 'Uncommon', 'Rare', 'Epic', 'Promo', 'Showcase'].map(r => {
                const active = selectedRarities.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRarities(prev => 
                        active ? prev.filter(x => x !== r) : [...prev, r]
                      );
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all ${
                      active
                        ? 'bg-amber-500 border-amber-400 text-dark-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-dark-950/80 text-slate-300 border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* Types */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tipo:</span>
              {['Unit', 'Spell', 'Gear', 'Item', 'Rune', 'Battlefield', 'Legend'].map(t => {
                const active = selectedTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTypes(prev => 
                        active ? prev.filter(x => x !== t) : [...prev, t]
                      );
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all ${
                      active
                        ? 'bg-primary-600 border-primary-400 text-white shadow-glow-primary'
                        : 'bg-dark-950/80 text-slate-300 border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Mostrando <b className="text-white">{filteredCards.length}</b> cartas a la venta</span>
          {totalOrderCount > 0 && (
            <span className="text-amber-300 font-semibold flex items-center gap-1.5">
              <ShoppingBag size={14} />
              <span>{totalOrderCount} carta{totalOrderCount > 1 ? 's' : ''} en tu pedido</span>
            </span>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <p className="text-sm font-semibold">Cargando catálogo de venta de David...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 bg-dark-900/40 rounded-3xl border border-white/5 p-8 text-center">
            <Layers size={40} className="text-slate-600" />
            <h3 className="text-base font-bold text-slate-200">No se encontraron cartas con esos filtros</h3>
            <p className="text-xs text-slate-400 max-w-sm">Prueba a buscar otro nombre o limpiar los filtros seleccionados.</p>
            <button
              onClick={clearFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-dark-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pb-24">
            {filteredCards.map(card => {
              const qtyInOrder = order[card.id] || 0;
              const maxStock = card.saleTotal || 0;
              const isSelected = qtyInOrder > 0;
              const rarityStyle = RARITY_COLORS[card.rarity] || 'text-slate-300 border-white/10';

              return (
                <div
                  key={card.id}
                  className={`relative flex flex-col bg-dark-900/90 rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg group ${
                    isSelected 
                      ? 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50' 
                      : 'border-white/[0.08] hover:border-white/20 hover:shadow-xl'
                  }`}
                >
                  {/* Card Art (Clickable to preview) */}
                  <div 
                    onClick={() => setSelectedCardForModal(card)}
                    className="relative aspect-[744/1039] w-full bg-dark-950 overflow-hidden cursor-pointer group/art"
                  >
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover/art:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-dark-950 text-slate-400">
                        <Layers size={28} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold text-slate-200">{card.name}</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />

                    {/* Energy Cost Badge */}
                    {card.energy_cost !== null && card.energy_cost !== undefined && (
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-xl bg-dark-950/90 border border-amber-400/60 flex items-center justify-center text-amber-300 font-extrabold text-xs shadow-lg backdrop-blur-md">
                        {card.energy_cost}
                      </div>
                    )}

                    {/* Rarity & Domain Pill */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border backdrop-blur-md ${rarityStyle}`}>
                        {card.rarity}
                      </span>
                    </div>

                    {/* Click preview prompt */}
                    <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover/art:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded-xl bg-dark-900/90 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1 shadow-lg backdrop-blur-md">
                        <Eye size={12} /> Ver detalle
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors" title={card.name}>
                        {card.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate pr-1">{card.card_type} • {card.element || 'Neutral'}</span>
                        <span className="shrink-0 font-mono text-[9px] text-slate-400">{card.card_code || ''}</span>
                      </div>
                    </div>

                    {/* Available Stock Tag */}
                    <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-dark-950/80 border border-white/[0.06] text-[10px]">
                      <span className="text-slate-400 font-medium">Stock:</span>
                      <div className="flex items-center gap-1 font-bold">
                        <span className="text-amber-400">{maxStock}x</span>
                        <span className="text-slate-400 text-[9px]">
                          ({card.saleNormal > 0 ? `${card.saleNormal}N` : ''}
                          {card.saleNormal > 0 && card.saleFoil > 0 ? ' / ' : ''}
                          {card.saleFoil > 0 ? `${card.saleFoil}F✨` : ''})
                        </span>
                      </div>
                    </div>

                    {/* Order Action Button / Stepper */}
                    {qtyInOrder === 0 ? (
                      <button
                        onClick={() => handleUpdateOrder(card.id, 1, maxStock)}
                        className="w-full py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-dark-950 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        <span>+ Añadir al pedido</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-amber-500/20 border border-amber-400/60 rounded-xl p-0.5 shadow-sm">
                        <button
                          onClick={() => handleUpdateOrder(card.id, -1, maxStock)}
                          className="w-7 h-7 rounded-lg bg-dark-950/80 hover:bg-dark-900 text-amber-300 flex items-center justify-center font-bold text-sm transition-colors"
                        >
                          -
                        </button>
                        <div className="text-center font-extrabold text-xs text-amber-200">
                          <span>{qtyInOrder}</span>
                          <span className="text-[10px] text-amber-400/60 font-medium"> / {maxStock}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateOrder(card.id, 1, maxStock)}
                          disabled={qtyInOrder >= maxStock}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                            qtyInOrder >= maxStock
                              ? 'bg-dark-950/40 text-slate-600 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 text-dark-950'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Order Bar */}
      {totalOrderCount > 0 && (
        <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-dark-900/95 border border-amber-400/60 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 animate-card-pop">
          <div className="flex items-center gap-3 pl-1 sm:pl-2">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-dark-950 flex items-center justify-center shadow-lg font-black">
              <ShoppingBag size={20} />
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold border border-dark-900">
                {totalOrderCount}
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Mi Pedido:</span>
                <span className="text-amber-400 font-extrabold">{totalOrderCount} carta{totalOrderCount > 1 ? 's' : ''}</span>
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {orderItems.length} carta{orderItems.length > 1 ? 's' : ''} distinta{orderItems.length > 1 ? 's' : ''} seleccionada{orderItems.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-4 sm:px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-dark-950 font-black text-xs sm:text-sm shadow-glow-primary transition-all flex items-center gap-2"
            >
              <span>Ver Pedido y Solicitar</span>
              <ExternalLink size={15} />
            </button>
          </div>
        </aside>
      )}

      {/* Order Modal / Drawer */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-dark-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-dark-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tu Selección de Cartas</h3>
                  <p className="text-xs text-slate-400">
                    {totalOrderCount} carta{totalOrderCount > 1 ? 's' : ''} para pedir a David
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Selected Cards List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 custom-scrollbar flex-1">
              {orderItems.map(({ card, qty }) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-dark-950/80 border border-white/[0.06] hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{card.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {card.rarity} • {card.card_type} • {card.set_name || 'Set 1'}
                      </p>
                      <p className="text-[10px] text-amber-300 font-semibold mt-0.5">
                        Disponible: {card.saleTotal}x ({card.saleNormal > 0 ? `${card.saleNormal} Normal` : ''}
                        {card.saleNormal > 0 && card.saleFoil > 0 ? ' / ' : ''}
                        {card.saleFoil > 0 ? `${card.saleFoil} Foil✨` : ''})
                      </p>
                    </div>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-dark-900 border border-white/10 rounded-xl p-0.5">
                      <button
                        onClick={() => handleUpdateOrder(card.id, -1, card.saleTotal)}
                        className="w-7 h-7 rounded-lg hover:bg-white/10 text-amber-300 font-bold flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black text-white">{qty}</span>
                      <button
                        onClick={() => handleUpdateOrder(card.id, 1, card.saleTotal)}
                        disabled={qty >= card.saleTotal}
                        className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-sm ${
                          qty >= card.saleTotal ? 'text-slate-600' : 'hover:bg-white/10 text-amber-300'
                        }`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleUpdateOrder(card.id, -999, card.saleTotal)}
                      className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                      title="Eliminar de la lista"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer: Direct Request Buttons */}
            <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-dark-950/90 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-300">
                Elige cómo quieres enviarle la lista a David:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Instagram Action */}
                <button
                  onClick={handleOrderInstagram}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span className="text-base">📸</span>
                  <span>Pedir por Instagram</span>
                </button>

                {/* Discord Action */}
                <button
                  onClick={handleOrderDiscord}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span className="text-base">💬</span>
                  <span>Pedir por Discord ({owner.discord || 'xdavider'})</span>
                </button>
              </div>

              {/* Copy plain message button */}
              <button
                onClick={handleCopyOrderText}
                className="w-full py-2 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Copy size={14} />
                <span>Copiar mensaje de pedido al portapapeles</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setOrder({})}
                  className="text-[11px] text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Vaciar pedido
                </button>
                <span className="text-[11px] text-slate-400">
                  Total: {totalOrderCount} cartas
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Preview Modal */}
      {selectedCardForModal && (
        <div 
          onClick={() => setSelectedCardForModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-dark-900 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-center"
          >
            <button
              onClick={() => setSelectedCardForModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X size={16} />
            </button>

            <img
              src={selectedCardForModal.image_url}
              alt={selectedCardForModal.name}
              className="w-full rounded-2xl shadow-2xl border border-white/10 aspect-[744/1039] object-cover"
            />

            <div>
              <h3 className="text-base font-extrabold text-white">{selectedCardForModal.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedCardForModal.rarity} • {selectedCardForModal.card_type} • {selectedCardForModal.element || 'Neutral'}
              </p>
              <p className="text-xs text-amber-300 font-bold mt-2">
                Stock disponible: {selectedCardForModal.saleTotal}x
              </p>
            </div>

            <button
              onClick={() => {
                handleUpdateOrder(selectedCardForModal.id, 1, selectedCardForModal.saleTotal);
                setSelectedCardForModal(null);
                showToast(`¡${selectedCardForModal.name} añadida a tu pedido!`);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-black text-xs shadow-glow-primary transition-all"
            >
              Añadir a mi pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
