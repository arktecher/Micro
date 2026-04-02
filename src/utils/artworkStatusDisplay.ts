import { isArtworkInTransitFamily, isArtworkReturnedAtArtistFamily, } from "@/services/artwork.service";
export type ArtworkStatusDisplayVariant = "displaying" | "in_transit" | "other";
export function artworkStatusLabelJa(status: string | undefined | null): {
    label: string;
    variant: ArtworkStatusDisplayVariant;
} {
    const s = (status || "").trim();
    if (isArtworkInTransitFamily(s)) {
        return { label: "返送中", variant: "in_transit" };
    }
    if (isArtworkReturnedAtArtistFamily(s)) {
        return { label: "回収済み", variant: "other" };
    }
    switch (s) {
        case "exhibition_requested":
            return { label: "展示依頼中", variant: "other" };
        case "published":
        case "exhibited":
            return { label: "展示中", variant: "displaying" };
        case "draft":
            return { label: "下書き", variant: "other" };
        case "sold":
            return { label: "売却済み", variant: "other" };
        case "rented":
            return { label: "レンタル中", variant: "other" };
        default:
            return { label: s ? s : "—", variant: "other" };
    }
}
export function badgeClassForArtworkStatusVariant(variant: ArtworkStatusDisplayVariant): string {
    switch (variant) {
        case "displaying":
            return "bg-green-100 text-green-700 border-green-200";
        case "in_transit":
            return "bg-amber-100 text-amber-900 border-amber-300";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
}
