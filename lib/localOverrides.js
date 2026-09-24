// DummyJSON's add/edit/delete endpoints respond with a "success"
// payload but never actually change their database - a second GET
// still shows the old data. To make the app *feel* real across a
// refresh, we keep a small overlay in localStorage and merge it over
// whatever the API returns:
//   - added:   products we created, kept as full objects
//   - edited:  { [id]: partialFields } patches to apply on top
//   - deleted: [id, id, ...] ids to hide from every list
//
// See NOTES.md for why this approach was chosen over, say, an
// in-memory-only store.

const KEY = "pad_overrides";

function read() {
  if (typeof window === "undefined") return { added: [], edited: {}, deleted: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { added: [], edited: {}, deleted: [] };
    const parsed = JSON.parse(raw);
    return {
      added: parsed.added || [],
      edited: parsed.edited || {},
      deleted: parsed.deleted || [],
    };
  } catch {
    return { added: [], edited: {}, deleted: [] };
  }
}

function write(overrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(overrides));
}

export function getOverrides() {
  return read();
}

export function addLocalProduct(product) {
  const overrides = read();
  // DummyJSON's /products/add always echoes back id 195 (one past its
  // catalog). Give locally-added items real-looking unique ids so
  // several adds in a row don't collide.
  const localId = Date.now();
  const withId = { ...product, id: localId, isLocalAddition: true };
  overrides.added = [withId, ...overrides.added];
  write(overrides);
  return withId;
}

export function editLocalProduct(id, fields) {
  const overrides = read();
  const isLocalAddition = overrides.added.some((p) => p.id === id);
  if (isLocalAddition) {
    overrides.added = overrides.added.map((p) =>
      p.id === id ? { ...p, ...fields } : p
    );
  } else {
    overrides.edited = { ...overrides.edited, [id]: { ...overrides.edited[id], ...fields } };
  }
  write(overrides);
}

export function deleteLocalProduct(id) {
  const overrides = read();
  const isLocalAddition = overrides.added.some((p) => p.id === id);
  if (isLocalAddition) {
    overrides.added = overrides.added.filter((p) => p.id !== id);
  } else {
    overrides.deleted = [...new Set([...overrides.deleted, id])];
  }
  write(overrides);
}

// Applies edits + deletions to a list fetched from the API, and (only
// on the first, unfiltered page) prepends locally-added products so
// they show up somewhere.
export function applyOverrides(products, { includeAdded = false } = {}) {
  const overrides = read();
  const withEdits = products
    .filter((p) => !overrides.deleted.includes(p.id))
    .map((p) => (overrides.edited[p.id] ? { ...p, ...overrides.edited[p.id] } : p));

  if (includeAdded && overrides.added.length) {
    return [...overrides.added, ...withEdits];
  }
  return withEdits;
}

export function getLocalProductById(id) {
  const overrides = read();
  const found = overrides.added.find((p) => p.id === id);
  if (found) return found;
  if (overrides.deleted.includes(id)) return "deleted";
  if (overrides.edited[id]) return { patch: overrides.edited[id] };
  return null;
}
