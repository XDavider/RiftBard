import React, { useState, useEffect, useMemo } from 'react';
import appLogo from '../assets/logo.png';
import {
  Search, Filter, ShoppingBag, X, Check, Copy, ExternalLink,
  ChevronDown, RotateCcw, Sparkles, Layers, Shield, Eye, Lock, ArrowUpDown, Instagram
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
    activeBg: 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_16px_rgba(168,85,247,0.45)]',
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
  const [showFilters, setShowFilters] = useState(false);
  
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
      <header className="sticky top-0 z-40 bg-dark-950/95 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-8 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Owner Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 opacity-50 blur-md group-hover:opacity-80 transition-opacity" />
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-dark-900 border border-amber-400/50 flex items-center justify-center overflow-hidden p-1 shadow-glow-primary">
                <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent truncate">
                  RiftBard
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  Venta
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                <span>Catálogo de </span>
                <span className="text-slate-200 font-semibold">David</span>
              </p>
            </div>
          </div>

          {/* Socials & Cart Access */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Instagram Contact */}
            <a
              href={owner.instagramUrl || 'https://www.instagram.com/david_de_dora/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90 text-xs font-bold transition-all shadow-md shrink-0 active:scale-95"
              title="Instagram de David (@david_de_dora)"
            >
              <Instagram size={15} className="shrink-0" />
              <span className="hidden sm:inline ml-1.5 font-bold">Instagram</span>
            </a>

            {/* Discord Contact */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(owner.discord || 'xdavider');
                showToast(`Discord copiado: ${owner.discord || 'xdavider'}`);
              }}
              className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-500/60 text-xs font-semibold transition-all shadow-sm shrink-0"
              title="Copiar Discord"
            >
              <span className="text-sm">💬</span>
              <span className="hidden md:inline ml-1">Discord ({owner.discord || 'xdavider'})</span>
            </button>

            {/* Direct Cart Button - Always visible on mobile & desktop */}
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95 touch-manipulation ${
                totalOrderCount > 0
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-dark-950 shadow-glow-primary ring-1 ring-amber-300/60 font-black'
                  : 'bg-white/[0.06] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Abrir cesta de pedido"
            >
              <ShoppingBag size={14} className={totalOrderCount > 0 ? 'text-dark-950' : 'text-amber-400'} />
              <span>Cesta</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                totalOrderCount > 0
                  ? 'bg-dark-950 text-amber-300'
                  : 'bg-dark-900 text-slate-400'
              }`}>
                {totalOrderCount}
              </span>
            </button>

            {/* Back to Vault / Owner Login */}
            {onExitPublicMode && (
              <button
                onClick={onExitPublicMode}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-xs font-medium transition-all"
                title="Acceder a la Bóveda con contraseña"
              >
                <Lock size={13} />
                <span className="hidden lg:inline">Bóveda</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6 flex-1 flex flex-col gap-5 sm:gap-6">
        
        {/* Hero Banner */}
        <section className="relative rounded-3xl bg-gradient-to-br from-dark-900/90 via-dark-950 to-dark-900/80 border border-white/10 p-4 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Sparkles size={13} className="text-amber-400" />
                <span>Cartas disponibles para compra o trade</span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                Elige tus cartas y pídeme tu lista directamente
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Aquí tienes todas las cartas de mi colección a la venta. 
                Pulsa en <span className="text-amber-300 font-semibold">+ Añadir al pedido</span> en las que quieras y toca en <span className="text-amber-300 font-semibold">Cesta</span> para enviarme tu mensaje por Instagram o Discord.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 shrink-0">
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-2.5 sm:p-3 text-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">A la venta</span>
                <span className="text-base sm:text-xl font-black text-amber-400">{saleData.stats?.totalCopies || 0}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">copias</span>
              </div>
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-2.5 sm:p-3 text-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Distintas</span>
                <span className="text-base sm:text-xl font-black text-white">{saleData.stats?.uniqueCards || 0}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">cartas</span>
              </div>
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-2.5 sm:p-3 text-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Normales</span>
                <span className="text-base sm:text-xl font-black text-slate-200">{saleData.stats?.normalCopies || 0}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">copias</span>
              </div>
              <div className="bg-dark-950/80 border border-white/[0.08] rounded-2xl p-2.5 sm:p-3 text-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Foils✨</span>
                <span className="text-base sm:text-xl font-black text-amber-300">{saleData.stats?.foilCopies || 0}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">brillantes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-dark-900/90 border border-white/[0.08] rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col gap-3 backdrop-blur-xl">
          
          {/* Search, Sort & Filter Toggle Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o texto..."
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

            {/* Controls: Sort + Filter Toggle + Clear */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <label className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                  <ArrowUpDown size={13} />
                  <span className="hidden sm:inline">Ordenar:</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-dark-950 border border-white/10 rounded-xl px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer flex-1 sm:flex-initial"
                >
                  <option value="name">Nombre (A-Z)</option>
                  <option value="cost">Coste de Energía</option>
                  <option value="stock">Mayor Stock</option>
                </select>
              </div>

              {/* Collapsible Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(prev => !prev)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 touch-manipulation ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-dark-950 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                }`}
                title={showFilters ? 'Ocultar panel de filtros' : 'Desplegar panel de filtros'}
              >
                <Filter size={13} className={activeFiltersCount > 0 ? 'text-amber-400' : ''} />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-dark-950 text-[10px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  title="Restablecer todos los filtros"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Filters Content (Desplegable) */}
          {showFilters && (
            <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.08] animate-fade-in">
              {/* Elemental Domain Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
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
                      className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all flex items-center gap-1.5 active:scale-95 touch-manipulation ${
                        active ? styles.activeBg : styles.inactiveBg
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                      <span>{dom}</span>
                    </button>
                  );
                })}
              </div>

              {/* Rarities */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.05]">
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
                      className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all active:scale-95 touch-manipulation ${
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
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.05]">
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
                      className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all active:scale-95 touch-manipulation ${
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
          )}
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
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-3.5 md:gap-4 pb-28">
            {filteredCards.map(card => {
              const qtyInOrder = order[card.id] || 0;
              const maxStock = card.saleTotal || 0;
              const isSelected = qtyInOrder > 0;
              const rarityStyle = RARITY_COLORS[card.rarity] || 'text-slate-300 border-white/10';

              return (
                <div
                  key={card.id}
                  className={`relative flex flex-col bg-dark-900/90 rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg group ${
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
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-dark-950 text-slate-400">
                        <Layers size={22} className="mb-1 opacity-50" />
                        <span className="text-[10px] font-bold text-slate-200">{card.name}</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />

                    {/* Energy Cost Badge */}
                    {card.energy_cost !== null && card.energy_cost !== undefined && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-dark-950/90 border border-amber-400/60 flex items-center justify-center text-amber-300 font-extrabold text-[10px] sm:text-xs shadow-lg backdrop-blur-md">
                        {card.energy_cost}
                      </div>
                    )}

                    {/* Rarity & Domain Pill */}
                    <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1">
                      <span className={`text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full border backdrop-blur-md ${rarityStyle}`}>
                        {card.rarity}
                      </span>
                    </div>

                    {/* Click preview prompt (hover on desktop) */}
                    <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover/art:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                      <span className="px-2 py-1 rounded-xl bg-dark-900/90 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1 shadow-lg backdrop-blur-md">
                        <Eye size={12} /> Ver detalle
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-1.5 sm:p-2.5 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2">
                    <div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors" title={card.name}>
                        {card.name}
                      </h4>
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate pr-1">{card.card_type}</span>
                        <span className="shrink-0 font-mono text-[8px] sm:text-[9px] text-slate-400">{card.card_code || ''}</span>
                      </div>
                    </div>

                    {/* Available Stock Tag */}
                    <div className="flex items-center justify-between px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl bg-dark-950/80 border border-white/[0.06] text-[9px] sm:text-[10px]">
                      <span className="text-slate-400 font-medium">Stock:</span>
                      <div className="flex items-center gap-0.5 sm:gap-1 font-bold">
                        <span className="text-amber-400">{maxStock}x</span>
                        <span className="text-slate-400 text-[8px] sm:text-[9px]">
                          ({card.saleNormal > 0 ? `${card.saleNormal}N` : ''}
                          {card.saleNormal > 0 && card.saleFoil > 0 ? '/' : ''}
                          {card.saleFoil > 0 ? `${card.saleFoil}F✨` : ''})
                        </span>
                      </div>
                    </div>

                    {/* Order Action Button / Stepper */}
                    {qtyInOrder === 0 ? (
                      <button
                        onClick={() => handleUpdateOrder(card.id, 1, maxStock)}
                        className="w-full py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-dark-950 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all active:scale-95 touch-manipulation min-h-[30px] sm:min-h-[36px]"
                      >
                        <span>+ Añadir</span>
                        <span className="hidden sm:inline">al pedido</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-amber-500/20 border border-amber-400/60 rounded-lg sm:rounded-xl p-0.5 shadow-sm min-h-[30px] sm:min-h-[36px]">
                        <button
                          onClick={() => handleUpdateOrder(card.id, -1, maxStock)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-dark-950/80 hover:bg-dark-900 text-amber-300 flex items-center justify-center font-bold text-xs sm:text-sm transition-colors active:scale-95 touch-manipulation"
                          aria-label="Restar una unidad"
                        >
                          -
                        </button>
                        <div className="text-center font-extrabold text-[11px] sm:text-xs text-amber-200">
                          <span>{qtyInOrder}</span>
                          <span className="text-[9px] sm:text-[10px] text-amber-400/60 font-medium">/{maxStock}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateOrder(card.id, 1, maxStock)}
                          disabled={qtyInOrder >= maxStock}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm transition-colors active:scale-95 touch-manipulation ${
                            qtyInOrder >= maxStock
                              ? 'bg-dark-950/40 text-slate-600 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 text-dark-950'
                          }`}
                          aria-label="Añadir una unidad"
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

      {/* Floating Bottom-Right Cart Button (FAB) */}
      {totalOrderCount > 0 && (
        <button
          onClick={() => setIsOrderModalOpen(true)}
          aria-label="Ver cesta de pedido"
          title="Ver cesta de pedido"
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] right-4 sm:right-7 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-dark-950 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.55)] border-2 border-amber-200 flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all touch-manipulation animate-card-pop group"
        >
          <ShoppingBag size={25} className="group-hover:scale-110 transition-transform text-dark-950 stroke-[2.4]" />
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-red-600 text-white text-[11px] font-black border-2 border-dark-950 flex items-center justify-center shadow-lg animate-pulse-slow">
            {totalOrderCount}
          </span>
        </button>
      )}

      {/* Order Modal / Drawer (Native-feeling Bottom Sheet on Mobile, Centered Modal on Desktop) */}
      {isOrderModalOpen && (
        <div 
          onClick={() => setIsOrderModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-xl bg-dark-900 border-t sm:border border-white/15 rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up sm:animate-card-pop"
          >
            {/* Mobile Drawer Drag Handle indicator */}
            <div className="sm:hidden w-full pt-3 pb-1 flex justify-center bg-dark-950/80 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-dark-950/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Tu Cesta de Pedido</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    {totalOrderCount === 0 
                      ? 'No has añadido ninguna carta todavía'
                      : `${totalOrderCount} carta${totalOrderCount > 1 ? 's' : ''} para pedir a David`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 touch-manipulation"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Selected Cards List or Empty state */}
            <div className="p-3 sm:p-6 overflow-y-auto space-y-2.5 custom-scrollbar flex-1 overscroll-contain min-h-0">
              {orderItems.length === 0 ? (
                <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center gap-3 text-slate-400 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShoppingBag size={30} />
                  </div>
                  <h4 className="text-base font-bold text-white">Tu cesta está vacía</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Navega por las cartas a la venta y pulsa <span className="text-amber-300 font-semibold">+ Añadir al pedido</span> en las que quieras pedirme.
                  </p>
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-dark-950 font-bold text-xs hover:bg-amber-400 shadow-glow-primary transition-all active:scale-95 touch-manipulation"
                  >
                    Ver cartas a la venta
                  </button>
                </div>
              ) : (
                orderItems.map(({ card, qty }) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-dark-950/80 border border-white/[0.06] hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={card.image_url}
                        alt={card.name}
                        className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{card.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {card.rarity} • {card.card_type}
                        </p>
                        <p className="text-[10px] text-amber-300 font-semibold mt-0.5 truncate">
                          Disponible: {card.saleTotal}x ({card.saleNormal > 0 ? `${card.saleNormal}N` : ''}
                          {card.saleNormal > 0 && card.saleFoil > 0 ? ' / ' : ''}
                          {card.saleFoil > 0 ? `${card.saleFoil}F✨` : ''})
                        </p>
                      </div>
                    </div>

                    {/* Quantity adjustment */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <div className="flex items-center bg-dark-900 border border-white/10 rounded-xl p-0.5">
                        <button
                          onClick={() => handleUpdateOrder(card.id, -1, card.saleTotal)}
                          className="w-8 h-8 rounded-lg hover:bg-white/10 text-amber-300 font-bold flex items-center justify-center text-sm active:scale-95 touch-manipulation"
                          aria-label="Restar una carta"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-black text-white">{qty}</span>
                        <button
                          onClick={() => handleUpdateOrder(card.id, 1, card.saleTotal)}
                          disabled={qty >= card.saleTotal}
                          className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-sm active:scale-95 touch-manipulation ${
                            qty >= card.saleTotal ? 'text-slate-600' : 'hover:bg-white/10 text-amber-300'
                          }`}
                          aria-label="Añadir una carta"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleUpdateOrder(card.id, -999, card.saleTotal)}
                        className="text-slate-500 hover:text-red-400 p-2 transition-colors touch-manipulation"
                        title="Eliminar de la lista"
                        aria-label="Eliminar carta"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer: Direct Request Buttons */}
            {orderItems.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-dark-950/95 flex flex-col gap-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] shrink-0">
                <span className="text-[11px] sm:text-xs font-bold text-slate-300">
                  Elige cómo quieres enviarle la lista a David:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Instagram Action */}
                  <button
                    onClick={handleOrderInstagram}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all touch-manipulation"
                  >
                    <Instagram size={18} className="shrink-0 text-white" />
                    <span>Pedir por Instagram</span>
                  </button>

                  {/* Discord Action */}
                  <button
                    onClick={handleOrderDiscord}
                    className="w-full py-3 px-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all touch-manipulation"
                  >
                    <span className="text-base">💬</span>
                    <span>Pedir por Discord ({owner.discord || 'xdavider'})</span>
                  </button>
                </div>

                {/* Copy plain message button */}
                <button
                  onClick={handleCopyOrderText}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/10 active:scale-[0.98] border border-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all touch-manipulation"
                >
                  <Copy size={14} />
                  <span>Copiar mensaje al portapapeles</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setOrder({})}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold transition-colors py-1 px-1 touch-manipulation"
                  >
                    Vaciar cesta
                  </button>
                  <span className="text-[11px] text-slate-400 font-bold">
                    Total: {totalOrderCount} cartas
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Preview Modal */}
      {selectedCardForModal && (
        <div 
          onClick={() => setSelectedCardForModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-dark-900 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-center max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedCardForModal(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center touch-manipulation"
            >
              <X size={16} />
            </button>

            <img
              src={selectedCardForModal.image_url}
              alt={selectedCardForModal.name}
              className="w-full max-h-[50vh] sm:max-h-none rounded-2xl shadow-2xl border border-white/10 aspect-[744/1039] object-contain sm:object-cover mx-auto"
            />

            <div>
              <h3 className="text-base font-extrabold text-white">{selectedCardForModal.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedCardForModal.rarity} • {selectedCardForModal.card_type} • {selectedCardForModal.element || 'Neutral'}
              </p>
              <p className="text-xs text-amber-300 font-bold mt-1.5">
                Stock disponible: {selectedCardForModal.saleTotal}x
              </p>
            </div>

            <button
              onClick={() => {
                handleUpdateOrder(selectedCardForModal.id, 1, selectedCardForModal.saleTotal);
                setSelectedCardForModal(null);
                showToast(`¡${selectedCardForModal.name} añadida a tu pedido!`);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-black text-xs shadow-glow-primary transition-all active:scale-95 touch-manipulation"
            >
              Añadir a mi pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
