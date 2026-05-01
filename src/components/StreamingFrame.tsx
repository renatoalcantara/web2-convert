"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  url: string | null;
  label: string;
  onComplete?: (html: string) => void;
};

export function StreamingFrame({ url, label, onComplete }: Props) {
  const [html, setHtml] = useState("");
  const [phase, setPhase] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [view, setView] = useState<"preview" | "code">("preview");
  const completedRef = useRef(false);

  useEffect(() => {
    if (!url) return;
    completedRef.current = false;
    setHtml("");
    setErrorMsg(null);
    setPhase("streaming");

    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.body) throw new Error("no body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const ev of events) {
            const line = ev.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "delta") {
              acc += payload.text;
              setHtml(acc);
            } else if (payload.type === "complete") {
              setHtml(payload.html);
              setPhase("done");
              completedRef.current = true;
              onComplete?.(payload.html);
            } else if (payload.type === "error") {
              setErrorMsg(payload.message);
              setPhase("error");
            }
          }
        }
        if (!completedRef.current && phase !== "error") {
          setPhase("done");
          onComplete?.(acc);
        }
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setErrorMsg(e instanceof Error ? e.message : "erro");
        setPhase("error");
      }
    })();

    return () => ctrl.abort();
  }, [url, onComplete, phase]);

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-black">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[#111]">
        <div className="flex items-center gap-3 text-xs font-mono">
          <StatusDot phase={phase} />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setView("preview")}
            className={
              view === "preview"
                ? "px-2 py-1 rounded bg-[var(--fg)] text-black"
                : "px-2 py-1 rounded text-[var(--muted)]"
            }
          >
            preview
          </button>
          <button
            onClick={() => setView("code")}
            className={
              view === "code"
                ? "px-2 py-1 rounded bg-[var(--fg)] text-black"
                : "px-2 py-1 rounded text-[var(--muted)]"
            }
          >
            código
          </button>
        </div>
      </div>
      <div className="aspect-[16/10] relative">
        {view === "preview" ? (
          <iframe
            srcDoc={html || "<html><body style='background:#000;color:#666;font-family:monospace;padding:20px'>aguardando...</body></html>"}
            sandbox="allow-same-origin"
            className="w-full h-full bg-white"
            title={label}
          />
        ) : (
          <pre className="w-full h-full overflow-auto p-4 text-xs font-mono text-[var(--fg)] whitespace-pre-wrap break-all">
            {html}
          </pre>
        )}
        {phase === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-black/80 text-red-400 text-sm p-4 text-center">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusDot({ phase }: { phase: "idle" | "streaming" | "done" | "error" }) {
  const map = {
    idle: "bg-[var(--muted)]",
    streaming: "bg-[var(--accent)] animate-pulse",
    done: "bg-emerald-400",
    error: "bg-red-400",
  } as const;
  return <span className={`inline-block w-2 h-2 rounded-full ${map[phase]}`} />;
}
