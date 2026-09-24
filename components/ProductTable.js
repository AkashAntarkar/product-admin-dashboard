"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductTable({ products, onDelete }) {
  return (
    <table className="hidden w-full text-left text-sm sm:table">
      <thead>
        <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/50">
          <th className="py-3 pr-4 font-medium">Product</th>
          <th className="py-3 pr-4 font-medium">Category</th>
          <th className="py-3 pr-4 font-medium">Price</th>
          <th className="py-3 pr-4 font-medium">Rating</th>
          <th className="py-3 pr-4 font-medium">Stock</th>
          <th className="py-3 pr-0 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="border-b border-line/70 last:border-0">
            <td className="py-3 pr-4">
              <Link href={`/products/${p.id}`} className="flex items-center gap-3 group">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                  {p.thumbnail && (
                    <Image
                      src={p.thumbnail}
                      alt={p.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="font-medium text-ink group-hover:underline">{p.title}</span>
              </Link>
            </td>
            <td className="py-3 pr-4 text-ink/70 capitalize">{p.category}</td>
            <td className="py-3 pr-4 text-ink/70">${p.price}</td>
            <td className="py-3 pr-4 text-ink/70">★ {p.rating}</td>
            <td className="py-3 pr-4 text-ink/70">{p.stock}</td>
            <td className="py-3 pr-0">
              <div className="flex justify-end gap-2">
                <Link
                  href={`/products/${p.id}/edit`}
                  className="rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:bg-paper"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(p)}
                  className="rounded-md border border-rust/30 px-2.5 py-1 text-xs font-medium text-rust hover:bg-rust/5"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
