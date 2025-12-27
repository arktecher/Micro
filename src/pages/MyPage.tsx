import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Heart, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

// モックデータ
const mockUser = {
  name: "山田 太郎",
  email: "yamada@example.com"
};

const mockShippingAddress = {
  name: "山田 太郎",
  postalCode: "150-0001",
  prefecture: "東京都",
  city: "渋谷区",
  address: "神宮前1-2-3",
  building: "青山ビル 4F",
  phone: "090-1234-5678"
};

const mockPaymentMethod = {
  brand: "Visa",
  last4: "4242",
  expiry: "12/25"
};

const mockPurchasedArtworks = [
  {
    id: "WRK-001",
    title: "静寂の風景",
    artist: "山田太郎",
    price: 280000,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop",
    purchaseDate: "2024-01-15"
  },
  {
    id: "WRK-002",
    title: "都市の記憶",
    artist: "佐藤花子",
    price: 180000,
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=800&fit=crop",
    purchaseDate: "2024-01-10"
  }
];

const mockFavoriteArtworks = [
  {
    id: "WRK-003",
    title: "朝の光",
    artist: "鈴木一郎",
    price: 320000,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-004",
    title: "夕暮れの色彩",
    artist: "田中美咲",
    price: 250000,
    image: "https://images.unsplash.com/photo-1578926078554-a6a48211eef3?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-005",
    title: "抽象的な夢",
    artist: "高橋健太",
    price: 420000,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-006",
    title: "静寂のブルー",
    artist: "伊藤さくら",
    price: 380000,
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=800&fit=crop"
  }
];

const mockRecommendedArtworks = [
  {
    id: "WRK-007",
    title: "Ethereal Dreams",
    artist: "渡辺優子",
    price: 290000,
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-008",
    title: "Urban Rhythm",
    artist: "中村大輔",
    price: 340000,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-009",
    title: "Serenity",
    artist: "小林愛",
    price: 410000,
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-010",
    title: "Golden Hour",
    artist: "加藤誠",
    price: 360000,
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-011",
    title: "Midnight Blue",
    artist: "木村梨花",
    price: 280000,
    image: "https://images.unsplash.com/photo-1578926078554-a6a48211eef3?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-012",
    title: "Crimson Tide",
    artist: "斎藤隆",
    price: 390000,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-013",
    title: "Whispers",
    artist: "松本美穂",
    price: 310000,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop"
  },
  {
    id: "WRK-014",
    title: "Harmony",
    artist: "山本健",
    price: 350000,
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=800&fit=crop"
  }
];

// 作品カードコンポーネント
function ArtworkCard({ artwork, showDate = false, onRemoveFavorite }: { artwork: any; showDate?: boolean; onRemoveFavorite?: (id: string) => void }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/artwork/${artwork.id}`)}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={artwork.image}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* お気に入り削除ボタン */}
          {onRemoveFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite(artwork.id);
              }}
              className="absolute top-2 right-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md z-10"
            >
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            </button>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-sm text-[#222] line-clamp-1">{artwork.title}</h3>
          <p className="text-xs text-gray-500">{artwork.artist}</p>
          <div className="flex items-center justify-between pt-1">
            <p className="text-sm text-[#222]">¥{artwork.price.toLocaleString()}</p>
            {showDate && artwork.purchaseDate && (
              <p className="text-xs text-gray-400">{artwork.purchaseDate}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// カスタムカルーセルコンポーネント
function RecommendedCarousel({ artworks }: { artworks: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, artworks.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="relative group">
      {/* 左矢印 */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      )}

      {/* カルーセルコンテンツ */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{
            x: `calc(-${currentIndex * (100 / itemsPerPage)}% - ${currentIndex * 1.5}rem)`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {artworks.map((artwork) => (
            <div key={artwork.id} className="flex-shrink-0" style={{ width: `calc(25% - 1.125rem)` }}>
              <ArtworkCard artwork={artwork} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* 右矢印 */}
      {currentIndex < maxIndex && (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      )}
    </div>
  );
}

export function MyPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const [profileData, setProfileData] = useState(mockUser);
  const [shippingData, setShippingData] = useState(mockShippingAddress);
  const [favoriteArtworks, setFavoriteArtworks] = useState(mockFavoriteArtworks);
  const location = useLocation();

  // 認証チェック：未ログインまたは購入者以外はリダイレクト
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login/customer");
      return;
    }
    
    if (userType !== "customer") {
      toast.error("このページは購入者専用です");
      navigate("/");
      return;
    }
  }, [isAuthenticated, userType, navigate]);

  // URLハッシュが #favorites の場合、お気に入りタブをアクティブにする
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === "favorites") {
      setActiveTab("favorites");
    } else if (hash === "orders" || hash === "purchases") {
      setActiveTab("purchases");
    } else if (hash === "payment") {
      setActiveTab("payment");
    } else if (hash === "settings" || hash === "profile") {
      setActiveTab("profile");
    }
    
    window.scrollTo(0, 0);
  }, [location]);

  // お気に入りから削除
  const handleRemoveFavorite = (id: string) => {
    setFavoriteArtworks(favoriteArtworks.filter((artwork) => artwork.id !== id));
    toast.success("お気に入りから削除しました");
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12 max-w-[1040px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 h-10 sm:h-12 bg-gray-100/50 p-1 overflow-x-auto">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white text-xs sm:text-sm">
              プロフィール
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-white text-xs sm:text-sm">
              支払い方法
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-white text-xs sm:text-sm">
              お気に入り
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-white text-xs sm:text-sm">
              購入履歴
            </TabsTrigger>
          </TabsList>

          {/* タブ1: プロフィール（名前 + 郵送先） */}
          <TabsContent value="profile" className="space-y-6 sm:space-y-8">
            <Card className="p-4 sm:p-8 rounded-lg shadow-sm border border-gray-200/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C]" />
                <h2 className="text-lg sm:text-xl text-[#222]">基本情報</h2>
              </div>
              <Separator className="mb-4 sm:mb-6 bg-gray-200/50" />
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="name" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      名前
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      メールアドレス
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="h-10 sm:h-11 bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#222] hover:bg-[#333] text-white px-6 sm:px-8 text-sm sm:text-base">
                    保存
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-8 rounded-lg shadow-sm border border-gray-200/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C]" />
                <h2 className="text-lg sm:text-xl text-[#222]">郵送先</h2>
              </div>
              <Separator className="mb-4 sm:mb-6 bg-gray-200/50" />
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="shipping-name" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      氏名
                    </Label>
                    <Input
                      id="shipping-name"
                      value={shippingData.name}
                      onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
                      className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      電話番号
                    </Label>
                    <Input
                      id="phone"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postal-code" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      郵便番号
                    </Label>
                    <Input
                      id="postal-code"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                      className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prefecture" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      都道府県
                    </Label>
                    <Input
                      id="prefecture"
                      value={shippingData.prefecture}
                      onChange={(e) => setShippingData({ ...shippingData, prefecture: e.target.value })}
                      className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      市区町村
                    </Label>
                    <Input
                      id="city"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                      番地
                    </Label>
                    <Input
                      id="address"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="building" className="text-xs sm:text-sm text-gray-700 mb-2 block">
                    建物名・部屋番号
                  </Label>
                  <Input
                    id="building"
                    value={shippingData.building}
                    onChange={(e) => setShippingData({ ...shippingData, building: e.target.value })}
                    className="h-10 sm:h-11 bg-[#F5F5F5] border-gray-200 focus:border-[#C6A05C] transition-all"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#222] hover:bg-[#333] text-white px-6 sm:px-8 text-sm sm:text-base">
                    更新する
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* タブ2: 支払い方法 */}
          <TabsContent value="payment">
            <Card className="p-4 sm:p-8 rounded-lg shadow-sm border border-gray-200/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C]" />
                <h2 className="text-lg sm:text-xl text-[#222]">支払い方法</h2>
              </div>
              <Separator className="mb-4 sm:mb-6 bg-gray-200/50" />
              
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg text-white shadow-lg">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70">Credit Card</div>
                    <div className="text-xs sm:text-sm opacity-90">{mockPaymentMethod.brand}</div>
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <div className="text-lg sm:text-xl tracking-widest">
                      •••• •••• •••• {mockPaymentMethod.last4}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] sm:text-xs opacity-70 mb-1">VALID THRU</div>
                      <div className="text-xs sm:text-sm">{mockPaymentMethod.expiry}</div>
                    </div>
                    <div className="text-[10px] sm:text-xs uppercase opacity-70">
                      {mockUser.name}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-sm sm:text-base">
                    カードを追加する
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* タブ3: お気に入り（お気に入り + おすすめ） */}
          <TabsContent value="favorites" className="space-y-8 sm:space-y-12">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C]" />
                <h2 className="text-xl sm:text-2xl text-[#222]">お気に入りの作品</h2>
              </div>
              
              {favoriteArtworks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {favoriteArtworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} onRemoveFavorite={handleRemoveFavorite} />
                  ))}
                </div>
              ) : (
                <Card className="p-12 sm:p-16 rounded-lg shadow-sm border border-gray-200/50">
                  <div className="text-center space-y-4">
                    <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto" />
                    <p className="text-xs sm:text-sm text-gray-500">お気に入りの作品がありません</p>
                  </div>
                </Card>
              )}
            </div>

            <div>
              <div className="space-y-2 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C]" />
                  <h2 className="text-xl sm:text-2xl text-[#222]">あなたへのおすすめ</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 pl-6 sm:pl-8">お気に入りの作品に基づいてAIが提案します</p>
              </div>
              
              <RecommendedCarousel artworks={mockRecommendedArtworks} />
            </div>
          </TabsContent>

          {/* タブ4: 購入履歴 */}
          <TabsContent value="purchases">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A05C]" />
              <h2 className="text-xl sm:text-2xl text-[#222]">購入した作品</h2>
            </div>
            
            {mockPurchasedArtworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {mockPurchasedArtworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} showDate={true} />
                ))}
              </div>
            ) : (
              <Card className="p-12 sm:p-16 rounded-lg shadow-sm border border-gray-200/50">
                <div className="text-center space-y-4">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto" />
                  <p className="text-xs sm:text-sm text-gray-500">まだ購入した作品はありません</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}



