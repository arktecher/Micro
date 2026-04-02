export type EntityType = 'artist' | 'artwork' | 'corporate' | 'space' | 'delivery';
export interface IDConfig {
    prefix: string;
    label: string;
    color: string;
}
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
export function formatID(type: EntityType, numericId: number | string): string {
    const config = ID_CONFIGS[type];
    const paddedId = String(numericId).padStart(5, '0');
    return `${config.prefix}-${paddedId}`;
}
export function extractNumericID(formattedId: string): number {
    const parts = formattedId.split('-');
    if (parts.length !== 2) {
        throw new Error(`Invalid ID format: ${formattedId}`);
    }
    return parseInt(parts[1], 10);
}
export function getEntityType(formattedId: string): EntityType | null {
    const prefix = formattedId.split('-')[0];
    const entry = Object.entries(ID_CONFIGS).find(([, config]) => config.prefix === prefix);
    return entry ? (entry[0] as EntityType) : null;
}
export function validateID(formattedId: string): boolean {
    const pattern = /^(AR|AW|CO|SP|DL)-\d{5}$/;
    return pattern.test(formattedId);
}
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
export function generateRandomID(type: EntityType): string {
    const randomNum = Math.floor(Math.random() * 99999) + 1;
    return formatID(type, randomNum);
}
export function generateIDRange(type: EntityType, start: number, count: number): string[] {
    return Array.from({ length: count }, (_, i) => formatID(type, start + i));
}
