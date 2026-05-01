import Link from "next/link";

type Item = {
  id: string;
  imageUrl: string;
  title: string | null;
  status: string;
  createdAt: Date | string;
};

export function GalleryGrid({ items, emptyMessage }: { items: Item[]; emptyMessage: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
        {emptyMessage}
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={`/c/${c.id}`}
            className="block rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--accent)] transition-colors"
          >
            <div className="aspect-[4/3] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.imageUrl} alt={c.title ?? "conversão"} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 text-xs">
              <div className="font-mono truncate">{c.title ?? `#${c.id.slice(0, 8)}`}</div>
              <div className="text-[var(--muted)] mt-1">{c.status}</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
