import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 text-center space-y-4">
      <div className="text-6xl font-mono text-[var(--accent)]">404</div>
      <p className="text-[var(--muted)]">Esta página não existe (ou nunca existiu).</p>
      <Link href="/" className="inline-block underline">
        voltar pra home
      </Link>
    </div>
  );
}
