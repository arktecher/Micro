import type { Artwork as CatalogArtwork } from "@/types/artwork";
import type { Artwork as ApiArtwork } from "@/services/artwork.service";
import { isArtworkInTransitFamily } from "@/services/artwork.service";
const PLACEHOLDER_IMAGE = "data:image/svg+xml," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#f3f4f6" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="14">No image</text></svg>`);
function parsePrice(v: unknown): number {
    if (typeof v === "number")
        return v;
    if (typeof v === "string")
        return Number(v) || 0;
    return 0;
}
export function mapApiArtworkToCatalogArtwork(a: ApiArtwork): CatalogArtwork {
    const dims = (a.dimensions ?? {}) as {
        width?: number | string;
        height?: number | string;
    };
    const width = typeof dims.width === "number" ? dims.width : Number(dims.width) || 0;
    const height = typeof dims.height === "number" ? dims.height : Number(dims.height) || 0;
    let status: string = "available";
    if (a.status === "exhibited")
        status = "displayed";
    else if (isArtworkInTransitFamily(a.status))
        status = "rented";
    const createdAt = a.published_at || a.created_at || "";
    return {
        id: a.id,
        title: a.title,
        artist: a.artist?.name ?? "—",
        size: a.size_class ?? "M",
        dimensions: { width, height },
        price: parsePrice(a.price),
        technique: a.medium ?? "",
        dominantColor: a.dominant_color ?? "#9CA3AF",
        image: a.main_image_url?.trim() ? a.main_image_url : PLACEHOLDER_IMAGE,
        status,
        createdAt,
        popularity: a.view_count ?? 0,
    };
}
