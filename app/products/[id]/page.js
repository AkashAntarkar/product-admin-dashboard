"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import ConfirmModal from "@/components/ConfirmModal";
import { getProductById, deleteProduct } from "@/lib/api/products";
import { applyOverrides, deleteLocalProduct, getLocalProductById } from "@/lib/localOverrides";

export default function ProductDetailsPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <ProductDetailsInner />
    </ProtectedRoute>
  );
}

function ProductDetailsInner() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | notfound | error
  const [errorMessage, setErrorMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function load() {
    setStatus("loading");
    const numericId = Number(id);

    // Locally-added products (add form, unsaved on DummyJSON's end)
    // don't exist on the real API, so we check the overlay first.
    const local = getLocalProductById(numericId);
    if (local && local !== "deleted" && !local.patch) {
      setProduct(local);
      setStatus("success");
      return;
    }
    if (local === "deleted") {
      setStatus("notfound");
      return;
    }

    getProductById(numericId)
      .then((data) => {
        const [merged] = applyOverrides([data]);
        if (!merged) {
          setStatus("notfound");
          return;
        }
        setProduct(merged);
        setStatus("success");
      })
      .catch((err) => {
        if (err.status === 404) {
          setStatus("notfound");
        } else {
          setErrorMessage(err.message || "Failed to load this product.");
          setStatus("error");
        }
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
    } catch {
      // see note in ProductsPageInner: DummyJSON's delete isn't
      // guaranteed for every id, so we apply the local change anyway.
    }
    deleteLocalProduct(product.id);
    setIsDeleting(false);
    router.push("/products");
  }

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Loader label="Loading product..." />
      </main>
    );
  }

  if (status === "notfound") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <EmptyState
          title="Product not found"
          message="This product doesn't exist, or may have been deleted."
          action={
            <Link
              href="/products"
              className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Back to products
            </Link>
          }
        />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ErrorState message={errorMessage} onRetry={load} />
      </main>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/products" className="text-sm text-ink/60 hover:text-ink">
        ← Back to products
      </Link>

      <div className="mt-4 grid gap-8 sm:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
            {images[activeImage] && (
              <Image
                src={images[activeImage]}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain p-4"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                    i === activeImage ? "border-brand-600" : "border-line"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {product.category}
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink">{product.title}</h1>
          <p className="mt-1 text-sm text-ink/60">★ {product.rating} · {product.stock} in stock</p>
          <p className="mt-4 text-3xl font-medium text-ink">${product.price}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.description}</p>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/products/${product.id}/edit`}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
            >
              Edit
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded-md border border-rust/30 px-4 py-2 text-sm font-medium text-rust hover:bg-rust/5"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-ink">Reviews</h2>
        {product.reviews?.length ? (
          <div className="mt-4 space-y-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{r.reviewerName}</p>
                  <p className="text-sm text-ink/50">★ {r.rating}</p>
                </div>
                <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink/50">No reviews yet.</p>
        )}
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="Delete this product?"
        message={`"${product.title}" will be removed from your view of the catalog.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
}
