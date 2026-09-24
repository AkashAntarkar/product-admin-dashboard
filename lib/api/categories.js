import api from "@/lib/axios";

// DummyJSON's /products/categories returns objects like
// { slug, name, url }. We normalize older/newer shapes here so the
// rest of the app can just use { slug, name }.
export function getCategories() {
  return api.get("/products/categories").then((res) =>
    (res.data || []).map((c) =>
      typeof c === "string" ? { slug: c, name: c } : { slug: c.slug, name: c.name }
    )
  );
}
