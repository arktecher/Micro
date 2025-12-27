import type { Artwork, ArtworkFilters } from "@/types/artwork";
import { PRICE_RANGES } from "@/data/artworks";

// Technique mapping for filtering
const TECHNIQUE_MAP: Record<string, string> = {
  acrylic: "アクリル",
  oil: "油彩",
  spray: "スプレー",
  collage: "コラージュ",
  ink: "インク",
};

/**
 * Filter artworks based on search query and selected filters
 */
export function filterArtworks(
  artworks: Artwork[],
  filters: ArtworkFilters
): Artwork[] {
  return artworks.filter((artwork) => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        artwork.title.toLowerCase().includes(query) ||
        artwork.artist.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Color filter
    if (
      filters.selectedColors.length > 0 &&
      !filters.selectedColors.includes(artwork.dominantColor)
    ) {
      return false;
    }

    // Size filter
    if (
      filters.selectedSizes.length > 0 &&
      !filters.selectedSizes.includes(artwork.size)
    ) {
      return false;
    }

    // Price range filter
    if (filters.selectedPriceRanges.length > 0) {
      const matchesPrice = filters.selectedPriceRanges.some((rangeId) => {
        const range = PRICE_RANGES.find((r) => r.id === rangeId);
        if (!range) return false;
        return artwork.price >= range.min && artwork.price < range.max;
      });
      if (!matchesPrice) return false;
    }

    // Technique filter
    if (filters.selectedTechniques.length > 0) {
      const matchesTechnique = filters.selectedTechniques.some((techId) => {
        return artwork.technique === TECHNIQUE_MAP[techId];
      });
      if (!matchesTechnique) return false;
    }

    return true;
  });
}

/**
 * Sort artworks based on the selected sort option
 */
export function sortArtworks(
  artworks: Artwork[],
  sortBy: string
): Artwork[] {
  const sorted = [...artworks];

  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "popular":
      return sorted.sort((a, b) => b.popularity - a.popularity);

    case "price_low":
      return sorted.sort((a, b) => a.price - b.price);

    case "price_high":
      return sorted.sort((a, b) => b.price - a.price);

    case "recommended":
    default:
      // Default recommended sort (by popularity)
      return sorted.sort((a, b) => b.popularity - a.popularity);
  }
}

