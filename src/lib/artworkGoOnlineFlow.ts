/**
 * Session flow after registering new artwork(s): prompt each id whether to publish online.
 *
 * Canonical URL for the per-work prompt: `/artist/works/:artworkId/online-confirm`
 * (legacy `/signup/artist/artwork-go-online/:id` redirects there).
 */
export const GO_ONLINE_QUEUE_KEY = "mgj_go_online_queue";
export const GO_ONLINE_ANY_PUBLISHED_KEY = "mgj_go_online_any_published";
export const ONBOARDING_PUBLISHED_IDS_KEY = "mgj_onboarding_published_ids";

/** Record an artwork id published during this onboarding session (for the completion page only). */
export function addOnboardingPublishedArtworkId(artworkId: string): void {
  try {
    const raw = sessionStorage.getItem(ONBOARDING_PUBLISHED_IDS_KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    const id = String(artworkId);
    if (!arr.includes(id)) arr.push(id);
    sessionStorage.setItem(ONBOARDING_PUBLISHED_IDS_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

/** Read and clear ids published this session (completion page). */
export function consumeOnboardingPublishedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(ONBOARDING_PUBLISHED_IDS_KEY);
    sessionStorage.removeItem(ONBOARDING_PUBLISHED_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function artworkOnlineConfirmPath(artworkId: string): string {
  return `/artist/works/${artworkId}/online-confirm`;
}

/** 別名: `/#/artwork-selection/:artworkId`（旧 artwork-selection 導線用） */
export function artworkSelectionPromptPath(artworkId: string): string {
  return `/artwork-selection/${artworkId}`;
}

export function initGoOnlineQueue(artworkIds: string[]): void {
  sessionStorage.setItem(GO_ONLINE_ANY_PUBLISHED_KEY, "false");
  sessionStorage.setItem(GO_ONLINE_QUEUE_KEY, JSON.stringify(artworkIds));
}

/** First id in the pending queue, or null if none (e.g. after contract before artworks were registered). */
export function peekFirstGoOnlineArtworkId(): string | null {
  try {
    const raw = sessionStorage.getItem(GO_ONLINE_QUEUE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return String(parsed[0]);
  } catch {
    return null;
  }
}

function readQueue(): string[] {
  try {
    const raw = sessionStorage.getItem(GO_ONLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function advanceGoOnlineQueue(
  currentArtworkId: string,
  navigate: (to: string) => void,
  options: { publishedThisStep: boolean }
): void {
  if (options.publishedThisStep) {
    sessionStorage.setItem(GO_ONLINE_ANY_PUBLISHED_KEY, "true");
  }

  let queue = readQueue();
  if (queue[0] === currentArtworkId) {
    queue = queue.slice(1);
  } else {
    queue = queue.filter((id) => id !== currentArtworkId);
  }
  sessionStorage.setItem(GO_ONLINE_QUEUE_KEY, JSON.stringify(queue));

  if (queue.length > 0) {
    navigate(artworkOnlineConfirmPath(queue[0]));
    return;
  }

  const anyPublished =
    sessionStorage.getItem(GO_ONLINE_ANY_PUBLISHED_KEY) === "true";
  sessionStorage.removeItem(GO_ONLINE_ANY_PUBLISHED_KEY);
  sessionStorage.removeItem(GO_ONLINE_QUEUE_KEY);

  navigate(anyPublished ? "/artwork-publish" : "/dashboard");
}
