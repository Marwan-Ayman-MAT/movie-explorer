const STORAGE_KEY = "reelgood:favorite-movies";

export function readFavorites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(favorites) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}
