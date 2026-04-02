import { motion } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import { getFavoritesKey } from "@/lib/storageKeys";
import { fetchFavorites, removeFavorite as removeCorporateFavorite, type FavoriteArtwork, } from "@/services/corporateFavorites.service";
import { artworkService } from "@/services/artwork.service";
interface DisplayArtwork {
    id: string;
    title: string;
    artist: string;
    size: string;
    price: number;
    image: string;
    status: string;
}
function mapFavoriteToDisplay(f: FavoriteArtwork): DisplayArtwork {
    return {
        id: f.id,
        title: f.title ?? "—",
        artist: f.artist_name ?? "—",
        size: f.size ?? "",
        price: f.price ?? 0,
        image: f.main_image_url ?? "",
        status: f.status ?? "",
    };
}
export function FavoritesPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isInitialized, userType } = useAuth();
    const [artworks, setArtworks] = useState<DisplayArtwork[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!isInitialized)
            return;
        if (!isAuthenticated) {
            const fullUrl = window.location.hash || window.location.pathname + window.location.search;
            const redirectUrl = fullUrl.startsWith("#") ? fullUrl.slice(1) : fullUrl;
            localStorage.setItem("mgj_redirect_after_login", redirectUrl);
            navigate("/login-selection");
        }
    }, [isAuthenticated, isInitialized, navigate]);
    const loadFavorites = useCallback(async () => {
        if (!isAuthenticated)
            return;
        setLoading(true);
        try {
            if (userType === "corporate") {
                const items = await fetchFavorites();
                setArtworks(items.map(mapFavoriteToDisplay));
            }
            else {
                const storageKey = getFavoritesKey(userType);
                const ids = JSON.parse(localStorage.getItem(storageKey) || "[]") as string[];
                if (ids.length === 0) {
                    setArtworks([]);
                    return;
                }
                const resolved: DisplayArtwork[] = [];
                for (const id of ids) {
                    try {
                        const a = await artworkService.getArtwork(id);
                        resolved.push({
                            id: a.id,
                            title: a.title,
                            artist: a.artist ?? "",
                            size: a.size ?? "",
                            price: a.price ?? 0,
                            image: a.image ?? a.main_image_url ?? "",
                            status: a.status ?? "",
                        });
                    }
                    catch {
                    }
                }
                setArtworks(resolved);
            }
        }
        finally {
            setLoading(false);
        }
    }, [isAuthenticated, userType]);
    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            void loadFavorites();
        }
    }, [isInitialized, isAuthenticated, loadFavorites]);
    useEffect(() => {
        window.addEventListener("favoritesUpdated", loadFavorites);
        return () => window.removeEventListener("favoritesUpdated", loadFavorites);
    }, [loadFavorites]);
    const handleRemove = async (artworkId: string) => {
        setArtworks((prev) => prev.filter((a) => a.id !== artworkId));
        if (userType === "corporate") {
            await removeCorporateFavorite(artworkId);
        }
        else {
            const storageKey = getFavoritesKey(userType);
            const ids = (JSON.parse(localStorage.getItem(storageKey) || "[]") as string[]).filter((id) => id !== artworkId);
            localStorage.setItem(storageKey, JSON.stringify(ids));
            window.dispatchEvent(new Event("favoritesUpdated"));
        }
    };
    if (!isInitialized || !isAuthenticated)
        return null;
    return (<div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 sm:mb-8">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5"/>
            <span className="text-sm sm:text-base">戻る</span>
          </motion.button>

          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500"/>
              <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#222]">お気に入り</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              {loading
            ? "読み込み中..."
            : artworks.length > 0
                ? `${artworks.length}件の作品をお気に入りに登録しています`
                : "お気に入りの作品がありません"}
            </p>
          </motion.div>

          
          {loading && (<div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400"/>
            </div>)}

          
          {!loading && artworks.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {artworks.map((artwork, index) => (<motion.div key={artwork.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                    
                    <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => navigate(`/artwork/${artwork.id}`)}>
                      <ImageWithFallback src={artwork.image} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>

                      
                      {artwork.status === "rented" && (<Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-accent/90 text-white border-0 text-xs">
                          展示中
                        </Badge>)}

                      
                      <button onClick={(e) => {
                    e.stopPropagation();
                    void handleRemove(artwork.id);
                }} className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors group/heart" title="お気に入りから削除">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-red-500 text-red-500 group-hover/heart:scale-110 transition-transform"/>
                      </button>
                    </div>

                    
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg mb-1">{artwork.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{artwork.artist}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-500">{artwork.size}サイズ</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-base sm:text-lg">
                          ¥{artwork.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>))}
            </div>)}

          
          {!loading && artworks.length === 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 sm:py-20">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4"/>
              <h3 className="text-lg sm:text-xl text-gray-600 mb-2">お気に入りの作品がありません</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                作品ページでハートマークをクリックしてお気に入りに追加しましょう
              </p>
              <Button onClick={() => navigate("/artworks")} className="bg-primary hover:bg-primary/90">
                作品を探す
              </Button>
            </motion.div>)}
        </div>
      </div>

      <Footer />
    </div>);
}
