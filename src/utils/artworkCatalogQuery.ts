import { artworkService } from "@/services/artwork.service";
import { TECHNIQUE_MAP } from "@/utils/artworkUtils";
const PAGE_SIZE = 18;
export type CatalogSortId = "recommended" | "newest" | "popular" | "price_low" | "price_high";
type ListParams = Parameters<typeof artworkService.listArtworks>[0];
export function buildCatalogListParams(options: {
    page: number;
    debouncedSearch: string;
    debouncedArtistName: string;
    selectedSort: CatalogSortId;
    selectedColors: string[];
    selectedSizes: string[];
    selectedPriceRanges: string[];
    selectedTechniques: string[];
    selectedStyles: string[];
}): ListParams {
    const { page, debouncedSearch, debouncedArtistName, selectedSort, selectedColors, selectedSizes, selectedPriceRanges, selectedTechniques, selectedStyles, } = options;
    const params: NonNullable<ListParams> = {
        page,
        page_size: PAGE_SIZE,
        status: "published",
    };
    const q = debouncedSearch.trim();
    if (q)
        params.search = q;
    const an = debouncedArtistName.trim();
    if (an)
        params.artist_name = an;
    if (selectedColors.length > 0) {
        params.dominant_color = selectedColors;
    }
    if (selectedSizes.length > 0) {
        params.size_class = selectedSizes;
    }
    if (selectedPriceRanges.length > 0) {
        params.price_range = selectedPriceRanges;
    }
    if (selectedTechniques.length > 0) {
        const mediums = selectedTechniques
            .map((id) => TECHNIQUE_MAP[id])
            .filter((m): m is string => Boolean(m));
        if (mediums.length > 0) {
            params.medium = mediums;
        }
    }
    if (selectedStyles.length > 0) {
        params.style_tags = selectedStyles;
    }
    switch (selectedSort) {
        case "newest":
            params.sort_by = "published_at";
            params.sort_order = "desc";
            break;
        case "popular":
            params.sort_by = "view_count";
            params.sort_order = "desc";
            break;
        case "price_low":
            params.sort_by = "price";
            params.sort_order = "asc";
            break;
        case "price_high":
            params.sort_by = "price";
            params.sort_order = "desc";
            break;
        case "recommended":
        default:
            params.sort_by = "favorite_count";
            params.sort_order = "desc";
            break;
    }
    return params;
}
export { PAGE_SIZE };
