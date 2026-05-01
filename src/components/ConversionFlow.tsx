"use client";

import { useCallback, useState } from "react";
import { StreamingFrame } from "@/components/StreamingFrame";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

type Props = {
  id: string;
  imageUrl: string;
  initialRetro: string | null;
  initialModern: string | null;
};

export function ConversionFlow({ id, imageUrl, initialRetro, initialModern }: Props) {
  const [retro, setRetro] = useState<string | null>(initialRetro);
  const [modern, setModern] = useState<string | null>(initialModern);
  const [retroStarted, setRetroStarted] = useState(true);
  const [modernStarted, setModernStarted] = useState(initialModern != null);

  const onRetroDone = useCallback((html: string) => {
    setRetro(html);
  }, []);

  const onModernDone = useCallback((html: string) => {
    setModern(html);
  }, []);

  return (
    <div className="space-y-10">
      <section className="grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">
            print original
          </h2>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-black">
            <img src={imageUrl} alt="print original" className="w-full block" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">
            1. reprodução fiel · anos 2000
          </h2>
          {retroStarted && (
            <StreamingFrame
              url={initialRetro ? null : `/api/convert/${id}/retro`}
              label="retro.html"
              onComplete={onRetroDone}
            />
          )}
          {!retroStarted && (
            <button
              onClick={() => setRetroStarted(true)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 hover:border-[var(--fg)]"
            >
              Iniciar reprodução
            </button>
          )}
          {initialRetro && (
            <PreviewFrame html={initialRetro} label="retro.html" />
          )}
        </div>
      </section>

      {retro && !modernStarted && (
        <section className="text-center py-8">
          <button
            onClick={() => setModernStarted(true)}
            className="px-8 py-4 rounded-full bg-[var(--accent)] text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Modernizar isto →
          </button>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Como esse mesmo site seria se fosse feito hoje?
          </p>
        </section>
      )}

      {modernStarted && (
        <section className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">
            2. releitura · 2026
          </h2>
          {initialModern ? (
            <PreviewFrame html={initialModern} label="modern.html" />
          ) : (
            <StreamingFrame
              url={`/api/convert/${id}/modern`}
              label="modern.html"
              onComplete={onModernDone}
            />
          )}
        </section>
      )}

      {retro && modern && (
        <section className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--muted)]">
            3. antes & depois
          </h2>
          <BeforeAfterSlider beforeSrcDoc={retro} afterSrcDoc={modern} />
          <div className="flex gap-3 text-sm">
            <DownloadButton html={retro} filename="retro.html" label="baixar retrô" />
            <DownloadButton html={modern} filename="modern.html" label="baixar moderna" />
          </div>
        </section>
      )}
    </div>
  );
}

function PreviewFrame({ html, label }: { html: string; label: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-black">
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[#111] text-xs font-mono">
        {label}
      </div>
      <iframe
        srcDoc={html}
        sandbox="allow-same-origin"
        className="w-full aspect-[16/10] bg-white"
        title={label}
      />
    </div>
  );
}

function DownloadButton({ html, filename, label }: { html: string; filename: string; label: string }) {
  return (
    <button
      onClick={() => {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
      className="rounded-lg border border-[var(--border)] px-4 py-2 hover:border-[var(--fg)]"
    >
      {label}
    </button>
  );
}
