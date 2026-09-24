"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product, onDelete }) {
  return (
    <div className="flex gap-3 rounded-lg border border-line bg-white p-3 sm:hidden">
      <Link href={`/products/${product.id}`} className="shrink-0">
        <span className="relative block h-16 w-16 overflow-hidden rounded-md border border-line bg-paper">
          {product.thumbnail && (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </span>
      </Link>
      <div className="flex flex-1 flex-col">
        <Link href={`/products/${product.id}`} className="font-medium text-ink">
          {product.title}
        </Link>
        <p className="text-xs capitalize text-ink/50">{product.category}</p>
        <div className="mt-1 flex items-center gap-3 text-sm text-ink/70">
          <span>${product.price}</span>
          <span>★ {product.rating}</span>
          <span>{product.stock} in stock</span>
        </div>
        <div className="mt-2 flex gap-2">
          <Link
            href={`/products/${product.id}/edit`}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:bg-paper"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(product)}
            className="rounded-md border border-rust/30 px-2.5 py-1 text-xs font-medium text-rust hover:bg-rust/5"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
