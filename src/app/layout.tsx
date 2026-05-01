import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "web2-convert — print → site dos anos 2000 → site de hoje",
  description:
    "Mande um print de um site dos anos 2000 e veja ele renascer: primeiro reproduzido fielmente, depois reimaginado como seria hoje.",
  openGraph: {
    title: "web2-convert",
    description: "Print → site retrô fiel → releitura moderna. Feito com Gemini 2.5 Flash.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-mono text-sm tracking-tight">
              <span className="text-[var(--accent)]">web2</span>-convert
            </Link>
            <nav className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <Link href="/galeria" className="hover:text-[var(--fg)] transition-colors">
                galeria
              </Link>
              <Link href="/minhas" className="hover:text-[var(--fg)] transition-colors">
                minhas
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] mt-16">
          <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-[var(--muted)] flex justify-between">
            <span>built with gemini 2.5 flash + next.js</span>
            <span>brincadeira de portfólio</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
