"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { getProductById, updateProduct } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { applyOverrides, editLocalProduct, getLocalProductById } from "@/lib/localOverrides";

export default function EditProductPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <EditProductInner />
    </ProtectedRoute>
  );
}

function EditProductInner() {
  const { id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  function load() {
    setStatus("loading");
    const numericId = Number(id);

    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));

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
        setProduct(merged);
        setStatus("success");
      })
      .catch((err) => {
        if (err.status === 404) setStatus("notfound");
        else {
          setErrorMessage(err.message || "Failed to load this product.");
          setStatus("error");
        }
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(values) {
    await updateProduct(product.id, values);
    editLocalProduct(product.id, values);
    router.push(`/products/${product.id}`);
  }

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Loader label="Loading product..." />
      </main>
    );
  }

  if (status === "notfound") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
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
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ErrorState message={errorMessage} onRetry={load} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-ink">Edit product</h1>
      <div className="mt-6 rounded-lg border border-line bg-white p-6">
        <ProductForm
          categories={categories}
          initialValues={{
            title: product.title || "",
            description: product.description || "",
            category: product.category || "",
            price: String(product.price ?? ""),
            stock: String(product.stock ?? ""),
            thumbnail: product.thumbnail || "",
          }}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </div>
    </main>
  );
}
