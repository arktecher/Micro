import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ImageIcon,
  Video,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Frame,
  Lightbulb,
  Tag,
  Clock,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { artworkService, type Artwork } from "@/services/artwork.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function ArtworkSelectionPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, currentUser, isInitialized } = useAuth();
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load artworks from API
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || userType !== "artist") {
      toast.error("このページはアーティスト専用です");
      navigate("/login/artist");
      return;
    }

    if (currentUser?.id) {
      loadArtworks();
    }
  }, [isInitialized, isAuthenticated, userType, currentUser?.id, navigate]);

  // Technique options mapping
  const techniqueOptions: { [key: string]: string } = {
    oil: "油彩",
    acrylic: "アクリル",
    watercolor: "水彩",
    "mixed-media": "ミクストメディア",
    digital: "デジタル",
    other: "その他",
  };

  const loadArtworks = async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      const response = await artworkService.listArtworks({
        page: 1,
        page_size: 100, // Get all artworks
        artist_id: currentUser.id, // Filter by current artist
      });

      // Map API response to match the expected format
      const mappedArtworks = response.items.map((artwork: Artwork) => ({
        id: artwork.id,
        name: artwork.title,
        price: Number(artwork.price).toLocaleString(),
        width: artwork.dimensions?.width || 0,
        height: artwork.dimensions?.height || 0,
        depth: artwork.dimensions?.depth || 0,
        year: artwork.year?.toString() || "",
        technique: artwork.medium ? (techniqueOptions[artwork.medium] || artwork.medium) : "",
        theme: artwork.story || artwork.description || "",
        hasImage: !!artwork.main_image_url,
        isVideo: false, // Can be determined from image URL or file type later
        tags: artwork.style_tags || [],
        main_image_url: artwork.main_image_url,
        custom_id: artwork.custom_id,
        status: artwork.status, // Include status to check if already published
      }));

      setArtworks(mappedArtworks);
    } catch (error: any) {
      console.error("Failed to load artworks:", error);
      toast.error("作品の読み込みに失敗しました");
      setArtworks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArtwork = (id: string) => {
    // Find the artwork to check if it's already published
    const artwork = artworks.find((a) => a.id === id);
    if (artwork && artwork.status === "published") {
      // Don't allow selection of already published artworks
      return;
    }
    
    setSelectedArtworks((prev) =>
      prev.includes(id)
        ? prev.filter((artworkId) => artworkId !== id)
        : [...prev, id]
    );
  };

  const handleScrollToSelection = () => {
    const selectionSection = document.getElementById("artwork-grid");
    if (selectionSection) {
      selectionSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNext = async () => {
    if (selectedArtworks.length === 0) {
      toast.error("少なくとも1つの作品を選択してください");
      return;
    }

    setIsPublishing(true);

    try {
      // Get selected artwork data for localStorage (for the publish page)
      const selectedData = artworks.filter((artwork) =>
      selectedArtworks.includes(artwork.id)
    );

      // Batch publish all selected artworks via API
      const response = await artworkService.batchPublishArtworks(selectedArtworks);

      // Show success/error messages
      if (response.successful > 0) {
        toast.success(`${response.successful}件の作品を公開しました`);
      }
      
      if (response.failed > 0) {
        const failedResults = response.results.filter(r => !r.success);
        const failedNames = failedResults.map(f => {
          const artwork = artworks.find(a => a.id === f.artwork_id);
          return artwork?.name || f.artwork_id;
        }).join("、");
        toast.error(`${response.failed}件の作品の公開に失敗しました: ${failedNames}`);
      }

      // Only save successfully published artworks to localStorage
      const successfulArtworkIds = response.results
        .filter(r => r.success)
        .map(r => r.artwork_id);
      const successfulArtworkData = selectedData.filter((artwork) =>
        successfulArtworkIds.includes(artwork.id)
      );

      // Save selected data to localStorage for the publish page
      localStorage.setItem("mgj_selected_artworks", JSON.stringify(successfulArtworkData));

      // Navigate to publish page only if at least one artwork was published
      if (response.successful > 0) {
    navigate("/artwork-publish");
      }
    } catch (error: any) {
      console.error("Failed to publish artworks:", error);
      toast.error("作品の公開に失敗しました: " + (error.message || "不明なエラー"));
    } finally {
      setIsPublishing(false);
    }
  };

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-[#C3A36D] mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      {/* ステップバー */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm md:text-base text-gray-700">
                アーティスト登録
              </span>
            </div>
            <div className="w-4 sm:w-8 md:w-12 h-0.5 bg-[#C3A36D]"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#C3A36D] text-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm md:text-base text-gray-700">
                作品登録
              </span>
            </div>
            <div className="w-4 sm:w-8 md:w-12 h-0.5 bg-[#C3A36D]"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#C3A36D] to-[#D4B478] text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm md:text-base text-[#C3A36D]">
                展示作品を選ぶ
              </span>
            </div>
            <div className="w-4 sm:w-8 md:w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs sm:text-sm">
                4
              </div>
              <span className="text-xs sm:text-sm md:text-base text-gray-400">
                展示開始
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Heroセクション - 祝福と誘導 */}
      <section className="relative py-12 sm:py-20 md:py-32 px-4 overflow-hidden bg-gradient-to-b from-white via-[#F8F6F1]/50 to-[#F8F6F1]">
        {/* 背景の淡いグラデーション */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-[#C3A36D]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-[#D4B478]/20 rounded-full blur-3xl"></div>
        </div>

        {/* 浮かぶ額縁のイラスト */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.15 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute top-10 right-10 hidden lg:block"
        >
          <Frame className="w-24 h-24 md:w-32 md:h-32 text-[#C3A36D]" strokeWidth={1} />
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.15 }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-20 left-10 hidden lg:block"
        >
          <Frame className="w-20 h-20 md:w-24 md:h-24 text-[#D4B478]" strokeWidth={1} />
        </motion.div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* アイコン装飾 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full mb-6 sm:mb-8 shadow-xl"
            >
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#3A3A3A] mb-4 sm:mb-6 leading-tight px-2"
            >
              おめでとうございます！
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#3A3A3A] mb-3 sm:mb-4 leading-relaxed px-2"
            >
              あなたのアーティスト登録が完了しました。
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed px-2"
            >
              次は、あなたの作品を
              <span className="text-[#C3A36D]">「世界へ」</span>
              送り出しましょう。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mb-6 sm:mb-8"
            >
              <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-4 sm:mb-6 px-2">
                MGJで公開したい作品を選んでください。
                <br className="hidden sm:block" />
                選んだ作品は、マイクロギャラリーの候補として公開されます。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <Button
                onClick={handleScrollToSelection}
                size="lg"
                className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 text-white px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-2xl"
              >
                <span>作品を選ぶ</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* サイドインフォ - 作品選びのヒント */}
      <section className="py-8 sm:py-12 px-4 bg-white border-y border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
          >
            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F1] to-white rounded-xl sm:rounded-2xl border border-[#C3A36D]/20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C3A36D]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1 sm:mb-2">
                  複数の作品を選べます
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  1つだけでも、全部でもOK。あなたが展示したい作品を選んでください。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F1] to-white rounded-xl sm:rounded-2xl border border-[#C3A36D]/20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C3A36D]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1 sm:mb-2">
                  いつでも変更できます
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  後から作品を追加したり、選択を変更することも可能です。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F1] to-white rounded-xl sm:rounded-2xl border border-[#C3A36D]/20 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C3A36D]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1 sm:mb-2">
                  作品が公開されます
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  選んだ作品は、MGJのギャラリーに公開されます。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 作品選択セクション */}
      <section id="artwork-grid" className="py-12 sm:py-16 px-4 bg-[#F8F6F1]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#3A3A3A] mb-3 sm:mb-4">
              あなたの作品一覧
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              作品をクリックして展示候補に選んでください
            </p>
          </motion.div>

          {isLoading ? (
            <Card className="p-8 sm:p-12 text-center bg-white rounded-xl sm:rounded-2xl">
              <CardContent>
                <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-[#C3A36D] mx-auto mb-4 animate-spin" />
                <h3 className="text-xl sm:text-2xl text-gray-600 mb-2">
                  作品を読み込み中...
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  しばらくお待ちください
                </p>
              </CardContent>
            </Card>
          ) : artworks.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center bg-white rounded-xl sm:rounded-2xl">
              <CardContent>
                <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl text-gray-600 mb-2">
                  登録された作品がありません
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6">
                  まずは作品を登録してください。
                </p>
                <Button
                  onClick={() => navigate("/signup/artist/artworks")}
                  className="bg-[#C3A36D] hover:bg-[#C3A36D]/90 rounded-xl"
                >
                  作品を登録する
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-20 sm:mb-24">
                {artworks.map((artwork, index) => {
                  const isSelected = selectedArtworks.includes(artwork.id);
                  const isPublished = artwork.status === "published";
                  const isSelectable = !isPublished;

                  return (
                    <motion.div
                      key={artwork.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <motion.div
                        whileHover={isSelectable ? { y: -8, scale: 1.02 } : {}}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="group relative"
                      >
                        <Card
                          className={`transition-all duration-300 bg-white rounded-xl sm:rounded-2xl overflow-hidden border-2 ${
                            isPublished
                              ? "border-gray-300 opacity-75 cursor-not-allowed"
                              : isSelected
                              ? "border-[#C3A36D] shadow-2xl shadow-[#C3A36D]/20 cursor-pointer"
                              : "border-transparent hover:border-gray-200 hover:shadow-xl cursor-pointer"
                          }`}
                          onClick={() => isSelectable && toggleArtwork(artwork.id)}
                        >
                          {/* 選択状態のオーバーレイ */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-gradient-to-br from-[#C3A36D]/10 to-[#D4B478]/10 z-10 pointer-events-none"
                            />
                          )}

                          {/* 公開済みバッジ */}
                          {isPublished && (
                            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
                              <Badge className="bg-green-500 text-white border-0 px-2 sm:px-3 py-1 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                公開済み
                              </Badge>
                            </div>
                          )}

                          {/* チェックマーク */}
                          {isSelectable && (
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0.9,
                                rotate: isSelected ? 0 : -10,
                              }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                                isSelected
                                  ? "bg-gradient-to-br from-[#C3A36D] to-[#D4B478] shadow-lg"
                                  : "bg-white/80 backdrop-blur-sm border-2 border-gray-300 group-hover:border-[#C3A36D]"
                              } transition-colors`}
                            >
                              {isSelected ? (
                                <CheckCircle
                                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-400 group-hover:border-[#C3A36D]"></div>
                              )}
                            </motion.div>
                          </div>
                          )}

                          {/* 画像プレビュー */}
                          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
                            {/* Hover時の「展示候補にする」メッセージ */}
                            {isSelectable && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileHover={{ opacity: 1, y: 0 }}
                              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <div className="text-center px-4">
                                <Frame className="w-8 h-8 sm:w-12 sm:h-12 text-white mx-auto mb-2" />
                                <p className="text-sm sm:text-base text-white">
                                  {isSelected ? "選択を解除" : "この作品を選ぶ"}
                                </p>
                              </div>
                            </motion.div>
                            )}
                            {/* 公開済みの場合のオーバーレイ */}
                            {isPublished && (
                              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                                <div className="text-center px-4">
                                  <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white mx-auto mb-2" />
                                  <p className="text-sm sm:text-base text-white font-medium">
                                    既に公開済み
                                  </p>
                                </div>
                              </div>
                            )}

                            {artwork.main_image_url ? (
                              <img
                                src={artwork.main_image_url}
                                alt={artwork.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const icon = document.createElement("div");
                                    icon.className = "w-full h-full flex items-center justify-center";
                                    icon.innerHTML = `<svg class="w-16 h-16 sm:w-20 sm:h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                                    parent.appendChild(icon);
                                  }
                                }}
                              />
                            ) : artwork.isVideo ? (
                              <Video
                                className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300"
                                strokeWidth={1.5}
                              />
                            ) : (
                              <ImageIcon
                                className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300"
                                strokeWidth={1.5}
                              />
                            )}
                          </div>

                          {/* 作品情報 */}
                          <CardContent className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                            <div>
                              <h3 className="text-lg sm:text-xl text-[#3A3A3A] mb-1">
                                {artwork.name}
                              </h3>
                              <p className="text-base sm:text-lg text-[#C3A36D]">
                                ¥{artwork.price}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {artwork.tags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs border-[#C3A36D]/30 text-[#C3A36D]"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                              {artwork.isVideo && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-purple-300 text-purple-600"
                                >
                                  <Video className="w-3 h-3 mr-1" />
                                  動画
                                </Badge>
                              )}
                            </div>

                            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="text-gray-500">サイズ：</span>
                                {artwork.width}×{artwork.height}
                                {artwork.depth && `×${artwork.depth}`}cm
                              </p>
                              <p>
                                <span className="text-gray-500">技法：</span>
                                {artwork.technique}
                              </p>
                              <p>
                                <span className="text-gray-500">制作年：</span>
                                {artwork.year}年
                              </p>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 pt-2 border-t border-gray-100">
                              {artwork.theme}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 選択状況と送信ボタン - スティッキーフッター */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-t-[#C3A36D] shadow-2xl z-40"
              >
                <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-base sm:text-lg text-[#3A3A3A]">
                        <span className="text-[#C3A36D] text-2xl sm:text-3xl mr-2">
                          {selectedArtworks.length}
                        </span>
                        作品を選択中
                      </p>
                      {selectedArtworks.length > 0 && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          選択した作品をMGJのギャラリーに公開します
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleNext}
                      disabled={selectedArtworks.length === 0 || isPublishing}
                      size="lg"
                      className={`px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl transition-all w-full sm:w-auto ${
                        selectedArtworks.length > 0 && !isPublishing
                          ? "bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isPublishing ? (
                        <>
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          <span>公開中...</span>
                        </>
                      ) : (
                        <>
                      <span>選択を確定する</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* フッターの余白（スティッキーフッターの高さ分） */}
      <div className="h-24 sm:h-32"></div>

      <Footer />
    </div>
  );
}

