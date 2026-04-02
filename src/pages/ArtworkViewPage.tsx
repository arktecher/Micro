import { toast } from "sonner";
import { Heart, ShoppingCart, Share2, MessageCircle, ChevronLeft, ChevronRight, X, Expand, Info, Package, Truck, Shield, Calendar, ZoomIn, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { SignupPromptDialog } from "@/components/common/SignupPromptDialog";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getFavoritesKey } from "@/lib/storageKeys";
import { toggleFavorite } from "@/services/corporateFavorites.service";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { SpaceSelectionModal } from "@/components/common/SpaceSelectionModal";
import { artworkService, type Artwork } from "@/services/artwork.service";
function buildImageUrls(a: Artwork): string[] {
    if (a.images && a.images.length > 0) {
        return [...a.images]
            .sort((x, y) => x.image_order - y.image_order)
            .map((i) => i.image_url);
    }
    if (a.main_image_url)
        return [a.main_image_url];
    return [];
}
interface RecommendationArtworkItem {
    id: string;
    title: string;
    artist: string;
    price: number;
    image: string;
}
function mapArtworkToRecommendationItem(a: Artwork): RecommendationArtworkItem {
    return {
        id: a.id,
        title: a.title,
        artist: a.artist?.name ?? "—",
        price: Number(a.price),
        image: a.main_image_url || "",
    };
}
async function fetchSimilarStyledWorks(artwork: Artwork, currentId: string, excludeIds: Set<string>): Promise<RecommendationArtworkItem[]> {
    const mapOther = (items: Artwork[]) => items
        .filter((a) => a.id !== currentId && !excludeIds.has(a.id))
        .slice(0, 12)
        .map(mapArtworkToRecommendationItem);
    const tryList = async (extra: Omit<NonNullable<Parameters<typeof artworkService.listArtworks>[0]>, "page" | "page_size" | "status">) => {
        const res = await artworkService.listArtworks({
            ...extra,
            status: "published",
            page: 1,
            page_size: 28,
        });
        const out = mapOther(res.items);
        return out.length > 0 ? out : null;
    };
    const styleTags = (artwork.style_tags ?? []).filter(Boolean);
    if (styleTags.length > 0) {
        const r = await tryList({
            style_tags: styleTags,
            sort_by: "favorite_count",
            sort_order: "desc",
        });
        if (r)
            return r;
    }
    const dc = artwork.dominant_color?.trim();
    if (dc) {
        const r = await tryList({
            dominant_color: [dc],
            sort_by: "favorite_count",
            sort_order: "desc",
        });
        if (r)
            return r;
    }
    const med = artwork.medium?.trim();
    if (med) {
        const r = await tryList({
            medium: [med],
            sort_by: "favorite_count",
            sort_order: "desc",
        });
        if (r)
            return r;
    }
    const res = await artworkService.listArtworks({
        status: "published",
        page: 1,
        page_size: 28,
        sort_by: "favorite_count",
        sort_order: "desc",
    });
    return mapOther(res.items);
}
export function ArtworkViewPage() {
    const { artworkId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, userType } = useAuth();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [artworkLoading, setArtworkLoading] = useState(true);
    const [artworkError, setArtworkError] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [signupPromptMode, setSignupPromptMode] = useState<"favorite" | "purchase">("favorite");
    const [showSpaceSelectionModal, setShowSpaceSelectionModal] = useState(false);
    const [relatedByArtist, setRelatedByArtist] = useState<RecommendationArtworkItem[]>([]);
    const [similarByStyle, setSimilarByStyle] = useState<RecommendationArtworkItem[]>([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const isCorporateUser = userType === "corporate";
    const isArtistUser = userType === "artist";
    const isFromQR = searchParams.get("source") === "qr";
    useEffect(() => {
        window.scrollTo(0, 0);
        const storageKey = getFavoritesKey(userType);
        const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setIsLiked(favorites.includes(artworkId));
    }, [artworkId, userType]);
    useEffect(() => {
        if (!artworkId) {
            setArtwork(null);
            setArtworkLoading(false);
            setArtworkError("作品IDが無効です");
            return;
        }
        let cancelled = false;
        setArtworkLoading(true);
        setArtworkError(null);
        artworkService
            .getArtwork(artworkId)
            .then((data) => {
            if (cancelled)
                return;
            setArtwork(data);
            const urls = buildImageUrls(data);
            setImageUrls(urls);
            const first = urls[0] || data.main_image_url || "";
            setSelectedImage(first);
            setCurrentImageIndex(0);
        })
            .catch((err: unknown) => {
            if (cancelled)
                return;
            const msg = err instanceof Error ? err.message : "作品を読み込めませんでした";
            setArtworkError(msg);
            setArtwork(null);
            setImageUrls([]);
        })
            .finally(() => {
            if (!cancelled)
                setArtworkLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [artworkId]);
    useEffect(() => {
        if (!artwork?.id || !artwork.artist_id) {
            setRelatedByArtist([]);
            setSimilarByStyle([]);
            return;
        }
        const currentId = artwork.id;
        const artistId = artwork.artist_id;
        let cancelled = false;
        setRecommendationsLoading(true);
        (async () => {
            try {
                const resArtist = await artworkService.listArtworks({
                    artist_id: artistId,
                    status: "published",
                    page: 1,
                    page_size: 24,
                    sort_by: "published_at",
                    sort_order: "desc",
                });
                if (cancelled)
                    return;
                const relatedList = resArtist.items
                    .filter((a) => a.id !== currentId)
                    .slice(0, 12)
                    .map(mapArtworkToRecommendationItem);
                setRelatedByArtist(relatedList);
                const excludeFromSimilar = new Set(relatedList.map((r) => r.id));
                let similar = await fetchSimilarStyledWorks(artwork, currentId, excludeFromSimilar);
                if (cancelled)
                    return;
                if (similar.length === 0 && excludeFromSimilar.size > 0) {
                    similar = await fetchSimilarStyledWorks(artwork, currentId, new Set());
                }
                if (cancelled)
                    return;
                setSimilarByStyle(similar);
            }
            catch {
                if (!cancelled) {
                    setRelatedByArtist([]);
                    setSimilarByStyle([]);
                }
            }
            finally {
                if (!cancelled)
                    setRecommendationsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [artwork]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showLightbox) {
                if (e.key === 'Escape') {
                    setShowLightbox(false);
                }
                else if (e.key === 'ArrowLeft') {
                    handlePrevImage();
                }
                else if (e.key === 'ArrowRight') {
                    handleNextImage();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showLightbox, currentImageIndex]);
    const handleThumbnailClick = (image: string, index: number) => {
        setSelectedImage(image);
        setCurrentImageIndex(index);
    };
    const handlePurchase = () => {
        if (!isAuthenticated) {
            setShowSignupPrompt(true);
            setSignupPromptMode("purchase");
            return;
        }
        if (isCorporateUser) {
            navigate(`/display/${artworkId}`);
        }
        else {
            navigate(`/purchase/${artworkId}`, {
                state: { from: `/artwork/${artworkId}` }
            });
        }
    };
    const handleLeaseInquiry = () => {
        console.log("リース見積もり依頼");
    };
    const handleArtworkClick = (id: string) => {
        navigate(`/artwork/${id}?source=site`);
    };
    const handlePrevImage = () => {
        if (imageUrls.length === 0)
            return;
        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : imageUrls.length - 1;
        setCurrentImageIndex(newIndex);
        setSelectedImage(imageUrls[newIndex]);
    };
    const handleNextImage = () => {
        if (imageUrls.length === 0)
            return;
        const newIndex = currentImageIndex < imageUrls.length - 1 ? currentImageIndex + 1 : 0;
        setCurrentImageIndex(newIndex);
        setSelectedImage(imageUrls[newIndex]);
    };
    const handleShare = async () => {
        const artworkUrl = `${window.location.origin}/artwork/${artworkId}`;
        try {
            const textArea = document.createElement("textarea");
            textArea.value = artworkUrl;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                textArea.remove();
                if (successful) {
                    toast.success("リンクをコピーしました", {
                        description: "作品のURLがクリップボードにコピーされました",
                        duration: 3000,
                    });
                }
                else {
                    throw new Error("Copy command failed");
                }
            }
            catch (err) {
                textArea.remove();
                throw err;
            }
        }
        catch (err) {
            console.error("Failed to copy URL:", err);
            toast.error("コピーに失敗しました", {
                description: "もう一度お試しください",
                duration: 3000,
            });
        }
    };
    if (artworkLoading) {
        return (<div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col pt-20 sm:pt-24">
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pb-12 sm:pb-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary"/>
            <p className="text-sm text-gray-600">作品を読み込み中…</p>
          </div>
        </main>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>);
    }
    if (artworkError || !artwork) {
        return (<div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col pt-20 sm:pt-24">
          <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 pb-12 text-center sm:pb-20 max-w-lg">
            <p className="mb-2 text-lg text-gray-800">作品を表示できません</p>
            <p className="mb-6 text-sm text-gray-600">{artworkError}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              戻る
            </Button>
          </div>
        </main>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>);
    }
    const rawDim = artwork.dimensions || { width: 0, height: 0 };
    const dimW = Number(rawDim.width) || 0;
    const dimH = Number(rawDim.height) || 0;
    const artistName = artwork.artist?.name || "—";
    return (<div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="min-h-0 flex-1 pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-[1600px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col lg:flex-row gap-6 sm:gap-12 mb-12 sm:mb-20">
            
            <div className="hidden lg:block w-32 flex-shrink-0">
              <div className="sticky top-24 space-y-3">
                {(imageUrls.length ? imageUrls : [artwork.main_image_url || ""]).map((thumb, index) => (<button key={index} onClick={() => handleThumbnailClick(thumb, index)} className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                ? "border-primary shadow-md scale-105"
                : "border-gray-200 hover:border-gray-300"}`}>
                    <ImageWithFallback src={thumb} alt={`View ${index + 1}`} className="w-full h-full object-cover"/>
                  </button>))}
              </div>
            </div>

            
            <div className="flex-1 max-w-3xl order-2 lg:order-1">
              <div className="relative group">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl cursor-zoom-in" onClick={() => setShowLightbox(true)}>
                  <ImageWithFallback src={selectedImage} alt={artwork.title} className="w-full h-full object-cover"/>
                  
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700"/>
                  </div>
                </div>
              </div>

              
              <div className="lg:hidden mt-4 flex gap-2 overflow-x-auto pb-2">
                {(imageUrls.length ? imageUrls : [artwork.main_image_url || ""]).map((thumb, index) => (<button key={index} onClick={() => handleThumbnailClick(thumb, index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                ? "border-primary shadow-md"
                : "border-gray-200"}`}>
                    <ImageWithFallback src={thumb} alt={`View ${index + 1}`} className="w-full h-full object-cover"/>
                  </button>))}
              </div>
            </div>

            
            <div className="w-full lg:w-[380px] flex-shrink-0 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <Card className="border-gray-200 shadow-lg">
                  <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <h1 className="text-2xl sm:text-3xl text-primary">{artwork.title}</h1>
                      <button type="button" onClick={() => navigate(`/artists`)} className="text-base sm:text-lg text-gray-600 hover:text-primary transition-colors">
                        {artistName}
                      </button>
                    </div>

                    <Separator />

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">サイズ</span>
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          {artwork.size_class || "—"}
                        </Badge>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700">
                        {dimW} × {dimH} cm
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5 sm:space-y-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">技法・素材</span>
                      <p className="text-sm sm:text-base text-gray-700">
                        {[artwork.medium, artwork.support].filter(Boolean).join(" / ") || "—"}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5 sm:space-y-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block">額縁</span>
                      <p className="text-sm sm:text-base text-gray-700">{artwork.has_frame ? "あり" : "なし"}</p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5 sm:space-y-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">制作年</span>
                      <p className="text-sm sm:text-base text-gray-700">{artwork.year ?? "—"}</p>
                    </div>

                    <Separator />

                    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                      <div>
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block mb-1 sm:mb-2">販売価格</span>
                        <p className="text-2xl sm:text-3xl text-primary">
                          ¥{Number(artwork.price).toLocaleString("ja-JP")}
                        </p>
                      </div>
                    </div>

                    {!isArtistUser && (<>
                        <Separator />

                        <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                          <Button onClick={handlePurchase} size="lg" className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-sm sm:text-base">
                            {isAuthenticated && isCorporateUser
                ? "この作品を展示する"
                : "購入する"}
                          </Button>

                          {isCorporateUser && (<Button onClick={() => setShowSpaceSelectionModal(true)} size="lg" variant="outline" className="w-full h-11 sm:h-12 border-primary text-primary hover:bg-primary/5 text-sm sm:text-base">
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>
                              スペースでイメージを確認
                            </Button>)}
                        </div>
                      </>)}

                    <Separator />

                    <div className="flex items-center justify-around pt-1 sm:pt-2">
                      <button onClick={() => {
            if (!isAuthenticated) {
                setShowSignupPrompt(true);
                setSignupPromptMode("favorite");
            }
            else if (userType === "corporate") {
                const newIsLiked = !isLiked;
                setIsLiked(newIsLiked);
                toggleFavorite(artworkId, !newIsLiked)
                    .then(({ isFavorited }) => {
                    toast.success(isFavorited ? "お気に入りに追加しました" : "お気に入りから削除しました");
                })
                    .catch(() => {
                    setIsLiked(!newIsLiked);
                    toast.error("お気に入りの更新に失敗しました");
                });
            }
            else {
                const newIsLiked = !isLiked;
                setIsLiked(newIsLiked);
                const storageKey = getFavoritesKey(userType);
                const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]") as string[];
                if (newIsLiked) {
                    if (!favorites.includes(artworkId)) {
                        favorites.push(artworkId);
                        localStorage.setItem(storageKey, JSON.stringify(favorites));
                        toast.success("お気に入りに追加しました");
                    }
                }
                else {
                    const index = favorites.indexOf(artworkId);
                    if (index > -1) {
                        favorites.splice(index, 1);
                        localStorage.setItem(storageKey, JSON.stringify(favorites));
                        toast.success("お気に入りから削除しました");
                    }
                }
                window.dispatchEvent(new Event("favoritesUpdated"));
            }
        }} className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-500 transition-colors">
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}/>
                        <span className="text-[10px] sm:text-xs">お気に入り</span>
                      </button>
                      <button onClick={handleShare} className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5"/>
                        <span className="text-[10px] sm:text-xs">シェア</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-[1200px] space-y-16 sm:space-y-32">
          <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] text-gray-400 uppercase mb-3 sm:mb-4">About</p>
              <h2 className="text-2xl sm:text-3xl text-primary">作品について</h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              <div className="prose prose-sm sm:prose-lg max-w-none">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {artwork.description?.trim() || "説明は登録されていません。"}
                </p>
              </div>

              <Separator />

              <div className="prose prose-sm sm:prose-lg max-w-none">
                <h3 className="text-lg sm:text-xl text-primary mb-3 sm:mb-4">ストーリー</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {artwork.story?.trim() || "—"}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-[10px] sm:text-xs tracking-[0.4em] text-gray-400 uppercase mb-3 sm:mb-4">Artist</p>
              <h2 className="text-2xl sm:text-3xl text-primary">作家について</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden flex-shrink-0 shadow-lg mx-auto sm:mx-0 bg-gray-100">
                  <ImageWithFallback src={artwork.artist?.profile_image_url ||
            "https://images.unsplash.com/photo-1625682103688-2ab73a4fb11a?w=400"} alt={artistName} className="w-full h-full object-cover"/>
                </div>

                <div className="flex-1 space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl text-primary mb-1 sm:mb-2">{artistName}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      作家の詳細プロフィールは順次公開予定です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {recommendationsLoading ? (<div className="space-y-10 sm:space-y-14">
              <div className="h-48 animate-pulse rounded-xl bg-gray-100 sm:h-56"/>
              <div className="h-48 animate-pulse rounded-xl bg-gray-100 sm:h-56"/>
            </div>) : (<>
              {relatedByArtist.length > 0 && (<RecommendationSection title="同じ作家の作品" subtitle="Related Works" artworks={relatedByArtist} onArtworkClick={handleArtworkClick}/>)}

              {similarByStyle.length > 0 && (<RecommendationSection title="同じスタイルの作品" subtitle="Similar Taste" artworks={similarByStyle} onArtworkClick={handleArtworkClick}/>)}
            </>)}
        </div>
      </main>

      <div className="mt-auto shrink-0">
        <Footer />
      </div>

      {showLightbox && (<div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowLightbox(false)}>
          <button onClick={() => setShowLightbox(false)} className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white text-3xl sm:text-4xl hover:text-gray-300 transition-colors z-10">
            ×
          </button>

          <button onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
            }} className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10">
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
          </button>

          <button onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
            }} className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10">
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
          </button>

          <ImageWithFallback src={selectedImage} alt={artwork.title} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()}/>

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <span className="text-white text-xs sm:text-sm">
              {imageUrls.length > 0
                ? `${currentImageIndex + 1} / ${imageUrls.length}`
                : "—"}
            </span>
          </div>
        </div>)}

      <SignupPromptDialog isOpen={showSignupPrompt} onClose={() => setShowSignupPrompt(false)} artworkId={artworkId || artwork.id} artworkTitle={artwork.title} mode={signupPromptMode}/>

      <SpaceSelectionModal open={showSpaceSelectionModal} onOpenChange={setShowSpaceSelectionModal} artworkId={artworkId}/>
    </div>);
}
interface RecommendationSectionProps {
    title: string;
    subtitle: string;
    artworks: RecommendationArtworkItem[];
    onArtworkClick: (id: string) => void;
}
function RecommendationSection({ title, subtitle, artworks, onArtworkClick }: RecommendationSectionProps) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const itemsPerView = 4;
    const maxScroll = Math.max(0, artworks.length - itemsPerView);
    useEffect(() => {
        setScrollPosition(0);
    }, [artworks]);
    const handlePrev = () => {
        setScrollPosition((prev) => Math.max(0, prev - 1));
    };
    const handleNext = () => {
        setScrollPosition((prev) => Math.min(maxScroll, prev + 1));
    };
    const translateX = -(scrollPosition * (100 / itemsPerView));
    return (<motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative group/carousel">
      <div className="mb-6 sm:mb-8">
        <p className="text-[10px] sm:text-xs tracking-[0.4em] text-gray-400 uppercase mb-1 sm:mb-2">{subtitle}</p>
        <h2 className="text-xl sm:text-2xl text-primary">{title}</h2>
      </div>

      <div className="relative overflow-hidden">
        {scrollPosition > 0 && (<button onClick={handlePrev} className="absolute -left-3 sm:-left-5 top-[calc(50%-4rem)] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 flex items-center justify-center shadow-lg opacity-40 group-hover/carousel:opacity-100 hover:scale-105 hover:shadow-xl transition-all duration-300">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"/>
          </button>)}

        {scrollPosition < maxScroll && (<button onClick={handleNext} className="absolute -right-3 sm:-right-5 top-[calc(50%-4rem)] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 flex items-center justify-center shadow-lg opacity-40 group-hover/carousel:opacity-100 hover:scale-105 hover:shadow-xl transition-all duration-300">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"/>
          </button>)}

        <motion.div className="flex gap-4 sm:gap-8" animate={{ x: `${translateX}%` }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          {artworks.map((artwork) => (<div key={artwork.id} className="flex-shrink-0 w-[calc(25%-0.75rem)] sm:w-[calc(25%-1.5rem)] cursor-pointer group" onClick={() => onArtworkClick(artwork.id)}>
              <div className="aspect-square rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 mb-3 sm:mb-4">
                <ImageWithFallback src={artwork.image} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
              </div>
              <h3 className="text-sm sm:text-base text-primary group-hover:text-primary/80 transition-colors mb-1">
                {artwork.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{artwork.artist}</p>
              <p className="text-base sm:text-lg text-gray-900">¥{artwork.price.toLocaleString()}</p>
            </div>))}
        </motion.div>
      </div>
    </motion.section>);
}
