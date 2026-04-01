import type { Artwork } from "@/services/artwork.service";

function pickImageRowUrl(row: Record<string, unknown>): string {
  for (const key of ["image_url", "imageUrl", "url"] as const) {
    const v = row[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function imageOrder(row: Record<string, unknown>): number {
  const o = row.image_order ?? row.imageOrder;
  return typeof o === "number" ? o : Number(o) || 0;
}

/**
 * Ordered, deduped public URLs for carousels (detail API: images rows, else thumbnails, else main).
 * Handles string JSON for `thumbnail_urls` and alternate keys on image rows (`url` / camelCase).
 */
export function collectArtworkImageUrls(artwork: Artwork): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (u: unknown) => {
    const s = typeof u === "string" ? u.trim() : "";
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  const raw = artwork as Record<string, unknown>;
  const rawImages = artwork.images ?? raw.images;
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    const ordered = [...rawImages].sort((a, b) => {
      const ao =
        typeof a === "object" && a !== null
          ? imageOrder(a as Record<string, unknown>)
          : 0;
      const bo =
        typeof b === "object" && b !== null
          ? imageOrder(b as Record<string, unknown>)
          : 0;
      return ao - bo;
    });
    for (const img of ordered) {
      if (typeof img === "string") {
        push(img);
        continue;
      }
      if (img && typeof img === "object") {
        push(pickImageRowUrl(img as Record<string, unknown>));
      }
    }
    if (out.length > 0) return out;
  }

  let thumbs: unknown = artwork.thumbnail_urls ?? raw.thumbnail_urls ?? raw.thumbnailUrls;
  if (typeof thumbs === "string") {
    try {
      thumbs = JSON.parse(thumbs) as unknown;
    } catch {
      const t = thumbs.trim();
      thumbs = t ? [t] : [];
    }
  }
  if (Array.isArray(thumbs)) {
    for (const t of thumbs) push(t);
    if (out.length > 0) return out;
  }

  const main =
    artwork.main_image_url ??
    (typeof raw.main_image_url === "string" ? raw.main_image_url : undefined) ??
    (typeof raw.mainImageUrl === "string" ? raw.mainImageUrl : undefined);
  push(main);
  return out;
}
