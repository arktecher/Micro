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
function readLocalIds(): string[] {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "[]") as string[];
    }
    catch {
        return [];
    }
}
function writeLocalIds(ids: string[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("favoritesUpdated"));
}
export async function fetchFavoriteIds(): Promise<string[]> {
    try {
        const res = await api.request<{
            ids: string[];
            count: number;
        }>("/corporate/favorites/ids");
        writeLocalIds(res.ids);
        return res.ids;
    }
    catch (e) {
        console.warn("corporateFavorites: fetchFavoriteIds failed, using localStorage", e);
        return readLocalIds();
    }
}
export async function fetchFavorites(): Promise<FavoriteArtwork[]> {
    const res = await api.request<{
        items: FavoriteArtwork[];
        count: number;
    }>("/corporate/favorites");
    writeLocalIds(res.items.map((a) => a.id));
    return res.items;
}
export async function addFavorite(artworkId: string): Promise<string[]> {
    await api.request<unknown>(`/corporate/favorites/${artworkId}`, {
        method: "POST",
    });
    const ids = [...new Set([...readLocalIds(), artworkId])];
    writeLocalIds(ids);
    return ids;
}
export async function removeFavorite(artworkId: string): Promise<string[]> {
    await api.request<unknown>(`/corporate/favorites/${artworkId}`, {
        method: "DELETE",
    });
    const ids = readLocalIds().filter((id) => id !== artworkId);
    writeLocalIds(ids);
    return ids;
}
export async function toggleFavorite(artworkId: string, currentlyFavorited: boolean): Promise<{
    isFavorited: boolean;
    ids: string[];
}> {
    if (currentlyFavorited) {
        const ids = await removeFavorite(artworkId);
        return { isFavorited: false, ids };
    }
    else {
        const ids = await addFavorite(artworkId);
        return { isFavorited: true, ids };
    }
}
export function isFavorited(artworkId: string): boolean {
    return readLocalIds().includes(artworkId);
}
