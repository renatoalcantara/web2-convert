"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export function DropZone() {
  const router = useRouter();
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("/api/convert", { method: "POST", body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? "upload failed");
        }
        const { id } = await res.json();
        router.push(`/c/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "erro inesperado");
        setBusy(false);
      }
    },
    [router]
  );

  return (
    <div className="w-full">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) void upload(f);
        }}
        className={cn(
          "block w-full rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors",
          drag ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] hover:border-[var(--muted)]",
          busy && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <div className="space-y-2">
          <div className="text-2xl font-mono">
            {busy ? "enviando..." : "arraste um print aqui"}
          </div>
          <div className="text-sm text-[var(--muted)]">
            ou clique pra escolher · png, jpg, webp, gif · até 8MB
          </div>
        </div>
      </label>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
