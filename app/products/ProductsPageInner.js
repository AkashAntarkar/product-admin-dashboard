"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  deleteProduct,
} from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { applyOverrides, deleteLocalProduct } from "@/lib/localOverrides";
import useDebounce from "@/hooks/useDebounce";
import SearchBar from "@/components/SearchBar";
import FilterSortBar from "@/components/FilterSortBar";
import Pagination from "@/components/Pagination";
import ProductTable from "@/components/ProductTable";
import ProductCard from "@/components/ProductCard";
import ConfirmModal from "@/components/ConfirmModal";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

const VALID_PAGE_SIZES = [10, 20, 50];

function parseIntSafe(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function ProductsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ---- Read (and sanitize) state from the URL ----------------------
  const urlPage = parseIntSafe(searchParams.get("page"), 1);
  const urlPageSize = VALID_PAGE_SIZES.includes(Number(searchParams.get("pageSize")))
    ? Number(searchParams.get("pageSize"))
    : 10;
  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlSort = searchParams.get("sort") || ""; // "field-direction"

  const [searchInput, setSearchInput] = useState(urlQuery);
  const debouncedSearch = useDebounce(searchInput, 450);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [productPendingDelete, setProductPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestIdRef = useRef(0);
  const controllerRef = useRef(null);

  const [sortBy, order] = urlSort ? urlSort.split("-") : [undefined, undefined];

  function updateParams(patch) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  // Load categories once.
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Keep the search box in sync if the URL changes from elsewhere
  // (back/forward navigation).
  useEffect(() => {
    setSearchInput(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // Once the debounced value settles, push it into the URL and reset
  // to page 1. This is also what actually triggers the API call,
  // since the fetch effect below depends on urlQuery via searchParams.
  useEffect(() => {
    if (debouncedSearch === urlQuery) return;
    updateParams({ q: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    setStatus("loading");
    setErrorMessage("");

    const skip = (urlPage - 1) * urlPageSize;
    const params = { limit: urlPageSize, skip, sortBy, order };

    try {
      let data;
      // DummyJSON can't search and filter-by-category at once, so a
      // search term always wins over a chosen category (the category
      // control is disabled in the UI whenever there's a search term).
      if (urlQuery) {
        data = await searchProducts({ ...params, q: urlQuery }, { signal: controller.signal });
      } else if (urlCategory) {
        data = await getProductsByCategory(
          { ...params, category: urlCategory },
          { signal: controller.signal }
        );
      } else {
        data = await getProducts(params, { signal: controller.signal });
      }

      if (requestId !== requestIdRef.current) return; // superseded by a newer request

      const includeAdded = skip === 0 && !urlQuery && !urlCategory;
      setProducts(applyOverrides(data.products, { includeAdded }));
      setTotal(data.total);
      setStatus("success");

      // ?page=999 (or any page past the end): snap back to the real
      // last page instead of showing a broken, empty screen forever.
      const totalPages = Math.max(1, Math.ceil(data.total / urlPageSize));
      if (urlPage > totalPages) {
        updateParams({ page: totalPages });
      }
    } catch (err) {
      if (err.isCancelled || requestId !== requestIdRef.current) return;
      setStatus("error");
      setErrorMessage(err.message || "Failed to load products.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPage, urlPageSize, urlQuery, urlCategory, sortBy, order]);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  function handleSearchChange(value) {
    setSearchInput(value);
  }

  function handleCategoryChange(value) {
    updateParams({ category: value, page: 1 });
  }

  function handleSortChange(value) {
    updateParams({ sort: value, page: 1 });
  }

  function handlePageChange(nextPage) {
    updateParams({ page: nextPage });
  }

  function handlePageSizeChange(nextSize) {
    updateParams({ pageSize: nextSize, page: 1 });
  }

  async function confirmDelete() {
    if (!productPendingDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productPendingDelete.id);
    } catch {
      // DummyJSON's delete can occasionally 404 for ids outside its
      // seed data; we still record the deletion locally either way,
      // since the goal is for the UI to reflect the user's action.
    }
    deleteLocalProduct(productPendingDelete.id);
    setProductPendingDelete(null);
    setIsDeleting(false);
    load();
  }

  const categoryDisabled = Boolean(urlQuery);
  const searchDisabled = false; // search always allowed; it overrides category

  const content = useMemo(() => {
    if (status === "loading") return <Loader label="Loading products..." />;
    if (status === "error") {
      return <ErrorState message={errorMessage} onRetry={load} />;
    }
    if (products.length === 0) {
      return (
        <EmptyState
          title="No products found"
          message="Try a different search term, category, or clear your filters."
        />
      );
    }
    return (
      <>
        <ProductTable products={products} onDelete={setProductPendingDelete} />
        <div className="flex flex-col gap-3 sm:hidden">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onDelete={setProductPendingDelete} />
          ))}
        </div>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, products, errorMessage]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl text-ink">Products</h1>
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add product
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchInput}
          onChange={handleSearchChange}
          disabled={searchDisabled}
        />
        <FilterSortBar
          categories={categories}
          category={urlCategory}
          onCategoryChange={handleCategoryChange}
          sort={urlSort}
          onSortChange={handleSortChange}
          categoryDisabled={categoryDisabled}
          categoryDisabledHint="Clear your search to filter by category"
        />
      </div>

      <div className="rounded-lg border border-line bg-white p-4 sm:p-5">
        {content}
        {status === "success" && products.length > 0 && (
          <div className="mt-4">
            <Pagination
              page={urlPage}
              pageSize={urlPageSize}
              total={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(productPendingDelete)}
        title="Delete this product?"
        message={
          productPendingDelete
            ? `"${productPendingDelete.title}" will be removed from your view of the catalog.`
            : ""
        }
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setProductPendingDelete(null)}
      />
    </main>
  );
}
