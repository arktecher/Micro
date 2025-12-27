import type { Artwork } from "@/types/artwork";

// MGJ's 15 dominant colors
export const MGJ_COLORS = [
  { name: "ブラック", hex: "#2C2C2C" },
  { name: "ホワイト", hex: "#FFFFFF" },
  { name: "グレー", hex: "#9CA3AF" },
  { name: "ベージュ", hex: "#D4B896" },
  { name: "テラコッタ", hex: "#C86F56" },
  { name: "ネイビー", hex: "#1E3A5F" },
  { name: "ブラウン", hex: "#8B6F47" },
  { name: "グリーン", hex: "#6B8E6F" },
  { name: "ブルー", hex: "#7BA8C0" },
  { name: "イエロー", hex: "#E8C468" },
  { name: "ピンク", hex: "#D4A5A5" },
  { name: "レッド", hex: "#B85C5C" },
  { name: "パープル", hex: "#8B7BA8" },
  { name: "オレンジ", hex: "#D89165" },
  { name: "ゴールド", hex: "#C9A961" },
];

// Sample artwork data
export const SAMPLE_ARTWORKS: Artwork[] = [
  {
    id: "WRK-001",
    title: "静寂の朝",
    artist: "田中 美咲",
    size: "M",
    dimensions: { width: 60, height: 45 },
    price: 85000,
    technique: "油彩",
    dominantColor: "#7BA8C0",
    image:
      "https://images.unsplash.com/photo-1697257378991-b57497dddc69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMGdhbGxlcnl8ZW58MXx8fHwxNzYzNDUzMDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-15",
    popularity: 85,
  },
  {
    id: "WRK-002",
    title: "都市の記憶",
    artist: "佐藤 健太",
    size: "L",
    dimensions: { width: 90, height: 65 },
    price: 120000,
    technique: "アクリル",
    dominantColor: "#2C2C2C",
    image:
      "https://images.unsplash.com/photo-1706811833540-2a1054cddafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnQlMjBwYWludGluZ3xlbnwxfHx8fDE3NjM0NzE2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-18",
    popularity: 92,
  },
  {
    id: "WRK-003",
    title: "風の詩",
    artist: "山本 彩花",
    size: "S",
    dimensions: { width: 30, height: 40 },
    price: 45000,
    technique: "インク",
    dominantColor: "#D4B896",
    image:
      "https://images.unsplash.com/photo-1683659635051-39336c5476b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0fGVufDF8fHx8MTc2MzQ0OTkzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "rented",
    createdAt: "2024-03-10",
    popularity: 78,
  },
  {
    id: "WRK-004",
    title: "時の流れ",
    artist: "鈴木 隆",
    size: "XL",
    dimensions: { width: 130, height: 97 },
    price: 180000,
    technique: "油彩",
    dominantColor: "#C86F56",
    image:
      "https://images.unsplash.com/photo-1522878308970-972ec5eedc0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnR8ZW58MXx8fHwxNzYzNDQ4MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-20",
    popularity: 95,
  },
  {
    id: "WRK-005",
    title: "光と影",
    artist: "高橋 麻衣",
    size: "M",
    dimensions: { width: 53, height: 53 },
    price: 95000,
    technique: "アクリル",
    dominantColor: "#E8C468",
    image:
      "https://images.unsplash.com/photo-1757332209950-03f3ccb4e4a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGFydCUyMG1vZGVybnxlbnwxfHx8fDE3NjM0NTMxNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-12",
    popularity: 88,
  },
  {
    id: "WRK-006",
    title: "夏の思い出",
    artist: "伊藤 誠",
    size: "L",
    dimensions: { width: 80, height: 60 },
    price: 135000,
    technique: "スプレー",
    dominantColor: "#D89165",
    image:
      "https://images.unsplash.com/photo-1532540983331-3260f8487880?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGV4cHJlc3Npb25pc218ZW58MXx8fHwxNzYzNTA3MDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-08",
    popularity: 82,
  },
  {
    id: "WRK-007",
    title: "静かな午後",
    artist: "渡辺 優子",
    size: "S",
    dimensions: { width: 38, height: 27 },
    price: 52000,
    technique: "油彩",
    dominantColor: "#FFFFFF",
    image:
      "https://images.unsplash.com/photo-1580136607993-fd598cf5c4f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYzMzk0OTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-16",
    popularity: 75,
  },
  {
    id: "WRK-008",
    title: "夜の街角",
    artist: "中村 大輔",
    size: "M",
    dimensions: { width: 65, height: 50 },
    price: 78000,
    technique: "コラージュ",
    dominantColor: "#1E3A5F",
    image:
      "https://images.unsplash.com/photo-1487452066049-a710f7296400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFydHxlbnwxfHx8fDE3NjM1MDcwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "rented",
    createdAt: "2024-03-14",
    popularity: 80,
  },
  {
    id: "WRK-009",
    title: "春の訪れ",
    artist: "小林 さくら",
    size: "L",
    dimensions: { width: 72, height: 91 },
    price: 145000,
    technique: "アクリル",
    dominantColor: "#6B8E6F",
    image:
      "https://images.unsplash.com/photo-1653919811590-959d2cdc163a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBhcnQlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NjM1MDcwOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-19",
    popularity: 90,
  },
  {
    id: "WRK-010",
    title: "無限の空間",
    artist: "加藤 翔太",
    size: "XL",
    dimensions: { width: 162, height: 112 },
    price: 220000,
    technique: "油彩",
    dominantColor: "#9CA3AF",
    image:
      "https://images.unsplash.com/photo-1704121113061-d174b9b9219b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBhcnR8ZW58MXx8fHwxNzYzNDgyNjY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-22",
    popularity: 98,
  },
  {
    id: "WRK-011",
    title: "月明かり",
    artist: "吉田 真理",
    size: "M",
    dimensions: { width: 45, height: 60 },
    price: 88000,
    technique: "インク",
    dominantColor: "#8B7BA8",
    image:
      "https://images.unsplash.com/photo-1643756511497-b3e4701ea792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBwYWludGluZ3xlbnwxfHx8fDE3NjM1MDExMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-11",
    popularity: 86,
  },
  {
    id: "WRK-012",
    title: "秋の調べ",
    artist: "松本 和也",
    size: "S",
    dimensions: { width: 33, height: 24 },
    price: 48000,
    technique: "アクリル",
    dominantColor: "#D4A5A5",
    image:
      "https://images.unsplash.com/photo-1680456265112-e4115432ef23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMHdhcm18ZW58MXx8fHwxNzYzNTA3MDk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "available",
    createdAt: "2024-03-13",
    popularity: 77,
  },
];

export const SORT_OPTIONS = [
  { id: "recommended", label: "おすすめ" },
  { id: "newest", label: "新着" },
  { id: "popular", label: "人気" },
  { id: "price_low", label: "価格（安い順）" },
  { id: "price_high", label: "価格（高い順）" },
];

export const SIZE_OPTIONS = ["S", "M", "L", "XL"];

export const PRICE_RANGES = [
  { id: "1-5", label: "1-5万円", min: 10000, max: 50000 },
  { id: "5-10", label: "5-10万円", min: 50000, max: 100000 },
  { id: "10-20", label: "10-20万円", min: 100000, max: 200000 },
  { id: "20+", label: "20万円以上", min: 200000, max: Infinity },
];

export const TECHNIQUE_OPTIONS = [
  { id: "all", label: "すべての技法" },
  { id: "acrylic", label: "アクリル" },
  { id: "oil", label: "油彩" },
  { id: "spray", label: "スプレー" },
  { id: "collage", label: "コラージュ" },
  { id: "ink", label: "インク" },
];

export const STYLE_OPTIONS = [
  "抽象画",
  "具象画",
  "和風",
  "ミニマル",
  "北欧",
  "モダン",
  "ポップアート",
  "風景画",
];

export const STATUS_OPTIONS = [
  { id: "available", label: "即発送可能" },
  { id: "displayed", label: "展示中" },
  { id: "rented", label: "貸出中" },
];

