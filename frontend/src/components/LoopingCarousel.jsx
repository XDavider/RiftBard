import React, { useRef, useState, useEffect } from 'react';

/**
 * LoopingCarousel
 * Smooth, infinite auto-scrolling carousel with:
 * - Mouse drag-to-scroll & touch swipe
 * - Optional drag-and-drop reordering when onReorder is provided
 * - Pause on hover/interaction
 */
export default function LoopingCarousel({ items = [], renderItem, onReorder = null, className = '' }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [shouldLoop, setShouldLoop] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dropTargetId, setDropTargetId] = useState(null);
  const draggedIdRef = useRef(null);
  const resumeTimerRef = useRef(null);

  // Mouse / Pointer drag scrolling state
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !trackRef.current) return;
      const singleWidth = shouldLoop ? trackRef.current.scrollWidth / 2 : trackRef.current.scrollWidth;
      setShouldLoop(items.length >= 2 && singleWidth > containerRef.current.clientWidth + 4);
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
    if (Math.abs(dx) > 6) {
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
    // Clear hasDragged after a brief delay so immediate drag-release clicks are suppressed,
    // but subsequent clicks are never blocked
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setPaused(false);
    }, 1800);
  };

  // Drag & drop handlers for reordering cards
  const handleDragStart = (e, item) => {
    if (!onReorder) return;
    draggedIdRef.current = item.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    setPaused(true);
  };

  const handleDragOver = (e, item) => {
    if (!onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetId !== item.id) {
      setDropTargetId(item.id);
    }
  };

  const handleDragLeave = (e, item) => {
    if (!onReorder) return;
    if (dropTargetId === item.id) {
      setDropTargetId(null);
    }
  };

  const handleDrop = (e, targetItem) => {
    if (!onReorder) return;
    e.preventDefault();
    setDropTargetId(null);
    const sourceId = draggedIdRef.current || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetItem.id) {
      draggedIdRef.current = null;
      setPaused(false);
      return;
    }

    const currentIndex = items.findIndex(it => it.id === sourceId);
    const targetIndex = items.findIndex(it => it.id === targetItem.id);
    if (currentIndex !== -1 && targetIndex !== -1) {
      const updated = [...items];
      const [moved] = updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, moved);
      onReorder(updated);
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
      className={`overflow-x-auto no-scrollbar pb-1 cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      <div ref={trackRef} className="flex gap-2 sm:gap-3.5 w-max">
        {listToRender.map((item, idx) => {
          const isTarget = Boolean(onReorder) && dropTargetId === item.id;
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
                // If a button was clicked inside the tile (like Eye or Minus), always let it through!
                if (e.target.closest('button')) {
                  return;
                }
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
