import type { CatalogSortId } from "@/utils/artworkCatalogQuery";
const SORT_IDS: CatalogSortId[] = [
    "recommended",
    "newest",
    "popular",
    "price_low",
    "price_high",
];
function isSortId(s: string | null): s is CatalogSortId {
    return s != null && (SORT_IDS as string[]).includes(s);
}
export function readCatalogSearchParamsFromLocation(): URLSearchParams {
    if (typeof window === "undefined")
        return new URLSearchParams();
    return new URLSearchParams(window.location.search || "");
}
export interface ArtworksCatalogUrlState {
    searchQuery: string;
    artistName: string;
    selectedSort: CatalogSortId;
    currentPage: number;
    selectedColors: string[];
    selectedSizes: string[];
    selectedPriceRanges: string[];
    selectedTechniques: string[];
    selectedStyles: string[];
}
function splitComma(s: string | null): string[] {
    if (!s?.trim())
        return [];
    return s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}
function splitPipe(s: string | null): string[] {
    if (!s?.trim())
        return [];
    return s
        .split("|")
        .map((x) => x.trim())
        .filter(Boolean);
}
export function parseArtworksCatalogUrl(sp: URLSearchParams): ArtworksCatalogUrlState {
    const pageRaw = parseInt(sp.get("page") || "1", 10);
    const currentPage = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
    const sortRaw = sp.get("sort");
    const selectedSort: CatalogSortId = isSortId(sortRaw)
        ? sortRaw
        : "recommended";
    const colorsRaw = splitComma(sp.get("colors"));
    const selectedColors = colorsRaw.map((hex) => hex.startsWith("#") ? hex : `#${hex}`);
    return {
        searchQuery: sp.get("q") ?? "",
        artistName: sp.get("artist") ?? "",
        selectedSort,
        currentPage,
        selectedColors,
        selectedSizes: splitComma(sp.get("sizes")),
        selectedPriceRanges: splitComma(sp.get("price")),
        selectedTechniques: splitComma(sp.get("tech")),
        selectedStyles: splitPipe(sp.get("styles")),
    };
}
function colorsToParam(colors: string[]): string {
    return colors.map((c) => c.replace(/^#/, "").toUpperCase()).join(",");
}
export function serializeArtworksCatalogUrl(state: ArtworksCatalogUrlState): URLSearchParams {
    const sp = new URLSearchParams();
    const q = state.searchQuery.trim();
    if (q)
        sp.set("q", q);
    const artist = state.artistName.trim();
    if (artist)
        sp.set("artist", artist);
    if (state.selectedSort !== "recommended") {
        sp.set("sort", state.selectedSort);
    }
    if (state.currentPage > 1) {
        sp.set("page", String(state.currentPage));
    }
    if (state.selectedColors.length > 0) {
        sp.set("colors", colorsToParam([...state.selectedColors].sort()));
    }
    if (state.selectedSizes.length > 0) {
        sp.set("sizes", [...state.selectedSizes].sort().join(","));
    }
    if (state.selectedPriceRanges.length > 0) {
        sp.set("price", [...state.selectedPriceRanges].sort().join(","));
    }
    if (state.selectedTechniques.length > 0) {
        sp.set("tech", [...state.selectedTechniques].sort().join(","));
    }
    if (state.selectedStyles.length > 0) {
        sp.set("styles", [...state.selectedStyles].sort().join("|"));
    }
    return sp;
}
