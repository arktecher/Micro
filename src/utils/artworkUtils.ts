import type { Artwork, ArtworkFilters } from "@/types/artwork";
import { PRICE_RANGES } from "@/data/artworks";
export const TECHNIQUE_MAP: Record<string, string> = {
    acrylic: "アクリル",
    oil: "油彩",
    spray: "スプレー",
    collage: "コラージュ",
    ink: "インク",
};
export function filterArtworks(artworks: Artwork[], filters: ArtworkFilters): Artwork[] {
    return artworks.filter((artwork) => {
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesSearch = artwork.title.toLowerCase().includes(query) ||
                artwork.artist.toLowerCase().includes(query);
            if (!matchesSearch)
                return false;
        }
        if (filters.selectedColors.length > 0 &&
            !filters.selectedColors.includes(artwork.dominantColor)) {
            return false;
        }
        if (filters.selectedSizes.length > 0 &&
            !filters.selectedSizes.includes(artwork.size)) {
            return false;
        }
        if (filters.selectedPriceRanges.length > 0) {
            const matchesPrice = filters.selectedPriceRanges.some((rangeId) => {
                const range = PRICE_RANGES.find((r) => r.id === rangeId);
                if (!range)
                    return false;
                return artwork.price >= range.min && artwork.price < range.max;
            });
            if (!matchesPrice)
                return false;
        }
        if (filters.selectedTechniques.length > 0) {
            const matchesTechnique = filters.selectedTechniques.some((techId) => {
                return artwork.technique === TECHNIQUE_MAP[techId];
            });
            if (!matchesTechnique)
                return false;
        }
        return true;
    });
}
export function sortArtworks(artworks: Artwork[], sortBy: string): Artwork[] {
    const sorted = [...artworks];
    switch (sortBy) {
        case "newest":
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case "popular":
            return sorted.sort((a, b) => b.popularity - a.popularity);
        case "price_low":
            return sorted.sort((a, b) => a.price - b.price);
        case "price_high":
            return sorted.sort((a, b) => b.price - a.price);
        case "recommended":
        default:
            return sorted.sort((a, b) => b.popularity - a.popularity);
    }
}
