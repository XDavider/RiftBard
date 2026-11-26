import React, { useState, useEffect, useMemo, useRef } from 'react';
import appLogo from '../assets/logo.png';
import { PREDEFINED_EXPANSIONS } from './AddCustomItemModal';
import {
  Search, Filter, ShoppingBag, X, Copy,
  RotateCcw, ArrowUpDown, Instagram, Github, Linkedin,
  Star, BookmarkCheck, Check, Plus, Minus, Sun, Moon, MessageCircle, Eye, Package
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
  { key: 'Product', label: 'Productos', textCls: 'text-amber-700 dark:text-amber-300', dotCls: 'bg-amber-600', isProduct: true },
  { key: 'Multi', label: 'Multidominio', textCls: 'text-[#B45309] dark:text-amber-400', dotCls: 'bg-amber-500', icon: null },
  { key: 'Order', label: 'Orden', textCls: 'text-yellow-600 dark:text-yellow-400', dotCls: 'bg-yellow-400', icon: 'https://cdn.piltoverarchive.com/colors/Order.webp' },
  { key: 'Fury', label: 'Furia', textCls: 'text-red-600 dark:text-red-400', dotCls: 'bg-red-500', icon: 'https://cdn.piltoverarchive.com/colors/Fury.webp' },
  { key: 'Mind', label: 'Mente', textCls: 'text-blue-600 dark:text-blue-400', dotCls: 'bg-blue-500', icon: 'https://cdn.piltoverarchive.com/colors/Mind.webp' },
  { key: 'Chaos', label: 'Caos', textCls: 'text-purple-600 dark:text-purple-400', dotCls: 'bg-purple-500', icon: 'https://cdn.piltoverarchive.com/colors/Chaos.webp' },
  { key: 'Body', label: 'Cuerpo', textCls: 'text-orange-600 dark:text-orange-400', dotCls: 'bg-orange-500', icon: 'https://cdn.piltoverarchive.com/colors/Body.webp' },
  { key: 'Calm', label: 'Calma', textCls: 'text-emerald-600 dark:text-emerald-400', dotCls: 'bg-emerald-500', icon: 'https://cdn.piltoverarchive.com/colors/Calm.webp' },
  { key: 'Colorless', label: 'Incoloro', textCls: 'text-ink-secondary', dotCls: 'bg-slate-400', icon: null }
];

const isFoilInspectRarity = (card) => {
  if (!card) return false;
  const r = (card.rarity || '').toLowerCase();
  const t = (card.card_type || '').toLowerCase();
  return ['rare', 'epic', 'legendary', 'legend', 'showcase', 'promo'].includes(r) || t === 'legend';
};

const DiscordIcon = ({ size = 16, className = 'shrink-0 fill-current' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

function getCardDomainKey(card) {
  const cardType = (card.card_type || '').toLowerCase();
  const tags = (card.tags || '').toLowerCase();
  if (cardType === 'producto' || cardType === 'product' || tags.includes('product')) {
    return 'Product';
  }
  const elem = (card.element || '').trim();
  if (!elem || elem.toLowerCase() === 'colorless') return 'Colorless';
  if (elem.includes(',') || elem.toLowerCase().includes('multi')) return 'Multi';
  return elem;
}

/**
 * Real infinite-loop carousel when items overflow the container width;
 * static row when all items fit on screen.
 * Supports auto-scroll, touch swipe, manual mouse drag (pointer events),
 * and drag-and-drop reordering when onReorder is provided.
 */
function LoopingCarousel({ items, renderItem, onReorder }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [shouldLoop, setShouldLoop] = useState(false);
  const [paused, setPaused] = useState(false);

  // Mouse drag-scroll state
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const resumeTimerRef = useRef(null);

  // Drag and drop item reorder state
  const draggedIdRef = useRef(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !trackRef.current) return;
      const singleWidth = shouldLoop ? trackRef.current.scrollWidth / 2 : trackRef.current.scrollWidth;
      setShouldLoop(singleWidth > containerRef.current.clientWidth + 4);
    };
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [items.length, shouldLoop]);

  useEffect(() => {
    if (!shouldLoop || paused) return;
    let rafId;
    let last = performance.now();
    let acc = 0;
    const step = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const el = containerRef.current;
      if (el) {
        acc += dt * 0.055;
        if (acc >= 1) {
          const px = Math.floor(acc);
          acc -= px;
          const half = el.scrollWidth / 2;
          el.scrollLeft += px;
          if (el.scrollLeft >= half) {
            el.scrollLeft -= half;
          }
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [shouldLoop, paused]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return; // Only primary mouse button
    // Ignore clicks on buttons or form elements
    if (e.target.closest('button') || e.target.closest('input')) return;
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = containerRef.current ? containerRef.current.scrollLeft : 0;
    hasDraggedRef.current = false;
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const onPointerMove = (e) => {
    if (!isPointerDownRef.current || !containerRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) {
      hasDraggedRef.current = true;
    }
    const el = containerRef.current;
    el.scrollLeft = startScrollLeftRef.current - dx;
    if (shouldLoop) {
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      else if (el.scrollLeft < 0) el.scrollLeft += half;
    }
  };

  const onPointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    resumeTimerRef.current = setTimeout(() => {
      setPaused(false);
      hasDraggedRef.current = false;
    }, 1800);
  };

  // Drag & drop handlers for reordering cards
  const handleDragStart = (e, item) => {
    draggedIdRef.current = item.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    setPaused(true);
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetId !== item.id) {
      setDropTargetId(item.id);
    }
  };

  const handleDragLeave = (e, item) => {
    if (dropTargetId === item.id) {
      setDropTargetId(null);
    }
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    setDropTargetId(null);
    const sourceId = draggedIdRef.current || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetItem.id) {
      draggedIdRef.current = null;
      setPaused(false);
      return;
    }

    if (onReorder) {
      const currentIndex = items.findIndex(it => it.id === sourceId);
      const targetIndex = items.findIndex(it => it.id === targetItem.id);
      if (currentIndex !== -1 && targetIndex !== -1) {
        const updated = [...items];
        const [moved] = updated.splice(currentIndex, 1);
        updated.splice(targetIndex, 0, moved);
        onReorder(updated);
      }
    }
    draggedIdRef.current = null;
    resumeTimerRef.current = setTimeout(() => setPaused(false), 1200);
  };

  const handleDragEnd = () => {
    draggedIdRef.current = null;
    setDropTargetId(null);
    resumeTimerRef.current = setTimeout(() => setPaused(false), 1200);
  };

  const listToRender = shouldLoop ? [...items, ...items] : items;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (!isPointerDownRef.current) setPaused(false);
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => setPaused(false), 1800);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="overflow-x-auto no-scrollbar pb-1 cursor-grab active:cursor-grabbing select-none"
    >
      <div ref={trackRef} className="flex gap-2 sm:gap-3.5 w-max">
        {listToRender.map((item, idx) => {
          const isTarget = dropTargetId === item.id;
          return (
            <div
              key={`${item.id}-${idx}`}
              className={`shrink-0 w-[112px] sm:w-[165px] transition-transform duration-150 ${
                isTarget ? 'scale-105 ring-2 ring-[#B45309] rounded-xl' : ''
              }`}
              draggable={Boolean(onReorder)}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={(e) => handleDragLeave(e, item)}
              onDrop={(e) => handleDrop(e, item)}
              onDragEnd={handleDragEnd}
              onClickCapture={(e) => {
                if (hasDraggedRef.current) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
            >
              {renderItem(item, idx)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Interactive 3D Card Inspection Modal (no text clutter, foil shimmer on Rare+ & Promo)
 */
function CardInspect3DModal({ card, onClose }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const cardRef = useRef(null);
  const hasFoil = isFoilInspectRarity(card);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!card) return null;

  const updateTilt = (clientX, clientY) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const ry = (px - 0.5) * 28;
    const rx = (0.5 - py) * 28;
    setTilt({ rx, ry, gx: px * 100, gy: py * 100 });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-[110] min-w-[44px] min-h-[44px] rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center cursor-pointer"
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>

      <div
        className="flex flex-col items-center gap-3 select-none"
        style={{ perspective: '950px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={cardRef}
          onMouseMove={(e) => updateTilt(e.clientX, e.clientY)}
          onMouseLeave={resetTilt}
          onTouchMove={(e) => {
            if (e.touches[0]) updateTilt(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={resetTilt}
          className="relative w-72 sm:w-80 aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-transform duration-150 ease-out touch-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.02)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {card.image_url ? (
            <img src={card.image_url} alt={card.name} className="w-full h-full object-cover pointer-events-none" />
          ) : (
            <div className="w-full h-full bg-subtle flex items-center justify-center text-sm text-ink-muted">Sin Imagen</div>
          )}

          {/* Foil holographic sheen only for Rare+ and Promo */}
          {hasFoil && (
            <>
              <div className="absolute inset-0 foil-shimmer pointer-events-none opacity-65 mix-blend-color-dodge" />
              <div
                className="absolute inset-0 pointer-events-none opacity-55"
                style={{
                  background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.55) 0%, rgba(255,215,120,0.18) 30%, transparent 65%)`
                }}
              />
            </>
          )}
        </div>
        <span className="text-xs text-white/75 font-medium">
          Mueve el dedo o ratón para inspeccionar en 3D
        </span>
      </div>
    </div>
  );
}

export default function PublicSaleView() {
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState({ owner: {}, stats: {}, cards: [] });
  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [selectedExpansions, setSelectedExpansions] = useState([]);
  const [sortBy, setSortBy] = useState('cost');
  const [showFilters, setShowFilters] = useState(false);
  const [desiredCards, setDesiredCards] = useState([]);
  const [offeredCards, setOfferedCards] = useState([]);
  const [order, setOrder] = useState({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [flyingCards, setFlyingCards] = useState([]);
  const [cartPulse, setCartPulse] = useState(false);

  const floatingCartRef = useRef(null);
  const headerCartRef = useRef(null);

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
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? '#191B20' : '#FFFFFF');
    try {
      localStorage.setItem('riftbard_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
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
    instagramUrl: 'https://www.instagram.com/david_de_dora/',
    linkedinUrl: 'https://www.linkedin.com/in/david-bermudez-445785403',
    githubUrl: 'https://github.com/XDavider'
  };

  // User custom order for featured and wishlist carousels (persisted in localStorage)
  const [featuredOrder, setFeaturedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('riftbard_featured_carousel_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistOrder, setWishlistOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('riftbard_wishlist_carousel_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleReorderFeatured = (newItems) => {
    const ids = newItems.map(c => c.id);
    setFeaturedOrder(ids);
    try {
      localStorage.setItem('riftbard_featured_carousel_order', JSON.stringify(ids));
    } catch (e) {
      console.warn('Could not save featured order:', e);
    }
  };

  const handleReorderWishlist = (newItems) => {
    const ids = newItems.map(c => c.id);
    setWishlistOrder(ids);
    try {
      localStorage.setItem('riftbard_wishlist_carousel_order', JSON.stringify(ids));
    } catch (e) {
      console.warn('Could not save wishlist order:', e);
    }
  };

  const featuredCards = useMemo(() => {
    const list = allCards.filter(c => c.featured);
    if (featuredOrder.length > 0) {
      const orderMap = new Map(featuredOrder.map((id, index) => [id, index]));
      return list.slice().sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
        if (idxA !== idxB) return idxA - idxB;
        const aIsLegend = (a.card_type || '').toLowerCase() === 'legend' || (a.rarity || '').toLowerCase() === 'legend';
        const bIsLegend = (b.card_type || '').toLowerCase() === 'legend' || (b.rarity || '').toLowerCase() === 'legend';
        if (aIsLegend && !bIsLegend) return -1;
        if (!aIsLegend && bIsLegend) return 1;
        return 0;
      });
    }
    return list.slice().sort((a, b) => {
      const aIsLegend = (a.card_type || '').toLowerCase() === 'legend' || (a.rarity || '').toLowerCase() === 'legend';
      const bIsLegend = (b.card_type || '').toLowerCase() === 'legend' || (b.rarity || '').toLowerCase() === 'legend';
      if (aIsLegend && !bIsLegend) return -1;
      if (!aIsLegend && bIsLegend) return 1;
      return 0;
    });
  }, [allCards, featuredOrder]);

  const sortedDesiredCards = useMemo(() => {
    const list = desiredCards || [];
    if (wishlistOrder.length > 0) {
      const orderMap = new Map(wishlistOrder.map((id, index) => [id, index]));
      return list.slice().sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
        if (idxA !== idxB) return idxA - idxB;
        const aIsLegend = (a.card_type || '').toLowerCase() === 'legend' || (a.rarity || '').toLowerCase() === 'legend';
        const bIsLegend = (b.card_type || '').toLowerCase() === 'legend' || (b.rarity || '').toLowerCase() === 'legend';
        if (aIsLegend && !bIsLegend) return -1;
        if (!aIsLegend && bIsLegend) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
    }
    return list.slice().sort((a, b) => {
      const aIsLegend = (a.card_type || '').toLowerCase() === 'legend' || (a.rarity || '').toLowerCase() === 'legend';
      const bIsLegend = (b.card_type || '').toLowerCase() === 'legend' || (b.rarity || '').toLowerCase() === 'legend';
      if (aIsLegend && !bIsLegend) return -1;
      if (!aIsLegend && bIsLegend) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [desiredCards, wishlistOrder]);

  const expansionOptions = useMemo(() => {
    const counts = {};
    allCards.forEach(card => {
      if (card.set_name && PREDEFINED_EXPANSIONS.includes(card.set_name)) {
        counts[card.set_name] = (counts[card.set_name] || 0) + 1;
      }
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
          if (d === 'Product') {
            const cardType = (card.card_type || '').toLowerCase();
            const tags = (card.tags || '').toLowerCase();
            return cardType === 'producto' || cardType === 'product' || tags.includes('product');
          }
          if (d === 'Multi') return (card.element || '').includes(',') || (card.element || '').toLowerCase().includes('multi');
          if (d === 'Colorless') return !card.element || card.element.toLowerCase() === 'colorless';
          return card.element?.toLowerCase().includes(d.toLowerCase());
        })) return false;
      }
      if (selectedRarities.length > 0) {
        if (!selectedRarities.some(r => card.rarity?.toLowerCase() === r.toLowerCase())) return false;
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
  }, [allCards, search, selectedDomains, selectedRarities, selectedExpansions, sortBy]);

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

  const spawnFlyAnimation = (card, sourceEl) => {
    if (!sourceEl) return;
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetEl = floatingCartRef.current || headerCartRef.current;
    const targetRect = targetEl
      ? targetEl.getBoundingClientRect()
      : { left: window.innerWidth - 48, top: window.innerHeight - 48, width: 40, height: 40 };

    const flyId = `${card.id}-${Date.now()}-${Math.random()}`;
    const startX = sourceRect.left + sourceRect.width / 2 - 22;
    const startY = sourceRect.top + sourceRect.height / 2 - 30;
    const endX = targetRect.left + targetRect.width / 2 - 22;
    const endY = targetRect.top + targetRect.height / 2 - 30;

    setFlyingCards(prev => [...prev, { id: flyId, imageUrl: card.image_url, startX, startY, endX, endY, active: false }]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyingCards(prev => prev.map(fc => (fc.id === flyId ? { ...fc, active: true } : fc)));
      });
    });

    setTimeout(() => {
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 300);
      setFlyingCards(prev => prev.filter(fc => fc.id !== flyId));
    }, 450);
  };

  const handleToggleOfferDesired = (card, e = null) => {
    const exists = offeredCards.some(c => c.id === card.id);
    if (exists) {
      setOfferedCards(prev => prev.filter(c => c.id !== card.id));
      showToast(`Quitada de tu propuesta: ${card.name}`);
    } else {
      if (e?.currentTarget) spawnFlyAnimation(card, e.currentTarget);
      setOfferedCards(prev => [...prev, card]);
      showToast(`Añadida para cambio: ${card.name}`);
    }
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

  const handleTapCardToAdd = (card, e) => {
    const max = card.saleTotal || 1;
    const current = order[card.id] || 0;
    if (current >= max) {
      showToast(`Ya tienes todas las copias (${max}x) en la cesta`);
      return;
    }
    handleUpdateOrder(card.id, 1, max);
    spawnFlyAnimation(card, e.currentTarget);
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
    setSelectedExpansions([]);
    setSortBy('cost');
  };

  const activeFiltersCount = selectedDomains.length + selectedRarities.length + selectedExpansions.length;

  const renderSaleCardTile = (card, keyPrefix = 'cat') => {
    const max = card.saleTotal || 1;
    const qty = order[card.id] || 0;
    const isMaxed = qty >= max;
    const isBattlefield = card.card_type?.toLowerCase() === 'battlefield';

    return (
      <article
        key={`${keyPrefix}-${card.id}`}
        onClick={(e) => handleTapCardToAdd(card, e)}
        className={`relative group rounded-xl overflow-hidden bg-subtle border cursor-pointer select-none transition-all duration-200 active:scale-[0.97] ${
          isBattlefield ? 'aspect-[88/63]' : 'aspect-[2.5/3.5]'
        } ${
          isMaxed
            ? 'border-line'
            : qty > 0
              ? 'border-[#15803D] ring-2 ring-[#15803D]/30'
              : 'border-line hover:border-[#B45309]/70'
        }`}
        title={isMaxed ? 'Todas las copias en la cesta' : 'Toca para añadir 1 copia a la cesta'}
      >
        {/* Left Red Gradient Minus Strip when qty > 0 (stays vivid red even when image is grayscale) */}
        {qty > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateOrder(card.id, -1, max);
            }}
            className="absolute inset-y-0 left-0 w-9 z-20 bg-gradient-to-r from-red-600/90 via-red-600/45 to-transparent flex items-center justify-start pl-1.5 text-white hover:from-red-600 cursor-pointer"
            title="Retirar 1 copia de la cesta"
            aria-label="Retirar 1 copia"
          >
            <span className="w-5 h-5 rounded-full bg-red-600 border border-white/50 flex items-center justify-center shadow">
              <Minus size={12} strokeWidth={3} />
            </span>
          </button>
        )}

        {/* Top-Right Available Count Badge */}
        <div className="absolute top-1.5 right-1.5 z-20">
          <div
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-sm tabular-nums ${
              isMaxed
                ? 'bg-[#161615] text-white border-white/25'
                : qty > 0
                  ? 'bg-[#15803D] text-white border-green-300/50'
                  : 'bg-black/75 text-white border-white/20'
            }`}
          >
            {qty > 0 ? `${qty}/${max}` : `${max}x`}
          </div>
        </div>

        {/* Quick Inspect Button (Top-Left) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCardForModal(card);
          }}
          className="absolute top-1.5 left-1.5 z-30 w-7 h-7 rounded-full bg-black/65 hover:bg-black/85 text-white/90 border border-white/20 flex items-center justify-center transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          title="Inspeccionar carta en 3D"
          aria-label="Inspeccionar carta"
        >
          <Eye size={13} />
        </button>

        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.name}
            className={`w-full h-full object-cover transition-all duration-200 ${isMaxed ? 'grayscale opacity-55' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">Sin Imagen</div>
        )}

        {/* Bottom Title Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 px-2 pb-1.5 pt-6 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none">
          <p className="text-[11px] font-semibold text-white truncate drop-shadow-sm">{card.name}</p>
        </div>
      </article>
    );
  };

  const renderWishCardTile = (card) => {
    const isOffered = offeredCards.some(c => c.id === card.id);
    const isBattlefield = card.card_type?.toLowerCase() === 'battlefield';
    const desiredQty = card.quantity || 1;

    return (
      <article
        key={`wish-${card.id}`}
        onClick={(e) => handleToggleOfferDesired(card, e)}
        className={`relative group rounded-xl overflow-hidden bg-subtle border cursor-pointer select-none transition-all duration-200 active:scale-[0.97] ${
          isBattlefield ? 'aspect-[88/63]' : 'aspect-[2.5/3.5]'
        } ${
          isOffered
            ? 'grayscale opacity-75 border-[#1D4ED8] ring-2 ring-[#1D4ED8]/40'
            : 'border-blue-300/60 dark:border-blue-800/70 hover:border-[#1D4ED8]'
        }`}
        title={isOffered ? 'En tu propuesta de cambio' : 'Toca si tienes esta carta para ofrecerla'}
      >
        {/* Left Red Gradient Minus Strip when offered */}
        {isOffered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleOfferDesired(card);
            }}
            className="absolute inset-y-0 left-0 w-9 z-20 bg-gradient-to-r from-red-600/85 via-red-600/45 to-transparent flex items-center justify-start pl-1.5 text-white hover:from-red-600 cursor-pointer"
            title="Quitar de tu propuesta"
            aria-label="Quitar de propuesta"
          >
            <span className="w-5 h-5 rounded-full bg-red-600 border border-white/40 flex items-center justify-center shadow">
              <Minus size={12} strokeWidth={3} />
            </span>
          </button>
        )}

        {/* Top-Right Desired Count Badge */}
        <div className="absolute top-1.5 right-1.5 z-20">
          <div
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-sm tabular-nums ${
              isOffered
                ? 'bg-[#1D4ED8] text-white border-blue-300/50'
                : 'bg-black/75 text-white border-white/20'
            }`}
          >
            {isOffered ? 'Ofrecida' : `${desiredQty}x`}
          </div>
        </div>

        {/* Quick Inspect Button (Top-Left) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCardForModal(card);
          }}
          className="absolute top-1.5 left-1.5 z-30 w-7 h-7 rounded-full bg-black/65 hover:bg-black/85 text-white/90 border border-white/20 flex items-center justify-center transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          title="Inspeccionar carta en 3D"
          aria-label="Inspeccionar carta"
        >
          <Eye size={13} />
        </button>

        {card.image_url ? (
          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-ink-muted">Sin Imagen</div>
        )}

        {/* Bottom Title Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 px-2 pb-1.5 pt-6 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none">
          <p className="text-[11px] font-semibold text-white truncate drop-shadow-sm">{card.name}</p>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-app font-sans text-ink-primary flex flex-col">
      {/* Flying Card Animation Layer */}
      {flyingCards.map(fc => (
        <div
          key={fc.id}
          className="fixed z-[150] w-11 h-16 rounded-lg overflow-hidden border-2 border-[#B45309] shadow-xl pointer-events-none transition-all duration-[420ms] ease-in-out"
          style={{
            left: fc.active ? `${fc.endX}px` : `${fc.startX}px`,
            top: fc.active ? `${fc.endY}px` : `${fc.startY}px`,
            transform: fc.active ? 'scale(0.35) rotate(12deg)' : 'scale(1.05) rotate(0deg)',
            opacity: fc.active ? 0.25 : 1
          }}
        >
          {fc.imageUrl && <img src={fc.imageUrl} alt="" className="w-full h-full object-cover" />}
        </div>
      ))}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[120] bg-[#161615] dark:bg-[#F3F4F6] text-white dark:text-[#161615] px-4 py-2 rounded-xl shadow-lg font-semibold text-xs flex items-center gap-2 whitespace-nowrap">
          <Check size={14} className="text-[#15803D] dark:text-green-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header + Attached Branded Social Strip on Mobile */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-subtle border border-line flex items-center justify-center overflow-hidden p-0.5 shrink-0">
              <img src={appLogo} alt="RiftBard Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold font-display text-ink-primary">RiftBard</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/50 text-[#15803D] dark:text-green-300 border border-green-200 dark:border-green-800 shrink-0">
                  Venta
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-700/60 shrink-0">
                  v2.1
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary truncate">
                Catálogo de <strong className="text-ink-primary">{owner.displayName || 'David'}</strong> · {allCards.length} cartas
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
              className="hidden sm:flex min-h-[40px] px-2.5 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-semibold items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              title="Instagram"
            >
              <Instagram size={15} />
              <span className="hidden md:inline">Instagram</span>
            </a>

            <a
              href="https://github.com/XDavider/RiftBard"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex min-h-[40px] px-2.5 rounded-lg bg-[#24292F] text-white text-xs font-semibold items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              title="GitHub"
            >
              <Github size={15} />
              <span className="hidden md:inline">GitHub</span>
            </a>

            <a
              href={owner.linkedinUrl || 'https://www.linkedin.com/in/david-bermudez-445785403'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex min-h-[40px] px-2.5 rounded-lg bg-[#0A66C2] text-white text-xs font-semibold items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              title="LinkedIn"
            >
              <Linkedin size={15} />
              <span className="hidden md:inline">LinkedIn</span>
            </a>

            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(owner.discord || 'xdavider'); showToast(`Discord copiado: ${owner.discord || 'xdavider'}`); }}
              className="hidden sm:flex min-h-[40px] px-2.5 rounded-lg bg-[#5865F2] text-white text-xs font-semibold items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
              title="Copiar Discord"
            >
              <DiscordIcon size={15} />
              <span className="hidden lg:inline">{owner.discord || 'xdavider'}</span>
            </button>

            <button
              ref={headerCartRef}
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

        {/* Branded Mobile Social Strip attached below header */}
        <div className="sm:hidden border-t border-line bg-app/90 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <a
            href={owner.instagramUrl || 'https://www.instagram.com/david_de_dora/'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[32px] px-2.5 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-[11px] font-semibold flex items-center justify-center gap-1 shrink-0"
          >
            <Instagram size={13} /> Instagram
          </a>
          <a
            href="https://github.com/XDavider/RiftBard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[32px] px-2.5 rounded-lg bg-[#24292F] text-white text-[11px] font-semibold flex items-center justify-center gap-1 shrink-0"
          >
            <Github size={13} /> GitHub
          </a>
          <a
            href={owner.linkedinUrl || 'https://www.linkedin.com/in/david-bermudez-445785403'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[32px] px-2.5 rounded-lg bg-[#0A66C2] text-white text-[11px] font-semibold flex items-center justify-center gap-1 shrink-0"
          >
            <Linkedin size={13} /> LinkedIn
          </a>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(owner.discord || 'xdavider'); showToast(`Discord copiado: ${owner.discord || 'xdavider'}`); }}
            className="flex-1 min-h-[32px] px-2.5 rounded-lg bg-[#5865F2] text-white text-[11px] font-semibold flex items-center justify-center gap-1 shrink-0"
          >
            <DiscordIcon size={13} /> Discord
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col gap-5">
        {/* Compact Price Reference Notice */}
        <div className="px-3.5 py-2.5 rounded-xl bg-surface border border-line text-xs text-ink-secondary">
          <strong className="text-ink-primary">Referencia de precios:</strong> Venta y trade al precio mínimo de Cardmarket España.
        </div>

        {/* Quick Usage Guide Banner */}
        <div className="px-3.5 py-2.5 rounded-xl bg-surface border border-line text-xs text-ink-secondary">
          <strong className="text-ink-primary">Cómo pedir:</strong> Toca una carta para añadirla a la cesta, pulsa el botón rojo <strong>-</strong> a la izquierda para retirar copias, y el icono del ojo para inspeccionarla en 3D.
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#B45309]/20 border-t-[#B45309] animate-spin" />
            <p className="text-sm text-ink-secondary font-medium">Cargando escaparate...</p>
          </div>
        ) : (
          <>
            {/* Featured Looping Carousel */}
            {featuredCards.length > 0 && (
              <section className="p-3.5 sm:p-5 rounded-2xl bg-surface border border-line border-l-4 border-l-[#B45309] space-y-3">
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
                    <p className="text-xs text-ink-secondary">Toca una carta para añadirla a la cesta</p>
                  </div>
                </div>

                <LoopingCarousel
                  items={featuredCards}
                  renderItem={(card, idx) => renderSaleCardTile(card, `feat-${idx}`)}
                  onReorder={handleReorderFeatured}
                />
              </section>
            )}

            {/* WishList Looping Carousel (Same tap-to-add & card size as Destacadas) */}
            {sortedDesiredCards.length > 0 && (
              <section className="p-3.5 sm:p-5 rounded-2xl bg-surface border border-line border-l-4 border-l-[#1D4ED8] space-y-3">
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
                    <p className="text-xs text-ink-secondary">Toca si la tienes para proponer cambio</p>
                  </div>
                </div>

                <LoopingCarousel
                  items={sortedDesiredCards}
                  renderItem={(card) => renderWishCardTile(card)}
                  onReorder={handleReorderWishlist}
                />
              </section>
            )}

            {/* Search & Inline Accordion Filters (Placed below Destacadas & WishList) */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar en el catálogo..."
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
                  onClick={() => setShowFilters(prev => !prev)}
                  className={`min-h-[44px] px-3.5 rounded-[10px] text-xs font-semibold border flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    activeFiltersCount > 0 || showFilters
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
              </div>

              {/* Inline Accordion Filters Panel */}
              {showFilters && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-surface border border-line space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <span className="text-xs font-bold text-ink-primary">
                      Filtros del catálogo ({filteredCards.length} resultados)
                    </span>
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-semibold text-[#B45309] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} /> Limpiar
                      </button>
                    )}
                  </div>

                  {/* Dominios con iconos */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">Dominios</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DOMAINS_LIST.map(d => {
                        const active = selectedDomains.includes(d.key);
                        return (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => setSelectedDomains(prev => prev.includes(d.key) ? prev.filter(x => x !== d.key) : [...prev, d.key])}
                            className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                              active ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-app border-line text-ink-primary hover:bg-subtle'
                            }`}
                          >
                            {d.isProduct ? (
                              <Package size={15} className={active ? 'text-white' : 'text-amber-600 dark:text-amber-400'} />
                            ) : d.icon ? (
                              <img src={d.icon} alt={d.key} className="w-4 h-4 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <span className={`w-2.5 h-2.5 rounded-full ${d.dotCls}`} />
                            )}
                            <span>{d.label || d.key}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rareza & Ordenación */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-line">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">Rareza</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Common', 'Uncommon', 'Rare', 'Epic', 'Promo', 'Showcase'].map(r => {
                          const active = selectedRarities.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setSelectedRarities(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                              className={`min-h-[34px] px-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                                active ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-app border-line text-ink-primary hover:bg-subtle'
                              }`}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-1">
                        <ArrowUpDown size={11} className="text-[#B45309]" /> Ordenar por
                      </label>
                      <div className="flex gap-1.5">
                        {[
                          { id: 'cost', label: 'Coste' },
                          { id: 'name', label: 'Nombre' },
                          { id: 'stock', label: 'Stock' }
                        ].map(o => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setSortBy(o.id)}
                            className={`flex-1 min-h-[34px] rounded-lg text-xs font-semibold border cursor-pointer ${
                              sortBy === o.id ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-app border-line text-ink-primary hover:bg-subtle'
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expansiones */}
                  {expansionOptions.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-line">
                      <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">Expansión</label>
                      <div className="flex flex-wrap gap-1.5">
                        {expansionOptions.map(([expName, count]) => {
                          const active = selectedExpansions.includes(expName);
                          return (
                            <button
                              key={expName}
                              type="button"
                              onClick={() => setSelectedExpansions(prev => prev.includes(expName) ? prev.filter(x => x !== expName) : [...prev, expName])}
                              className={`min-h-[34px] px-2.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 cursor-pointer ${
                                active ? 'bg-[#B45309] border-[#B45309] text-white' : 'bg-app border-line text-ink-primary hover:bg-subtle'
                              }`}
                            >
                              <span>{expName}</span>
                              <span className="text-[10px] opacity-75">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Catalog Grouped by Domain — 3 columns on mobile */}
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
              <div className="space-y-7">
                {groupedCards.map(group => (
                  <section key={group.key} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-line pb-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-ink-primary font-display flex items-center gap-2">
                        {group.isProduct ? (
                          <Package size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        ) : group.icon ? (
                          <img src={group.icon} alt={group.key} className="w-5 h-5 object-contain shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <span className={`w-3 h-3 rounded-full shrink-0 ${group.dotCls}`} />
                        )}
                        {!group.isProduct && <span className="text-ink-secondary font-bold">Dominio:</span>}
                        <span className={group.textCls}>{group.label}</span>
                        {group.key !== 'Multi' && group.key !== 'Colorless' && !group.isProduct && (
                          <span className="text-xs font-semibold text-ink-muted">({group.key})</span>
                        )}
                      </h2>
                      <span className="text-xs font-semibold text-ink-secondary bg-surface border border-line px-2.5 py-0.5 rounded-full">
                        {group.cards.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-2 sm:gap-3.5">
                      {group.cards.map(card => renderSaleCardTile(card, 'cat'))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface mt-8 pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-secondary">
          <div className="flex items-center gap-2.5">
            <img src={appLogo} alt="RiftBard" className="w-6 h-6 rounded object-contain" />
            <span>
              <strong className="text-ink-primary">RiftBard</strong> · Creado por{' '}
              <a
                href="https://github.com/XDavider"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B45309] font-semibold hover:underline"
              >
                David Bermúdez (@XDavider)
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/XDavider/RiftBard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-ink-primary transition-colors"
            >
              <Github size={14} /> GitHub
            </a>
            <a
              href={owner.linkedinUrl || 'https://www.linkedin.com/in/david-bermudez-445785403'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-ink-primary transition-colors"
            >
              <Linkedin size={14} /> LinkedIn
            </a>
            <a
              href={owner.instagramUrl || 'https://www.instagram.com/david_de_dora/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-ink-primary transition-colors"
            >
              <Instagram size={14} /> Instagram
            </a>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">Powered by React, Tailwind CSS &amp; Vercel</span>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button (Bottom-Right Corner) */}
      <button
        ref={floatingCartRef}
        type="button"
        onClick={() => setIsOrderModalOpen(true)}
        className={`fixed bottom-5 right-4 z-40 min-w-[56px] h-14 px-4 rounded-full bg-[#B45309] hover:bg-[#92400E] text-white shadow-lg flex items-center justify-center gap-2 transition-transform cursor-pointer ${
          cartPulse ? 'scale-110' : 'scale-100'
        }`}
        aria-label="Abrir cesta de pedido"
      >
        <ShoppingBag size={20} />
        <span className="text-sm font-extrabold tabular-nums">
          {totalOrderCount + offeredCards.length}
        </span>
      </button>

      {/* Order Summary Modal / Bottom-Sheet (with Card Thumbnails) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4" onClick={() => setIsOrderModalOpen(false)}>
          <div
            className="w-full sm:max-w-lg bg-surface border border-line rounded-t-2xl sm:rounded-2xl max-h-[88dvh] flex flex-col overflow-hidden"
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
              {orderItems.length === 0 && offeredCards.length === 0 ? (
                <p className="text-xs text-ink-secondary text-center py-8">
                  Toca cualquier carta del catálogo para añadirla a tu cesta.
                </p>
              ) : (
                <>
                  {orderItems.map(({ card, qty }) => (
                    <div key={card.id} className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-app border border-line">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-14 rounded-md overflow-hidden bg-subtle border border-line shrink-0">
                          {card.image_url && (
                            <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink-primary truncate">{card.name}</p>
                          <p className="text-[11px] text-ink-secondary truncate">{card.rarity} · {card.set_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateOrder(card.id, -1, card.saleTotal || 1)}
                          className="min-w-[36px] min-h-[36px] rounded-lg bg-surface border border-line flex items-center justify-center cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-xs font-bold tabular-nums w-6 text-center">{qty}x</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrder(card.id, 1, card.saleTotal || 1)}
                          disabled={qty >= (card.saleTotal || 1)}
                          className="min-w-[36px] min-h-[36px] rounded-lg bg-[#15803D] text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {offeredCards.length > 0 && (
                    <div className="pt-3 border-t border-line space-y-2">
                      <p className="text-xs font-bold text-[#1D4ED8] dark:text-blue-400">Ofreces para cambio:</p>
                      {offeredCards.map(c => (
                        <div key={c.id} className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-14 rounded-md overflow-hidden bg-subtle border border-line shrink-0">
                              {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />}
                            </div>
                            <span className="font-semibold text-ink-primary truncate">{c.name}</span>
                          </div>
                          <button type="button" onClick={() => handleToggleOfferDesired(c)} className="text-[#B91C1C] font-semibold px-2 shrink-0 cursor-pointer">
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            {(orderItems.length > 0 || offeredCards.length > 0) && (
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
            )}
          </div>
        </div>
      )}

      {/* Interactive 3D Card Inspection Modal */}
      <CardInspect3DModal card={selectedCardForModal} onClose={() => setSelectedCardForModal(null)} />
    </div>
  );
}
