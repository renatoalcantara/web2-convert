"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  beforeSrcDoc: string;
  afterSrcDoc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

export function BeforeAfterSlider({
  beforeSrcDoc,
  afterSrcDoc,
  beforeLabel = "anos 2000",
  afterLabel = "hoje",
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, next)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      updateFromClientX(x);
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[16/10] overflow-hidden rounded-lg border border-[var(--border)] bg-black select-none",
        className
      )}
    >
      <iframe
        srcDoc={afterSrcDoc}
        sandbox="allow-same-origin"
        className="absolute inset-0 w-full h-full pointer-events-none"
        title={afterLabel}
      />
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${pos}%` }}
      >
        <iframe
          srcDoc={beforeSrcDoc}
          sandbox="allow-same-origin"
          className="absolute inset-0 h-full pointer-events-none"
          style={{ width: `${(100 / pos) * 100}%`, maxWidth: "none" }}
          title={beforeLabel}
        />
      </div>

      <div className="absolute top-3 left-3 text-xs font-mono px-2 py-1 rounded bg-black/70 text-white">
        ← {beforeLabel}
      </div>
      <div className="absolute top-3 right-3 text-xs font-mono px-2 py-1 rounded bg-black/70 text-white">
        {afterLabel} →
      </div>

      <div
        className="absolute top-0 bottom-0 w-px bg-white/80 cursor-ew-resize"
        style={{ left: `${pos}%` }}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 4 L1 8 L5 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M11 4 L15 8 L11 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
