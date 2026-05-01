import { DropZone } from "@/components/DropZone";
import { HeroBeforeAfter } from "@/components/HeroBeforeAfter";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            mande um print de um site dos anos 2000.{" "}
            <span className="text-[var(--accent)]">veja ele renascer.</span>
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            primeiro a IA reproduz fielmente, com tabelas, marquees e cores berrantes.
            depois reimagina como o mesmo site seria se fosse feito hoje.
          </p>
          <p className="text-sm text-[var(--muted)]">
            uma brincadeira sobre como a web mudou — e sobre o que sobrevive ao tempo.
          </p>
        </div>
        <HeroBeforeAfter />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted)]">
          1. seu print
        </h2>
        <DropZone />
      </section>

      <section className="grid md:grid-cols-3 gap-6 text-sm">
        <Step n="1" title="upload">
          Você manda um print de um site dos anos 2000 (até 8MB).
        </Step>
        <Step n="2" title="retrô fiel">
          O modelo analisa o print e gera HTML 4.01 com tabelas, fontes Times New Roman,
          marquees e tudo que define a era.
        </Step>
        <Step n="3" title="releitura 2026">
          Em seguida, reimagina o mesmo site como se fosse desenhado e construído hoje:
          semântico, responsivo, com tipografia e espaçamento contemporâneos.
        </Step>
      </section>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-5 space-y-2">
      <div className="text-xs font-mono text-[var(--accent)]">passo {n}</div>
      <div className="font-semibold">{title}</div>
      <p className="text-[var(--muted)]">{children}</p>
    </div>
  );
}
