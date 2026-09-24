"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import { addProduct } from "@/lib/api/products";
import { addLocalProduct } from "@/lib/localOverrides";
import { getCategories } from "@/lib/api/categories";

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <NewProductInner />
    </ProtectedRoute>
  );
}

function NewProductInner() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleSubmit(values) {
    // DummyJSON's /products/add responds with success but doesn't
    // persist anything server-side, so we save the real response
    // shape locally to make the addition visible after a refresh.
    await addProduct(values);
    addLocalProduct({
      ...values,
      rating: 0,
      images: values.thumbnail ? [values.thumbnail] : [],
      reviews: [],
    });
    router.push("/products");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-ink">Add product</h1>
      <p className="mt-1 text-sm text-ink/60">
        The API won't really save this, so it's kept in your browser too — see the note on the
        products page.
      </p>
      <div className="mt-6 rounded-lg border border-line bg-white p-6">
        <ProductForm categories={categories} onSubmit={handleSubmit} submitLabel="Add product" />
      </div>
    </main>
  );
}
