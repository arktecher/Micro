/**
 * LocalStorageキー定義
 * 全て "mgj_" プレフィックス + スネークケースで統一
 */

// 認証関連
export const STORAGE_KEYS = {
  IS_AUTHENTICATED: "mgj_is_authenticated",
  USER_TYPE: "mgj_user_type",
  CURRENT_USER: "mgj_current_user",
  
  // お気に入り
  CORPORATE_FAVORITES: "mgj_corporate_favorites",
  CUSTOMER_FAVORITES: "mgj_customer_favorites",
} as const;

/**
 * ユーザータイプに応じたお気に入りキーを取得
 */
export function getFavoritesKey(userType: "artist" | "corporate" | "customer" | null): string {
  if (userType === "corporate") {
    return STORAGE_KEYS.CORPORATE_FAVORITES;
  }
  return STORAGE_KEYS.CUSTOMER_FAVORITES;
}

