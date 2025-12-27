import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";

// Sample artwork data (実際はAPIから取得)
const SAMPLE_ARTWORKS = [
  { id: "WRK-001", title: "静寂の朝", artist: "田中 美咲", size: "M", dimensions: { width: 60, height: 45 }, price: 85000, technique: "油彩", dominantColor: "#7BA8C0", image: "https://images.unsplash.com/photo-1697257378991-b57497dddc69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMGdhbGxlcnl8ZW58MXx8fHwxNzYzNDUzMDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", status: "available" },
  { id: "WRK-002", title: "都市の記憶", artist: "佐藤 健太", size: "L", dimensions: { width: 90, height: 65 }, price: 120000, technique: "アクリル", dominantColor: "#2C2C2C", image: "https://images.unsplash.com/photo-1706811833540-2a1054cddafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcnQlMjBwYWludGluZ3xlbnwxfHx8fDE3NjM0NzE2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", status: "available" },
  { id: "WRK-003", title: "風の詩", artist: "山本 彩花", size: "S", dimensions: { width: 30, height: 40 }, price: 45000, technique: "インク", dominantColor: "#D4B896", image: "https://images.unsplash.com/photo-1683659635051-39336c5476b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0fGVufDF8fHx8MTc2MzQ0OTkzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", status: "rented" },
  { id: "WRK-004", title: "時の流れ", artist: "鈴木 隆", size: "XL", dimensions: { width: 130, height: 97 }, price: 180000, technique: "油彩", dominantColor: "#C86F56", image: "https://images.unsplash.com/photo-1522878308970-972ec5eedc0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnR8ZW58MXx8fHwxNzYzNDQ4MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", status: "available" },
];

export function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteArtworks, setFavoriteArtworks] = useState<typeof SAMPLE_ARTWORKS>([]);

  // ログインチェック
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login-selection");
    }
  }, [isAuthenticated, navigate]);

  // お気に入り一覧を取得
  useEffect(() => {
    if (isAuthenticated) {
      const favorites = JSON.parse(localStorage.getItem("mgj_customer_favorites") || "[]");
      setFavoriteIds(favorites);
      
      // お気に入りIDに該当する作品を取得
      const artworks = SAMPLE_ARTWORKS.filter(artwork => favorites.includes(artwork.id));
      setFavoriteArtworks(artworks);
    }
  }, [isAuthenticated]);

  const handleRemove = (artworkId: string) => {
    const updatedFavorites = favoriteIds.filter(id => id !== artworkId);
    setFavoriteIds(updatedFavorites);
    localStorage.setItem("mgj_customer_favorites", JSON.stringify(updatedFavorites));
    
    // 画面を更新
    window.dispatchEvent(new Event("favoritesUpdated"));
    // 作品リストを更新
    const artworks = SAMPLE_ARTWORKS.filter(artwork => updatedFavorites.includes(artwork.id));
    setFavoriteArtworks(artworks);
  };

  const handlePurchase = (artworkId: string) => {
    navigate(`/purchase/${artworkId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30">
      <Header />
      
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">戻る</span>
          </motion.button>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#222]">お気に入り</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              {favoriteArtworks.length > 0
                ? `${favoriteArtworks.length}件の作品をお気に入りに登録しています`
                : "お気に入りの作品がありません"}
            </p>
          </motion.div>

          {/* Favorites Grid */}
          {favoriteArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {favoriteArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <div 
                      className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                    >
                      <ImageWithFallback
                        src={artwork.image}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Status Badge */}
                      {artwork.status === "rented" && (
                        <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-accent/90 text-white border-0 text-xs">
                          展示中
                        </Badge>
                      )}
                      
                      {/* Remove Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(artwork.id);
                        }}
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors group/heart"
                        title="お気に入りから削除"
                      >
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-red-500 text-red-500 group-hover/heart:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg mb-1">{artwork.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{artwork.artist}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-500">
                          {artwork.technique} / {artwork.size}サイズ
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-base sm:text-lg">
                          ¥{artwork.price.toLocaleString()}
                        </span>
                        {artwork.status === "available" && (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(artwork.id)}
                            className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                          >
                            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            購入
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 sm:py-20"
            >
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl text-gray-600 mb-2">お気に入りの作品がありません</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">作品ページでハートマークをクリックしてお気に入りに追加しましょう</p>
              <Button
                onClick={() => navigate("/artworks")}
                className="bg-primary hover:bg-primary/90"
              >
                作品を探す
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}



