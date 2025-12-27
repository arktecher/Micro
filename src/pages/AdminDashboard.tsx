import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QRCodeManager } from "@/components/QRCodeManager";
import { IDDisplay, IDSearchInput } from "@/components/IDDisplay";
import { parseSearchQuery, validateID } from "@/utils/idSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutDashboard,
  Building2,
  Palette,
  Image,
  MapPin,
  Truck,
  DollarSign,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  TrendingDown,
  Calendar,
  Phone,
  Mail,
  MapPinned,
  CreditCard,
  BarChart3,
  PieChart,
  ChevronRight,
  Flag,
  Menu
} from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

// モックデータ
const mockDashboardStats = {
  newActions: {
    corporates: 2,
    artists: 3,
    artworks: 5,
  },
  displayed: {
    total: 24,
    byCorporate: 8,
  },
  shipping: {
    returns: 3,
    newDeliveries: 2,
    delayed: 1,
  },
  revenue: {
    thisMonth: 456000,
    total: 3240000,
  },
  issues: {
    total: 4,
    pending: 2,
  },
  alerts: [
    { id: 1, type: "warning", message: "リース期限切れ: 3件の作品が6ヶ月を超過", count: 3 },
    { id: 2, type: "error", message: "破損報告: 1件の未対応報告があります", count: 1 },
    { id: 3, type: "info", message: "未返却作品: 返却期限を過ぎている作品が2件", count: 2 },
  ],
};

const mockCorporates = [
  {
    id: "C001",
    name: "株式会社グローバルホテルズ",
    location: "東京都港区",
    contact: "田中 一郎",
    phone: "03-1234-5678",
    email: "tanaka@global-hotels.jp",
    industry: "ホテル",
    plan: "プレミアム",
    registeredAt: "2024-03-15",
    lastLogin: "2024-10-28",
    status: "アクティブ",
    contractStatus: "契約中",
    contractPeriod: "2024-03-15 〜 2025-03-14",
    paymentMethod: "クレジットカード",
    displayedArtworks: 8,
    totalRevenue: 450000,
    displayHistory: 24,
    spaces: 5,
  },
  {
    id: "C002",
    name: "テックオフィス株式会社",
    location: "東京都渋谷区",
    contact: "佐藤 花子",
    phone: "03-9876-5432",
    email: "sato@tech-office.jp",
    industry: "オフィス",
    plan: "スタンダード",
    registeredAt: "2024-05-20",
    lastLogin: "2024-10-27",
    status: "アクティブ",
    contractStatus: "契約中",
    contractPeriod: "2024-05-20 〜 2025-05-19",
    paymentMethod: "請求書",
    displayedArtworks: 5,
    totalRevenue: 280000,
    displayHistory: 12,
    spaces: 3,
  },
  {
    id: "C003",
    name: "メディカルケアクリニック",
    location: "大阪府大阪市",
    contact: "鈴木 太郎",
    phone: "06-1111-2222",
    email: "suzuki@medical-care.jp",
    industry: "病院",
    plan: "スタンダード",
    registeredAt: "2024-08-01",
    lastLogin: "2024-10-20",
    status: "体験",
    contractStatus: "体験",
    contractPeriod: "2024-08-01 〜 2024-11-01",
    paymentMethod: "クレジットカード",
    displayedArtworks: 3,
    totalRevenue: 0,
    displayHistory: 3,
    spaces: 2,
  },
];

const mockArtists = [
  {
    id: "A001",
    nameJa: "山田 美咲",
    nameEn: "Misaki Yamada",
    address: "東京都世田谷区",
    sns: "@misaki_art",
    portfolio: "https://misakiart.com",
    genre: ["抽象画", "ミニマル"],
    artworks: 12,
    displayCount: 34,
    contractType: "専属",
    revenueShare: "80%",
    priceRange: "¥30,000 - ¥80,000",
    leasePrice: "¥8,000/月",
    monthlyRevenue: 96000,
    paymentStatus: "支払済み",
    taxStatus: "源泉要",
    rightsChecked: true,
    agreementFile: "agreement_A001.pdf",
    registeredAt: "2024-01-15",
  },
  {
    id: "A002",
    nameJa: "佐藤 健太",
    nameEn: "Kenta Sato",
    address: "神奈川県横浜市",
    sns: "@kenta_photo",
    portfolio: "https://kentaphoto.jp",
    genre: ["写真", "風景"],
    artworks: 8,
    displayCount: 22,
    contractType: "非専属",
    revenueShare: "70%",
    priceRange: "¥40,000 - ¥100,000",
    leasePrice: "¥10,000/月",
    monthlyRevenue: 70000,
    paymentStatus: "支払済み",
    taxStatus: "免税",
    rightsChecked: true,
    agreementFile: "agreement_A002.pdf",
    registeredAt: "2024-02-20",
  },
  {
    id: "A003",
    nameJa: "鈴木 彩",
    nameEn: "Aya Suzuki",
    address: "大阪府大阪市",
    sns: "@aya_modern",
    portfolio: "https://ayaart.com",
    genre: ["版画", "抽象画"],
    artworks: 6,
    displayCount: 15,
    contractType: "専属",
    revenueShare: "80%",
    priceRange: "¥25,000 - ¥60,000",
    leasePrice: "¥7,000/月",
    monthlyRevenue: 42000,
    paymentStatus: "未払い",
    taxStatus: "源泉要",
    rightsChecked: true,
    agreementFile: "agreement_A003.pdf",
    registeredAt: "2024-04-10",
  },
];

const mockArtworks = [
  {
    id: "AW001",
    title: "静寂の朝",
    artistId: "A001",
    artistName: "山田 美咲",
    size: "72.7 × 53.0 cm",
    weight: "2.5kg",
    category: "絵画",
    condition: "良好",
    status: "展示中",
    corporateName: "株式会社グローバルホテルズ",
    salePrice: 65000,
    leasePrice: 8000,
    mgjFee: "20%",
    artistShare: "80%",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
    packageSize: "M",
    handling: "直射日光を避けてください",
    insurance: true,
    displayedAt: "2024-09-01",
  },
  {
    id: "AW002",
    title: "都市の夕暮れ",
    artistId: "A002",
    artistName: "佐藤 健太",
    size: "80.0 × 60.0 cm",
    weight: "3.0kg",
    category: "写真",
    condition: "良好",
    status: "展示中",
    corporateName: "テックオフィス株式会社",
    salePrice: 85000,
    leasePrice: 10000,
    mgjFee: "20%",
    artistShare: "80%",
    image: "https://images.unsplash.com/photo-1518640165713-ddf87c2f3eb4?w=400",
    packageSize: "L",
    handling: "温度・湿度に注意",
    insurance: true,
    displayedAt: "2024-08-15",
  },
  {
    id: "AW003",
    title: "抽象の記憶",
    artistId: "A003",
    artistName: "鈴木 彩",
    size: "60.0 × 60.0 cm",
    weight: "2.0kg",
    category: "版画",
    condition: "良好",
    status: "返却中",
    corporateName: "-",
    salePrice: 45000,
    leasePrice: 7000,
    mgjFee: "20%",
    artistShare: "80%",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400",
    packageSize: "M",
    handling: "特になし",
    insurance: false,
    displayedAt: "-",
  },
  {
    id: "AW004",
    title: "光の軌跡",
    artistId: "A001",
    artistName: "山田 美咲",
    size: "90.0 × 70.0 cm",
    weight: "4.0kg",
    category: "絵画",
    condition: "要補修",
    status: "点検中",
    corporateName: "-",
    salePrice: 120000,
    leasePrice: 12000,
    mgjFee: "20%",
    artistShare: "80%",
    image: "https://images.unsplash.com/photo-1577083553790-2f20c6d4a569?w=400",
    packageSize: "L",
    handling: "取扱注意",
    insurance: true,
    displayedAt: "-",
  },
];

const mockSpaces = [
  {
    id: "S001",
    name: "1階メインロビー",
    corporateId: "C001",
    corporateName: "株式会社グローバルホテルズ",
    location: "東京都港区六本木1-1-1",
    type: "エントランス",
    currentDisplayed: 2,
    displayHistory: 8,
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    ],
    registeredAt: "2024-03-15",
  },
  {
    id: "S002",
    name: "2階会議室前廊下",
    corporateId: "C001",
    corporateName: "株式会社グローバルホテルズ",
    location: "東京都港区六本木1-1-1",
    type: "廊下",
    currentDisplayed: 3,
    displayHistory: 12,
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    ],
    registeredAt: "2024-03-15",
  },
  {
    id: "S003",
    name: "3階VIPラウンジ",
    corporateId: "C001",
    corporateName: "株式会社グローバルホテルズ",
    location: "東京都港区六本木1-1-1",
    type: "ラウンジ",
    currentDisplayed: 2,
    displayHistory: 6,
    images: [
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    ],
    registeredAt: "2024-03-20",
  },
  {
    id: "S004",
    name: "エントランスホール",
    corporateId: "C002",
    corporateName: "テックオフィス株式会社",
    location: "東京都渋谷区道玄坂2-2-2",
    type: "エントランス",
    currentDisplayed: 2,
    displayHistory: 5,
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    ],
    registeredAt: "2024-05-20",
  },
  {
    id: "S005",
    name: "会議室A",
    corporateId: "C002",
    corporateName: "テックオフィス株式会社",
    location: "東京都渋谷区道玄坂2-2-2",
    type: "会議室",
    currentDisplayed: 2,
    displayHistory: 4,
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    ],
    registeredAt: "2024-05-25",
  },
  {
    id: "S006",
    name: "待合室",
    corporateId: "C003",
    corporateName: "メディカルケアクリニック",
    location: "大阪府大阪市北区梅田3-3-3",
    type: "待合室",
    currentDisplayed: 1,
    displayHistory: 3,
    images: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    ],
    registeredAt: "2024-08-01",
  },
];

const mockShipments = [
  {
    id: "SH001",
    artworkId: "AW001",
    artworkTitle: "静寂の朝",
    type: "新規配送",
    from: "山田 美咲（東京都世田谷区）",
    to: "株式会社グローバルホテルズ（東京本社・1階ロビー）",
    carrier: "ヤマト運輸",
    trackingNumber: "1234-5678-9012",
    status: "配送中",
    estimatedDelivery: "2024-10-30",
    packageSize: "M",
    shippingCost: 1500,
    insuranceCovered: true,
  },
  {
    id: "SH002",
    artworkId: "AW003",
    artworkTitle: "抽象の記憶",
    type: "返却",
    from: "メディカルケアクリニック（大阪支社）",
    to: "鈴木 彩（大阪府大阪市）",
    carrier: "佐川急便",
    trackingNumber: "9876-5432-1098",
    status: "集荷待ち",
    estimatedDelivery: "2024-11-01",
    packageSize: "M",
    shippingCost: 1200,
    insuranceCovered: false,
  },
  {
    id: "SH003",
    artworkId: "AW004",
    artworkTitle: "光の軌跡",
    type: "返却（破損）",
    from: "テックオフィス株式会社（渋谷オフィス）",
    to: "山田 美咲（東京都世田谷区）",
    carrier: "ヤマト運輸",
    trackingNumber: "5555-6666-7777",
    status: "配送完了",
    estimatedDelivery: "2024-10-25",
    packageSize: "L",
    shippingCost: 2000,
    insuranceCovered: true,
  },
];

const mockTransactions = [
  {
    id: "TX001",
    date: "2024-10-15",
    type: "売上",
    corporateName: "株式会社グローバルホテルズ",
    artistName: "山田 美咲",
    artworkTitle: "静寂の朝",
    amount: 65000,
    mgjFee: 13000,
    artistRevenue: 52000,
    status: "完了",
  },
  {
    id: "TX002",
    date: "2024-10-20",
    type: "リース料",
    corporateName: "テックオフィス株式会社",
    artistName: "佐藤 健太",
    artworkTitle: "都市の夕暮れ",
    amount: 10000,
    mgjFee: 2000,
    artistRevenue: 8000,
    status: "完了",
  },
  {
    id: "TX003",
    date: "2024-10-28",
    type: "送料",
    corporateName: "メディカルケアクリニック",
    artistName: "-",
    artworkTitle: "抽象の記憶",
    amount: 1200,
    mgjFee: 1200,
    artistRevenue: 0,
    status: "請求中",
  },
];

const mockContracts = [
  {
    id: "CT001",
    type: "アーティスト契約",
    partyName: "山田 美咲",
    agreementType: "専属契約",
    signedDate: "2024-01-15",
    status: "有効",
    document: "agreement_A001.pdf",
    revenueShare: "80%",
    commercialUse: "展示のみ",
  },
  {
    id: "CT002",
    type: "法人契約",
    partyName: "株式会社グローバルホテルズ",
    agreementType: "プレミアムプラン",
    signedDate: "2024-03-15",
    status: "有効",
    document: "contract_C001.pdf",
    revenueShare: "-",
    commercialUse: "展示＋販売可",
  },
  {
    id: "CT003",
    type: "アーティスト契約",
    partyName: "鈴木 彩",
    agreementType: "専属契約",
    signedDate: "2024-04-10",
    status: "有効",
    document: "agreement_A003.pdf",
    revenueShare: "80%",
    commercialUse: "展示のみ",
  },
];

const mockSupport = [
  {
    id: "SUP001",
    type: "破損報告",
    reportedBy: "テックオフィス株式会社",
    artworkTitle: "光の軌跡",
    content: "配送中に額縁の角が破損しました",
    status: "対応中",
    assignedTo: "山田（MGJ）",
    createdAt: "2024-10-25",
    priority: "高",
  },
  {
    id: "SUP002",
    type: "著作権報告",
    reportedBy: "匿名",
    artworkTitle: "都市の夕暮れ",
    content: "この作品は別の作家の作品に類似しています",
    status: "受付",
    assignedTo: "-",
    createdAt: "2024-10-28",
    priority: "中",
  },
  {
    id: "SUP003",
    type: "問い合わせ",
    reportedBy: "メディカルケアクリニック",
    artworkTitle: "-",
    content: "契約内容の変更について相談したい",
    status: "完了",
    assignedTo: "佐藤（MGJ）",
    createdAt: "2024-10-20",
    priority: "低",
  },
];

const mockUsers = [
  {
    id: "U001",
    name: "山田 次郎",
    email: "yamada@mgj.jp",
    role: "管理者",
    permissions: ["閲覧", "編集", "削除", "財務"],
    lastLogin: "2024-10-29 09:30",
    status: "アクティブ",
    twoFactorEnabled: true,
  },
  {
    id: "U002",
    name: "佐藤 花子",
    email: "sato@mgj.jp",
    role: "スタッフ",
    permissions: ["閲覧", "編集"],
    lastLogin: "2024-10-28 14:20",
    status: "アクティブ",
    twoFactorEnabled: false,
  },
  {
    id: "U003",
    name: "鈴木 太郎",
    email: "suzuki@external.jp",
    role: "外部委託",
    permissions: ["閲覧"],
    lastLogin: "2024-10-27 11:00",
    status: "アクティブ",
    twoFactorEnabled: true,
  },
];

const mockReports = [
  {
    id: "R001",
    artworkId: "1",
    artworkTitle: "夏の思い出",
    artistName: "山田 美咲",
    reportedAt: "2024-10-28 10:30",
    reportedBy: "匿名ユーザー",
    reason: "AI生成物の未明示",
    details: "この作品はAI技術を使用して生成された可能性が高いですが、作品情報にその記載がありません。明らかにAI特有の表現が見られます。",
    status: "未対応",
    priority: "高",
  },
  {
    id: "R002",
    artworkId: "2",
    artworkTitle: "都市の夜",
    artistName: "佐藤 健太",
    reportedAt: "2024-10-27 15:45",
    reportedBy: "匿名ユーザー",
    reason: "著作権侵害",
    details: "有名な写真家〇〇氏の作品「××」と酷似しており、著作権を侵害している可能性があります。",
    status: "対応中",
    priority: "高",
  },
  {
    id: "R003",
    artworkId: "3",
    artworkTitle: "静寂",
    artistName: "鈴木 美咲",
    reportedAt: "2024-10-26 09:15",
    reportedBy: "匿名ユーザー",
    reason: "不適切な内容",
    details: "過度に暴力的な表現が含まれており、公的空間への展示には不適切だと思います。",
    status: "対応中",
    priority: "中",
  },
  {
    id: "R004",
    artworkId: "4",
    artworkTitle: "抽象的な対話",
    artistName: "田中 一郎",
    reportedAt: "2024-10-25 14:20",
    reportedBy: "匿名ユーザー",
    reason: "虚偽情報",
    details: "作品の制作年や経歴に虚偽が含まれている可能性があります。",
    status: "対応済み",
    priority: "低",
  },
  {
    id: "R005",
    artworkId: "5",
    artworkTitle: "光の粒子",
    artistName: "高橋 花子",
    reportedAt: "2024-10-24 11:00",
    reportedBy: "匿名ユーザー",
    reason: "その他",
    details: "作品の説明と実際の作品が異なっているように見えます。",
    status: "却下",
    priority: "低",
  },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCorporate, setSelectedCorporate] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // セクション切り替え時に選択状態と検索クエリをリセット
  useEffect(() => {
    setSelectedCorporate(null);
    setSelectedArtist(null);
    setSelectedSpace(null);
    setSearchQuery("");
  }, [activeSection]);

  // モバイルでセクション切り替え時にサイドバーを閉じる
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeSection]);

  const sections = [
    { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
    { id: "corporates", label: "法人", icon: Building2 },
    { id: "artists", label: "アーティスト", icon: Palette },
    { id: "artworks", label: "作品", icon: Image },
    { id: "spaces", label: "スペース", icon: MapPinned },
    { id: "displays", label: "展示", icon: MapPin },
    { id: "shipping", label: "配送", icon: Truck },
    { id: "transactions", label: "取引", icon: DollarSign },
    { id: "contracts", label: "契約", icon: FileText },
    { id: "reports", label: "通報管理", icon: Flag },
    { id: "support", label: "サポート", icon: MessageSquare },
    { id: "users", label: "権限", icon: Users },
    { id: "analytics", label: "アナリティクス", icon: TrendingUp },
    { id: "settings", label: "設定", icon: Settings },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      アクティブ: "bg-green-500",
      体験: "bg-yellow-500",
      停止: "bg-red-500",
      契約中: "bg-green-500",
      展示中: "bg-blue-500",
      返却中: "bg-orange-500",
      点検中: "bg-yellow-500",
      良好: "bg-green-500",
      要補修: "bg-red-500",
      配送中: "bg-blue-500",
      集荷待ち: "bg-yellow-500",
      配送完了: "bg-green-500",
      完了: "bg-green-500",
      請求中: "bg-orange-500",
      有効: "bg-green-500",
      対応中: "bg-orange-500",
      受付: "bg-blue-500",
    };

    return <Badge className={`${config[status] || "bg-gray-500"} text-white`}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, string> = {
      高: "bg-red-500",
      中: "bg-yellow-500",
      低: "bg-gray-500",
    };

    return <Badge className={`${config[priority] || "bg-gray-500"} text-white`}>{priority}</Badge>;
  };

  // サイドバーコンテンツ（再利用可能）
  const SidebarContent = () => (
    <div className="p-4 w-full overflow-hidden">
      <h2 className="px-3 mb-4 text-xs text-gray-500 uppercase tracking-wider">
        MGJ 管理画面
      </h2>
      <nav className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{section.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 flex">
        {/* デスクトップ左サイドバー */}
        <aside className="hidden lg:block w-64 flex-shrink-0 flex-grow-0 bg-white border-r border-gray-200 min-h-[calc(100vh-5rem)] sticky top-20">
          <SidebarContent />
        </aside>

        {/* モバイルサイドバー（Sheet） */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* モバイルメニューボタン */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              <span>メニュー</span>
            </Button>
          </div>
          {/* ダッシュボード */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">ダッシュボード</h1>
                <p className="text-sm sm:text-base text-gray-600">システム全体の概要と重要な指標</p>
              </div>

              {/* アラート */}
              <div className="space-y-3">
                {mockDashboardStats.alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`border-l-4 ${
                      alert.type === "error"
                        ? "border-l-red-500 bg-red-50"
                        : alert.type === "warning"
                        ? "border-l-yellow-500 bg-yellow-50"
                        : "border-l-blue-500 bg-blue-50"
                    }`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle
                          className={`w-5 h-5 ${
                            alert.type === "error"
                              ? "text-red-600"
                              : alert.type === "warning"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}
                        />
                        <p className="text-sm text-gray-900">{alert.message}</p>
                      </div>
                      <Badge
                        className={`${
                          alert.type === "error"
                            ? "bg-red-500"
                            : alert.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        } text-white`}
                      >
                        {alert.count}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">今日の新規アクション</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">法人登録</span>
                      <span className="text-gray-900">{mockDashboardStats.newActions.corporates}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">アーティスト登録</span>
                      <span className="text-gray-900">{mockDashboardStats.newActions.artists}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">作品追加</span>
                      <span className="text-gray-900">{mockDashboardStats.newActions.artworks}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">展示中作品</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-gray-900">{mockDashboardStats.displayed.total}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      法人数: {mockDashboardStats.displayed.byCorporate}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">配送ステータス</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">返却</span>
                      <Badge className="bg-orange-500 text-white">
                        {mockDashboardStats.shipping.returns}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">新規発送</span>
                      <Badge className="bg-blue-500 text-white">
                        {mockDashboardStats.shipping.newDeliveries}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">遅延</span>
                      <Badge className="bg-red-500 text-white">
                        {mockDashboardStats.shipping.delayed}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">売上・リース収益</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">当月</p>
                      <p className="text-xl text-gray-900">
                        ¥{mockDashboardStats.revenue.thisMonth.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">累計</p>
                      <p className="text-sm text-gray-900">
                        ¥{mockDashboardStats.revenue.total.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">トラブル報告</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-2xl text-orange-600">{mockDashboardStats.issues.total}</p>
                        <p className="text-xs text-gray-600">総報告数</p>
                      </div>
                      <div>
                        <p className="text-xl text-red-600">{mockDashboardStats.issues.pending}</p>
                        <p className="text-xs text-gray-600">未対応</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">クイックアクション</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      月次レポートをエクスポート
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      請求書を一括生成
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      リマインダーを送信
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 法人管理 */}
          {activeSection === "corporates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">法人管理</h1>
                  <p className="text-gray-600">登録法人の情報と契約状況</p>
                </div>
                <div className="flex gap-2">
                  {selectedCorporate && (
                    <Button variant="outline" onClick={() => setSelectedCorporate(null)}>
                      一覧に戻る
                    </Button>
                  )}
                  <Button>
                    <Building2 className="w-4 h-4 mr-2" />
                    新規法人追加
                  </Button>
                </div>
              </div>

              {!selectedCorporate ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>法人一覧</CardTitle>
                      <div className="flex gap-2">
                        <IDSearchInput
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="ID検索 (例: CO-00001) または法人名"
                          className="w-80"
                        />
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[800px] px-4 sm:px-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>法人名</TableHead>
                              <TableHead>所在地</TableHead>
                              <TableHead>担当者</TableHead>
                              <TableHead>業種</TableHead>
                              <TableHead>プラン</TableHead>
                              <TableHead>展示数</TableHead>
                              <TableHead>総収益</TableHead>
                              <TableHead>ステータス</TableHead>
                              <TableHead>アクション</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                        {mockCorporates.map((corp) => (
                          <TableRow
                            key={corp.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedCorporate(corp.id)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <IDDisplay type="corporate" numericId={corp.id.replace('C', '')} size="sm" />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{corp.name}</p>
                                <p className="text-xs text-gray-500">{corp.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{corp.location}</TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{corp.contact}</p>
                                <p className="text-xs text-gray-500">{corp.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>{corp.industry}</TableCell>
                            <TableCell>
                              <Badge variant={corp.plan === "プレミアム" ? "default" : "secondary"}>
                                {corp.plan}
                              </Badge>
                            </TableCell>
                            <TableCell>{corp.displayedArtworks}件</TableCell>
                            <TableCell>¥{corp.totalRevenue.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(corp.status)}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedCorporate(corp.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {(() => {
                    const corp = mockCorporates.find((c) => c.id === selectedCorporate);
                    if (!corp) return null;

                    const displayedArtworks = mockArtworks.filter(
                      (a) => a.corporateName === corp.name && a.status === "展示中"
                    );

                    return (
                      <div className="space-y-6">
                        {/* 基本情報 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Building2 className="w-5 h-5" />
                              基本情報
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">法人ID</label>
                                  <p className="font-mono text-sm">{corp.id}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">法人名</label>
                                  <p className="font-medium">{corp.name}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">所在地</label>
                                  <p className="text-sm">{corp.location}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">担当者</label>
                                  <p className="text-sm">{corp.contact}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">電話番号</label>
                                  <p className="text-sm">{corp.phone}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">メールアドレス</label>
                                  <p className="text-sm">{corp.email}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">業種</label>
                                  <p className="text-sm">{corp.industry}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">プラン</label>
                                  <Badge variant={corp.plan === "プレミアム" ? "default" : "secondary"}>
                                    {corp.plan}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">登録日</label>
                                  <p className="text-sm">{corp.registeredAt}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">最終ログイン</label>
                                  <p className="text-sm">{corp.lastLogin}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">ステータス</label>
                                  <div>{getStatusBadge(corp.status)}</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 契約情報 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              契約・請求情報
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">契約ステータス</label>
                                  <div>{getStatusBadge(corp.contractStatus)}</div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">契約期間</label>
                                  <p className="text-sm">{corp.contractPeriod}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">支払方法</label>
                                  <p className="text-sm">{corp.paymentMethod}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">総収益</label>
                                  <p className="text-xl">¥{corp.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">展示スペース数</label>
                                  <p className="text-sm">{corp.spaces}箇所</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">展示履歴</label>
                                  <p className="text-sm">{corp.displayHistory}作品</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 現在展示中の作品 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Image className="w-5 h-5" />
                              現在展示中の作品 ({displayedArtworks.length}件)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {displayedArtworks.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                現在展示中の作品はありません
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {displayedArtworks.map((artwork) => (
                                  <div
                                    key={artwork.id}
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                                  >
                                    <img
                                      src={artwork.image}
                                      alt={artwork.title}
                                      className="w-24 h-24 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h3 className="font-medium">{artwork.title}</h3>
                                          <p className="text-sm text-gray-600">{artwork.artistName}</p>
                                        </div>
                                        {getStatusBadge(artwork.status)}
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                          <p className="text-xs text-gray-500">作品ID</p>
                                          <p className="font-mono text-xs">{artwork.id}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">サイズ</p>
                                          <p className="text-xs">{artwork.size}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">販売価格</p>
                                          <p className="text-xs">¥{artwork.salePrice.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">リース価格</p>
                                          <p className="text-xs">¥{artwork.leasePrice.toLocaleString()}/月</p>
                                        </div>
                                      </div>
                                      <div className="mt-2">
                                        <p className="text-xs text-gray-500">展示開始日: {artwork.displayedAt}</p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                                    >
                                      詳細
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {/* アーティスト管理 */}
          {activeSection === "artists" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">アーティスト管理</h1>
                  <p className="text-gray-600">登録アーティストの情報と契約状況</p>
                </div>
                <div className="flex gap-2">
                  {selectedArtist && (
                    <Button variant="outline" onClick={() => setSelectedArtist(null)}>
                      一覧に戻る
                    </Button>
                  )}
                  <Button>
                    <Palette className="w-4 h-4 mr-2" />
                    新規アーティスト追加
                  </Button>
                </div>
              </div>

              {!selectedArtist ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>アーティスト一覧</CardTitle>
                      <div className="flex gap-2">
                        <IDSearchInput
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="ID検索 (例: AR-00001) または名前"
                          className="w-80"
                        />
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[800px] px-4 sm:px-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>名前</TableHead>
                              <TableHead>住所</TableHead>
                              <TableHead>ジャンル</TableHead>
                              <TableHead>作品数</TableHead>
                              <TableHead>展示回数</TableHead>
                              <TableHead>契約形態</TableHead>
                              <TableHead>月次報酬</TableHead>
                              <TableHead>支払状況</TableHead>
                              <TableHead>アクション</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                        {mockArtists.map((artist) => (
                          <TableRow
                            key={artist.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedArtist(artist.id)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <IDDisplay type="artist" numericId={artist.id.replace('A', '')} size="sm" />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{artist.nameJa}</p>
                                <p className="text-xs text-gray-500">{artist.nameEn}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{artist.address}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {artist.genre.map((g, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {g}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{artist.artworks}点</TableCell>
                            <TableCell>{artist.displayCount}回</TableCell>
                            <TableCell>
                              <Badge variant={artist.contractType === "専属" ? "default" : "secondary"}>
                                {artist.contractType}
                              </Badge>
                            </TableCell>
                            <TableCell>¥{artist.monthlyRevenue.toLocaleString()}</TableCell>
                            <TableCell>
                              {artist.paymentStatus === "支払済み" ? (
                                <Badge className="bg-green-500 text-white">支払済み</Badge>
                              ) : (
                                <Badge className="bg-red-500 text-white">未払い</Badge>
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedArtist(artist.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {(() => {
                    const artist = mockArtists.find((a) => a.id === selectedArtist);
                    if (!artist) return null;

                    const artistArtworks = mockArtworks.filter(
                      (a) => a.artistId === artist.id
                    );

                    return (
                      <div className="space-y-6">
                        {/* 基本情報 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Palette className="w-5 h-5" />
                              プロフィール
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">アーティストID</label>
                                  <p className="font-mono text-sm">{artist.id}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">名前（日本語）</label>
                                  <p className="font-medium">{artist.nameJa}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">名前（英語）</label>
                                  <p className="text-sm">{artist.nameEn}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">住所</label>
                                  <p className="text-sm">{artist.address}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">SNS</label>
                                  <p className="text-sm text-primary">{artist.sns}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">ポートフォリオ</label>
                                  <a
                                    href={artist.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {artist.portfolio}
                                  </a>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">ジャンル・スタイル</label>
                                  <div className="flex gap-1 flex-wrap mt-1">
                                    {artist.genre.map((g, i) => (
                                      <Badge key={i} variant="secondary">
                                        {g}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">登録作品数</label>
                                  <p className="text-xl">{artist.artworks}点</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">累計展示回数</label>
                                  <p className="text-xl">{artist.displayCount}回</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">登録日</label>
                                  <p className="text-sm">{artist.registeredAt}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 契約・報酬情報 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              契約・報酬情報
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">契約形態</label>
                                  <div>
                                    <Badge variant={artist.contractType === "専属" ? "default" : "secondary"}>
                                      {artist.contractType}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">収益分配率</label>
                                  <p className="text-sm">{artist.revenueShare}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">価格レンジ</label>
                                  <p className="text-sm">{artist.priceRange}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">リース単価</label>
                                  <p className="text-sm">{artist.leasePrice}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">月次報酬</label>
                                  <p className="text-2xl text-green-600">
                                    ¥{artist.monthlyRevenue.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">支払状況</label>
                                  <div>
                                    {artist.paymentStatus === "支払済み" ? (
                                      <Badge className="bg-green-500 text-white">支払済み</Badge>
                                    ) : (
                                      <Badge className="bg-red-500 text-white">未払い</Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">税務ステータス</label>
                                  <p className="text-sm">{artist.taxStatus}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 権利・安全情報 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              権利・安全情報
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="text-xs text-gray-500">作品権利確認</label>
                                <div className="mt-1">
                                  {artist.rightsChecked ? (
                                    <Badge className="bg-green-500 text-white">確認済み</Badge>
                                  ) : (
                                    <Badge className="bg-red-500 text-white">未確認</Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500">同意書ファイル</label>
                                <Button variant="ghost" size="sm" className="mt-1 h-auto p-0">
                                  <FileText className="w-4 h-4 mr-1" />
                                  <span className="text-xs">{artist.agreementFile}</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* 登録作品一覧 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Image className="w-5 h-5" />
                              登録作品一覧 ({artistArtworks.length}点)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {artistArtworks.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                登録作品がありません
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {artistArtworks.map((artwork) => (
                                  <div
                                    key={artwork.id}
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                                  >
                                    <img
                                      src={artwork.image}
                                      alt={artwork.title}
                                      className="w-24 h-24 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h3 className="font-medium">{artwork.title}</h3>
                                          <p className="text-xs text-gray-500 font-mono">{artwork.id}</p>
                                        </div>
                                        <div className="flex gap-2">
                                          {getStatusBadge(artwork.status)}
                                          {getStatusBadge(artwork.condition)}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                        <div>
                                          <p className="text-xs text-gray-500">カテゴリ</p>
                                          <p className="text-xs">{artwork.category}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">サイズ</p>
                                          <p className="text-xs">{artwork.size}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">重量</p>
                                          <p className="text-xs">{artwork.weight}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">販売価格</p>
                                          <p className="text-xs">¥{artwork.salePrice.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">リース価格</p>
                                          <p className="text-xs">¥{artwork.leasePrice.toLocaleString()}/月</p>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex items-center gap-4 text-xs">
                                        {artwork.status === "展示中" && (
                                          <p className="text-gray-600">
                                            展示先: <span className="font-medium">{artwork.corporateName}</span>
                                          </p>
                                        )}
                                        {artwork.displayedAt !== "-" && (
                                          <p className="text-gray-600">
                                            展示開始: {artwork.displayedAt}
                                          </p>
                                        )}
                                        <p className="text-gray-600">
                                          梱包サイズ: {artwork.packageSize}
                                        </p>
                                        {artwork.insurance && (
                                          <Badge variant="outline" className="text-xs">保険適用</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                                    >
                                      詳細
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {/* 作品管理 */}
          {activeSection === "artworks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">作品管理</h1>
                  <p className="text-gray-600">登録作品の情報とステータス</p>
                </div>
                <Button>
                  <Image className="w-4 h-4 mr-2" />
                  新規作品追加
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>作品一覧</CardTitle>
                    <div className="flex gap-2">
                      <IDSearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="ID検索 (例: AW-00001) または作品名"
                        className="w-80"
                      />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全て</SelectItem>
                          <SelectItem value="展示中">展示中</SelectItem>
                          <SelectItem value="返却中">返却中</SelectItem>
                          <SelectItem value="点検中">点検中</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>作品名</TableHead>
                            <TableHead>アーティスト</TableHead>
                            <TableHead>サイズ</TableHead>
                            <TableHead>カテゴリ</TableHead>
                            <TableHead>販売価格</TableHead>
                            <TableHead>リース価格</TableHead>
                            <TableHead>展示先</TableHead>
                            <TableHead>状態</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>アクション</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {mockArtworks.map((artwork) => (
                        <TableRow key={artwork.id}>
                          <TableCell>
                            <IDDisplay type="artwork" numericId={artwork.id.replace('W', '')} size="sm" />
                          </TableCell>
                          <TableCell className="font-medium">{artwork.title}</TableCell>
                          <TableCell className="text-sm">{artwork.artistName}</TableCell>
                          <TableCell className="text-xs">{artwork.size}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{artwork.category}</Badge>
                          </TableCell>
                          <TableCell>¥{artwork.salePrice.toLocaleString()}</TableCell>
                          <TableCell>¥{artwork.leasePrice.toLocaleString()}/月</TableCell>
                          <TableCell className="text-sm">{artwork.corporateName}</TableCell>
                          <TableCell>{getStatusBadge(artwork.condition)}</TableCell>
                          <TableCell>{getStatusBadge(artwork.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/artwork/${artwork.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* スペース管理 */}
          {activeSection === "spaces" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">スペース管理</h1>
                  <p className="text-gray-600">展示スペースの情報と状況</p>
                </div>
                <div className="flex gap-2">
                  {selectedSpace && (
                    <Button variant="outline" onClick={() => setSelectedSpace(null)}>
                      一覧に戻る
                    </Button>
                  )}
                  <Button>
                    <MapPinned className="w-4 h-4 mr-2" />
                    新規スペース追加
                  </Button>
                </div>
              </div>

              {!selectedSpace ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>スペース一覧</CardTitle>
                      <div className="flex gap-2">
                        <IDSearchInput
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="ID検索 (例: SP-00001) またはスペース名"
                          className="w-80"
                        />
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[800px] px-4 sm:px-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>スペース名</TableHead>
                              <TableHead>法人名</TableHead>
                              <TableHead>所在地</TableHead>
                              <TableHead>タイプ</TableHead>
                              <TableHead>展示履歴</TableHead>
                              <TableHead>登録日</TableHead>
                              <TableHead>アクション</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                        {mockSpaces.map((space) => (
                          <TableRow
                            key={space.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedSpace(space.id)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <IDDisplay type="space" numericId={space.id.replace('S', '')} size="sm" />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{space.name}</p>
                                <p className="text-xs text-gray-500">{space.type}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{space.corporateName}</TableCell>
                            <TableCell className="text-sm max-w-xs truncate">
                              {space.location}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{space.type}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {space.displayHistory}件
                            </TableCell>
                            <TableCell className="text-sm">{space.registeredAt}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedSpace(space.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {(() => {
                    const space = mockSpaces.find((s) => s.id === selectedSpace);
                    if (!space) return null;

                    const displayedArtworks = mockArtworks.filter(
                      (a) => a.corporateName === space.corporateName && a.status === "展示中"
                    );

                    return (
                      <div className="space-y-6">
                        {/* 基本情報 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <MapPinned className="w-5 h-5" />
                              スペース基本情報
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">スペースID</label>
                                  <p className="font-mono text-sm">{space.id}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">スペース名</label>
                                  <p className="font-medium">{space.name}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">タイプ</label>
                                  <div>
                                    <Badge variant="secondary">{space.type}</Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs text-gray-500">法人名</label>
                                  <p className="text-sm">{space.corporateName}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">所在地</label>
                                  <p className="text-sm">{space.location}</p>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">登録日</label>
                                  <p className="text-sm">{space.registeredAt}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* スペース写真 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Image className="w-5 h-5" />
                              スペース写真
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {space.images.map((img, index) => (
                                <div
                                  key={index}
                                  className="aspect-video rounded-lg overflow-hidden border border-gray-200"
                                >
                                  <img
                                    src={img}
                                    alt={`${space.name} - ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* 展示統計 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="w-5 h-5" />
                              展示統計
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="text-center p-4 border border-gray-200 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">現在展示中</p>
                                <p className="text-3xl text-green-600">{space.currentDisplayed}</p>
                              </div>
                              <div className="text-center p-4 border border-gray-200 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">展示履歴</p>
                                <p className="text-3xl text-gray-900">{space.displayHistory}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* QRコード管理 */}
                        <QRCodeManager
                          spaceId={space.id}
                          spaceName={space.name}
                          currentArtworkId={displayedArtworks[0]?.id}
                          currentArtworkTitle={displayedArtworks[0]?.title}
                          qrCodeUrl={`${window.location.origin}/artwork/${displayedArtworks[0]?.id || "1"}?source=qr`}
                        />

                        {/* 現在展示中の作品 */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Image className="w-5 h-5" />
                              現在展示中の作品 ({displayedArtworks.length}件)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {displayedArtworks.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                現在展示中の作品はありません
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {displayedArtworks.slice(0, space.currentDisplayed).map((artwork) => (
                                  <div
                                    key={artwork.id}
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors cursor-pointer"
                                    onClick={() => navigate(`/artwork/${artwork.id}`)}
                                  >
                                    <img
                                      src={artwork.image}
                                      alt={artwork.title}
                                      className="w-24 h-24 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h3 className="font-medium">{artwork.title}</h3>
                                          <p className="text-sm text-gray-600">{artwork.artistName}</p>
                                        </div>
                                        {getStatusBadge(artwork.status)}
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                          <p className="text-xs text-gray-500">作品ID</p>
                                          <p className="font-mono text-xs">{artwork.id}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">サイズ</p>
                                          <p className="text-xs">{artwork.size}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">販売価格</p>
                                          <p className="text-xs">¥{artwork.salePrice.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">展示開始日</p>
                                          <p className="text-xs">{artwork.displayedAt}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {/* 展示管理 */}
          {activeSection === "displays" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">展示管理</h1>
                <p className="text-gray-600">各法人の展示マップとスケジュール</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>法人別展示状況</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCorporates.map((corp) => (
                    <div
                      key={corp.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{corp.name}</h3>
                          <p className="text-xs text-gray-500">{corp.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">展示率</p>
                          <p className="text-xl text-gray-900">
                            {Math.round((corp.displayedArtworks / corp.spaces) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: corp.spaces }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-20 rounded border-2 flex items-center justify-center text-xs ${
                              i < corp.displayedArtworks
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-300 bg-gray-50 text-gray-500"
                            }`}
                          >
                            {i < corp.displayedArtworks ? `展示${i + 1}` : "空き"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 配送管理 */}
          {activeSection === "shipping" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">配送管理</h1>
                  <p className="text-gray-600">輸送状況と配送履歴</p>
                </div>
                <Button>
                  <Truck className="w-4 h-4 mr-2" />
                  新規配送手配
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>配送一覧</CardTitle>
                    <div className="flex gap-2">
                      <IDSearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="ID検索 (例: DL-00001) または追跡番号"
                        className="w-80"
                      />
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>配送ID</TableHead>
                            <TableHead>作品</TableHead>
                            <TableHead>種別</TableHead>
                            <TableHead>発送元</TableHead>
                            <TableHead>配送先</TableHead>
                            <TableHead>配送業者</TableHead>
                            <TableHead>追跡番号</TableHead>
                            <TableHead>配送予定日</TableHead>
                            <TableHead>送料</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>アクション</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {mockShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell>
                            <IDDisplay type="delivery" numericId={shipment.id.replace('D', '')} size="sm" />
                          </TableCell>
                          <TableCell className="font-medium">{shipment.artworkTitle}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                shipment.type === "新規配送"
                                  ? "default"
                                  : shipment.type === "返却"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {shipment.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{shipment.from}</TableCell>
                          <TableCell className="text-sm">{shipment.to}</TableCell>
                          <TableCell>{shipment.carrier}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {shipment.trackingNumber}
                          </TableCell>
                          <TableCell className="text-sm">{shipment.estimatedDelivery}</TableCell>
                          <TableCell>¥{shipment.shippingCost.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 取引管理 */}
          {activeSection === "transactions" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">取引管理</h1>
                <p className="text-gray-600">売上・リース料・報酬の管理</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">総取引額</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-gray-900">¥{mockDashboardStats.revenue.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">累計</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">MGJ手数料</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-green-600">
                      ¥{Math.round(mockDashboardStats.revenue.total * 0.2).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">20%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">アーティスト報酬</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-blue-600">
                      ¥{Math.round(mockDashboardStats.revenue.total * 0.8).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">80%</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>取引履歴</CardTitle>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全て</SelectItem>
                          <SelectItem value="売上">売上</SelectItem>
                          <SelectItem value="リース料">リース料</SelectItem>
                          <SelectItem value="送料">送料</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>取引ID</TableHead>
                            <TableHead>日付</TableHead>
                            <TableHead>種別</TableHead>
                            <TableHead>法人</TableHead>
                            <TableHead>アーティスト</TableHead>
                            <TableHead>作品</TableHead>
                            <TableHead>取引額</TableHead>
                            <TableHead>MGJ手数料</TableHead>
                            <TableHead>アーティスト収益</TableHead>
                            <TableHead>ステータス</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {mockTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                          <TableCell className="text-sm">{tx.date}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{tx.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{tx.corporateName}</TableCell>
                          <TableCell className="text-sm">{tx.artistName}</TableCell>
                          <TableCell className="text-sm">{tx.artworkTitle}</TableCell>
                          <TableCell>¥{tx.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-green-600">
                            ¥{tx.mgjFee.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-blue-600">
                            ¥{tx.artistRevenue.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        </TableRow>
                      ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 契約管理 */}
          {activeSection === "contracts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">契約管理</h1>
                  <p className="text-gray-600">利用規約と契約書の管理</p>
                </div>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  新規契約作成
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>契約一覧</CardTitle>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全て</SelectItem>
                          <SelectItem value="artist">アーティスト契約</SelectItem>
                          <SelectItem value="corporate">法人契約</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>契約ID</TableHead>
                            <TableHead>契約種別</TableHead>
                            <TableHead>契約者名</TableHead>
                            <TableHead>契約内容</TableHead>
                            <TableHead>署名日</TableHead>
                            <TableHead>収益分配率</TableHead>
                            <TableHead>商用利用区分</TableHead>
                            <TableHead>契約書</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>アクション</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {mockContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-mono text-xs">{contract.id}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                contract.type === "アーティスト契約" ? "default" : "secondary"
                              }
                            >
                              {contract.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{contract.partyName}</TableCell>
                          <TableCell className="text-sm">{contract.agreementType}</TableCell>
                          <TableCell className="text-sm">{contract.signedDate}</TableCell>
                          <TableCell>{contract.revenueShare}</TableCell>
                          <TableCell className="text-sm">{contract.commercialUse}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              {contract.document}
                            </Button>
                          </TableCell>
                          <TableCell>{getStatusBadge(contract.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 通報管理 */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">通報管理</h1>
                <p className="text-gray-600">不適切な作品の通報を管理</p>
              </div>

              {/* 統計サマリー */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">未対応</p>
                        <p className="text-3xl text-gray-900 mt-2">
                          {mockReports.filter(r => r.status === "未対応").length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">対応中</p>
                        <p className="text-3xl text-gray-900 mt-2">
                          {mockReports.filter(r => r.status === "対応中").length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">対応済み</p>
                        <p className="text-3xl text-gray-900 mt-2">
                          {mockReports.filter(r => r.status === "対応済み").length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">却下</p>
                        <p className="text-3xl text-gray-900 mt-2">
                          {mockReports.filter(r => r.status === "却下").length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 通報一覧 */}
              <Card>
                <CardHeader>
                  <CardTitle>通報一覧</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 検索・フィルター */}
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="作品名、アーティスト名で検索..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="ステータス" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">すべて</SelectItem>
                          <SelectItem value="pending">未対応</SelectItem>
                          <SelectItem value="in-progress">対応中</SelectItem>
                          <SelectItem value="resolved">対応済み</SelectItem>
                          <SelectItem value="rejected">却下</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* テーブル */}
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>通報ID</TableHead>
                            <TableHead>作品情報</TableHead>
                            <TableHead>通報理由</TableHead>
                            <TableHead>優先度</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>通報日時</TableHead>
                            <TableHead>アクション</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-mono text-sm">
                                {report.id}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{report.artworkTitle}</p>
                                  <p className="text-sm text-gray-600">{report.artistName}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{report.reason}</p>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {report.details}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    report.priority === "高"
                                      ? "bg-red-100 text-red-700"
                                      : report.priority === "中"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }
                                >
                                  {report.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    report.status === "未対応"
                                      ? "bg-red-100 text-red-700"
                                      : report.status === "対応中"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : report.status === "対応済み"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-700"
                                  }
                                >
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {report.reportedAt}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      console.log("通報詳細:", report.id);
                                      // ここで詳細モーダルを開く
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {report.status === "未対応" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-blue-600 hover:text-blue-700"
                                      onClick={() => {
                                        console.log("対応開始:", report.id);
                                      }}
                                    >
                                      対応開始
                                    </Button>
                                  )}
                                  {(report.status === "未対応" || report.status === "対応中") && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => {
                                        if (confirm("この作品を削除しますか？")) {
                                          console.log("作品削除:", report.artworkId);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* 対応ガイド */}
                    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-transparent">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                            <p><strong className="text-blue-700">通報対応の手順：</strong></p>
                            <ol className="list-decimal list-inside space-y-2 ml-4">
                              <li>通報内容を確認し、規約違反の有無を判断します</li>
                              <li>必要に応じて作品の詳細を確認し、追加調査を行います</li>
                              <li>規約違反が確認された場合、作品を削除します</li>
                              <li>アーティストに通知し、必要に応じてアカウント停止の措置を取ります</li>
                              <li>虚偽の通報と判断された場合は、却下します</li>
                            </ol>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* サポート管理 */}
          {activeSection === "support" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">サポート管理</h1>
                <p className="text-gray-600">通報・問い合わせ・トラブル対応</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">総報告数</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-gray-900">{mockSupport.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">対応中</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-orange-600">
                      {mockSupport.filter((s) => s.status === "対応中").length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">未対応</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-red-600">
                      {mockSupport.filter((s) => s.status === "受付").length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>サポート一覧</CardTitle>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全て</SelectItem>
                          <SelectItem value="受付">受付</SelectItem>
                          <SelectItem value="対応中">対応中</SelectItem>
                          <SelectItem value="完了">完了</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>種別</TableHead>
                            <TableHead>報告者</TableHead>
                            <TableHead>作品</TableHead>
                            <TableHead>内容</TableHead>
                            <TableHead>優先度</TableHead>
                            <TableHead>担当者</TableHead>
                            <TableHead>作成日</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>アクション</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {mockSupport.map((support) => (
                        <TableRow key={support.id}>
                          <TableCell className="font-mono text-xs">{support.id}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                support.type === "破損報告"
                                  ? "destructive"
                                  : support.type === "著作権報告"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {support.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{support.reportedBy}</TableCell>
                          <TableCell className="text-sm">{support.artworkTitle}</TableCell>
                          <TableCell className="text-sm max-w-xs truncate">
                            {support.content}
                          </TableCell>
                          <TableCell>{getPriorityBadge(support.priority)}</TableCell>
                          <TableCell className="text-sm">{support.assignedTo}</TableCell>
                          <TableCell className="text-sm">{support.createdAt}</TableCell>
                          <TableCell>{getStatusBadge(support.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 権限管理 */}
          {activeSection === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">権限管理</h1>
                  <p className="text-gray-600">管理者・スタッフアカウントの管理</p>
                </div>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  新規ユーザー追加
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>ユーザー一覧</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>名前</TableHead>
                            <TableHead>メール</TableHead>
                            <TableHead>役割</TableHead>
                            <TableHead>権限</TableHead>
                            <TableHead>最終ログイン</TableHead>
                            <TableHead>二段階認証</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>アクション</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {mockUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "管理者"
                                  ? "default"
                                  : user.role === "スタッフ"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {user.permissions.map((perm, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{user.lastLogin}</TableCell>
                          <TableCell>
                            {user.twoFactorEnabled ? (
                              <Badge className="bg-green-500 text-white">有効</Badge>
                            ) : (
                              <Badge variant="secondary">無効</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* アナリティクス */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">アナリティクス</h1>
                <p className="text-gray-600">データ分析とビジネスインサイト</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">平均リース期間</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-gray-900">4.2ヶ月</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">再リース率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-green-600">68%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">平均展示率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-blue-600">82%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-600">満足度スコア</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl text-purple-600">4.7/5.0</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>人気ジャンル</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">抽象画</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "85%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">写真</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "72%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">72%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ミニマル</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "68%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">68%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">風景</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: "54%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">54%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>都道府県別展示分布</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">東京都</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">65%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">大阪府</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">18%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">神奈川県</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "12%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">12%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">その他</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 rounded-full" style={{ width: "5%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>月次売上推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {[320000, 380000, 420000, 450000, 410000, 456000].map((amount, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${(amount / 500000) * 100}%` }}
                        ></div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">{i + 5}月</p>
                          <p className="text-xs text-gray-900">¥{(amount / 1000).toFixed(0)}k</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 設定 */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">システム設定</h1>
                <p className="text-gray-600">MGJプラットフォームの各種設定</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>基本設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">消費税率</label>
                      <Input defaultValue="10%" disabled className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">MGJ手数料レート</label>
                      <Input defaultValue="20%" disabled className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">送料負担ルール</label>
                    <Input
                      defaultValue="リース期間6ヶ月以上: アーティスト負担 / 6ヶ月未満: 法人負担"
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">言語</label>
                      <Select defaultValue="ja">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">通貨</label>
                      <Select defaultValue="JPY">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API連携設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Stripe API Key</label>
                    <Input
                      type="password"
                      defaultValue="sk_test_xxxxxxxxxxxxxxxxxxxx"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Ship&co API Key</label>
                    <Input
                      type="password"
                      defaultValue="shipco_xxxxxxxxxxxxxxxxxxxx"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">AWS S3 Bucket</label>
                    <Input defaultValue="mgj-artworks-storage" className="mt-1 font-mono" />
                  </div>
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    設定を保存
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>通知設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">通知チャンネル</label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">メール通知</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Slack連携</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">LINE通知</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Slack Webhook URL</label>
                    <Input
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      defaultValue=""
                      className="mt-1 font-mono"
                    />
                  </div>
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    設定を保存
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
