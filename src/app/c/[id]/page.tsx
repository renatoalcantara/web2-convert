import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { ConversionFlow } from "@/components/ConversionFlow";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [conv] = await db.select().from(conversions).where(eq(conversions.id, id)).limit(1);
  if (!conv) return { title: "conversão não encontrada" };
  const title = conv.title ?? "uma conversão web2";
  return {
    title: `${title} · web2-convert`,
    description: "Print → site retrô fiel → releitura moderna.",
    openGraph: {
      title,
      description: "Print → site retrô fiel → releitura moderna.",
      images: [conv.imageUrl],
    },
  };
}

export default async function ConversionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [conv] = await db.select().from(conversions).where(eq(conversions.id, id)).limit(1);
  if (!conv) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 space-y-1">
        <div className="text-xs font-mono text-[var(--muted)]">conversão #{conv.id.slice(0, 8)}</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {conv.title ?? "do print à releitura"}
        </h1>
      </div>
      <ConversionFlow
        id={conv.id}
        imageUrl={conv.imageUrl}
        initialRetro={conv.retroHtml}
        initialModern={conv.modernHtml}
      />
    </div>
  );
}
