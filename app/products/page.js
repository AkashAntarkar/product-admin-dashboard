import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import ProductsPageInner from "./ProductsPageInner";

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <Loader label="Loading products..." />
          </div>
        }
      >
        <ProductsPageInner />
      </Suspense>
    </ProtectedRoute>
  );
}
