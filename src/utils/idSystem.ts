/**
 * MGJ ID System
 * 各エンティティに一意で識別しやすいIDを付与するシステム
 */

export type EntityType = 'artist' | 'artwork' | 'corporate' | 'space' | 'delivery';

export interface IDConfig {
  prefix: string;
  label: string;
  color: string;
}

// IDプレフィックスとラベルの定義
export const ID_CONFIGS: Record<EntityType, IDConfig> = {
  artist: {
    prefix: 'AR',
    label: 'アーティスト',
    color: 'text-purple-600 bg-purple-50',
  },
  artwork: {
    prefix: 'AW',
    label: '作品',
    color: 'text-blue-600 bg-blue-50',
  },
  corporate: {
    prefix: 'CO',
    label: '法人',
    color: 'text-green-600 bg-green-50',
  },
  space: {
    prefix: 'SP',
    label: 'スペース',
    color: 'text-orange-600 bg-orange-50',
  },
  delivery: {
    prefix: 'DL',
    label: '配送',
    color: 'text-pink-600 bg-pink-50',
  },
};

/**
 * 数値IDをフォーマットされたIDに変換
 * @param type エンティティタイプ
 * @param numericId 数値ID
 * @returns フォーマットされたID (例: AR-00001)
 */
export function formatID(type: EntityType, numericId: number | string): string {
  const config = ID_CONFIGS[type];
  const paddedId = String(numericId).padStart(5, '0');
  return `${config.prefix}-${paddedId}`;
}

/**
 * フォーマットされたIDから数値IDを抽出
 * @param formattedId フォーマットされたID (例: AR-00001)
 * @returns 数値ID
 */
export function extractNumericID(formattedId: string): number {
  const parts = formattedId.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid ID format: ${formattedId}`);
  }
  return parseInt(parts[1], 10);
}

/**
 * IDからエンティティタイプを判定
 * @param formattedId フォーマットされたID
 * @returns エンティティタイプ
 */
export function getEntityType(formattedId: string): EntityType | null {
  const prefix = formattedId.split('-')[0];
  const entry = Object.entries(ID_CONFIGS).find(([, config]) => config.prefix === prefix);
  return entry ? (entry[0] as EntityType) : null;
}

/**
 * IDの検証
 * @param formattedId フォーマットされたID
 * @returns 有効なIDかどうか
 */
export function validateID(formattedId: string): boolean {
  const pattern = /^(AR|AW|CO|SP|DL)-\d{5}$/;
  return pattern.test(formattedId);
}

/**
 * 検索クエリがIDフォーマットかどうかを判定
 * @param query 検索クエリ
 * @returns IDフォーマットの場合はエンティティタイプを返す
 */
export function parseSearchQuery(query: string): {
  isID: boolean;
  type: EntityType | null;
  numericId: number | null;
} {
  const trimmedQuery = query.trim().toUpperCase();
  
  if (validateID(trimmedQuery)) {
    return {
      isID: true,
      type: getEntityType(trimmedQuery),
      numericId: extractNumericID(trimmedQuery),
    };
  }
  
  return {
    isID: false,
    type: null,
    numericId: null,
  };
}

/**
 * ランダムなIDを生成（デモ用）
 * @param type エンティティタイプ
 * @returns フォーマットされたID
 */
export function generateRandomID(type: EntityType): string {
  const randomNum = Math.floor(Math.random() * 99999) + 1;
  return formatID(type, randomNum);
}

/**
 * ID範囲の配列を生成（デモ用）
 * @param type エンティティタイプ
 * @param start 開始番号
 * @param count 生成数
 * @returns IDの配列
 */
export function generateIDRange(type: EntityType, start: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => formatID(type, start + i));
}

