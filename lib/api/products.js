import api from "@/lib/axios";

// DummyJSON can't search and filter-by-category in one request, so
// the page decides which of these two to call (see ProductsPage).

export function getProducts({ limit, skip, sortBy, order }, { signal } = {}) {
  return api
    .get("/products", {
      params: { limit, skip, sortBy, order },
      signal,
    })
    .then((res) => res.data);
}

export function searchProducts({ q, limit, skip, sortBy, order }, { signal } = {}) {
  return api
    .get("/products/search", {
      params: { q, limit, skip, sortBy, order },
      signal,
    })
    .then((res) => res.data);
}

export function getProductsByCategory(
  { category, limit, skip, sortBy, order },
  { signal } = {}
) {
  return api
    .get(`/products/category/${encodeURIComponent(category)}`, {
      params: { limit, skip, sortBy, order },
      signal,
    })
    .then((res) => res.data);
}

export function getProductById(id, { signal } = {}) {
  return api.get(`/products/${id}`, { signal }).then((res) => res.data);
}

export function addProduct(payload) {
  return api.post("/products/add", payload).then((res) => res.data);
}

export function updateProduct(id, payload) {
  return api.put(`/products/${id}`, payload).then((res) => res.data);
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`).then((res) => res.data);
}
