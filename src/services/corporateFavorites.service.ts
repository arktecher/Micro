/**
 * Corporate Favorites Service
 * Wraps the /corporate/favorites API and keeps localStorage in sync
 * so the Header badge (which reads localStorage) stays reactive.
 */
import { api } from "@/lib/api";

export interface FavoriteArtwork {
  id: string;
  title?: string | null;
  artist_name?: string | null;
  main_image_url?: string | null;
  price?: number | null;
  size?: string | null;
  status?: string | null;
  favorited_at?: string | null;
}

const LS_KEY = "mgj_corporate_favorites";

// --------------------------------------------------------------------------
// localStorage helpers (keep badge in sync)
// --------------------------------------------------------------------------

function readLocalIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocalIds(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("favoritesUpdated"));
}

// --------------------------------------------------------------------------
// API calls
// --------------------------------------------------------------------------

/** Fetch all favorited artwork IDs from the server and sync to localStorage. */
export async function fetchFavoriteIds(): Promise<string[]> {
  try {
    const res = await api.request<{ ids: string[]; count: number }>(
      "/corporate/favorites/ids"
    );
    writeLocalIds(res.ids);
    return res.ids;
  } catch (e) {
    console.warn("corporateFavorites: fetchFavoriteIds failed, using localStorage", e);
    return readLocalIds();
  }
}

/** Fetch favorited artworks with full detail. */
export async function fetchFavorites(): Promise<FavoriteArtwork[]> {
  const res = await api.request<{ items: FavoriteArtwork[]; count: number }>(
    "/corporate/favorites"
  );
  // sync IDs to localStorage
  writeLocalIds(res.items.map((a) => a.id));
  return res.items;
}

/** Add an artwork to favorites. Returns the updated ID list. */
export async function addFavorite(artworkId: string): Promise<string[]> {
  await api.request<unknown>(`/corporate/favorites/${artworkId}`, {
    method: "POST",
  });
  const ids = [...new Set([...readLocalIds(), artworkId])];
  writeLocalIds(ids);
  return ids;
}

/** Remove an artwork from favorites. Returns the updated ID list. */
export async function removeFavorite(artworkId: string): Promise<string[]> {
  await api.request<unknown>(`/corporate/favorites/${artworkId}`, {
    method: "DELETE",
  });
  const ids = readLocalIds().filter((id) => id !== artworkId);
  writeLocalIds(ids);
  return ids;
}

/** Toggle favorite status. Returns { isFavorited, ids }. */
export async function toggleFavorite(
  artworkId: string,
  currentlyFavorited: boolean
): Promise<{ isFavorited: boolean; ids: string[] }> {
  if (currentlyFavorited) {
    const ids = await removeFavorite(artworkId);
    return { isFavorited: false, ids };
  } else {
    const ids = await addFavorite(artworkId);
    return { isFavorited: true, ids };
  }
}

/** Check whether an artwork is currently in favorites (localStorage, no API call). */
export function isFavorited(artworkId: string): boolean {
  return readLocalIds().includes(artworkId);
}
