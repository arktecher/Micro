import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Sparkles,
  ImageIcon,
  Video,
  Home,
  Eye,
  Heart,
  Star,
  Tag,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ArtworkPublishPage() {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(true);

  // localStorageから選択した作品データを取得
  const getSelectedArtworks = () => {
    const stored = localStorage.getItem("mgj_selected_artworks");
    if (stored) {
      return JSON.parse(stored);
    }
    // フォールバック用のモックデータ
    return [
      {
        id: "1",
        name: "夏の思い出",
        price: "50,000",
        width: 45.5,
        height: 60.0,
        depth: 3.0,
        year: "2024",
        technique: "油彩、キャンバス",
        theme: "夏の海辺で感じた懐かしさと儚さを表現しました。",
        hasImage: true,
        isVideo: false,
        tags: ["風景", "モダン"],
      },
      {
        id: "2",
        name: "都市の夜",
        price: "80,000",
        width: 72.7,
        height: 53.0,
        depth: 2.5,
        year: "2023",
        technique: "アクリル、パネル",
        theme: "東京の夜景の美しさと孤独感を色彩で表現。",
        hasImage: true,
        isVideo: false,
        tags: ["都市", "抽象"],
      },
      {
        id: "3",
        name: "静寂",
        price: "120,000",
        width: 91.0,
        height: 72.7,
        depth: 4.0,
        year: "2024",
        technique: "ミクストメディア",
        theme: "音のない世界の中で感じる静けさと安らぎ。",
        hasImage: true,
        isVideo: true,
        tags: ["抽象", "モダン"],
      },
    ];
  };

  const selectedArtworks = getSelectedArtworks();

  useEffect(() => {
    window.scrollTo(0, 0);

    // 公開処理のシミュレーション
    const timer = setTimeout(() => {
      setIsPublishing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 公開完了後に画面トップにスクロール
  useEffect(() => {
    if (!isPublishing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPublishing]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      {isPublishing ? (
        // ローディング画面
        <section className="min-h-screen flex items-center justify-center px-4 pt-20 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl"
            >
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>

            <h2 className="text-2xl sm:text-3xl text-[#3A3A3A] mb-3 sm:mb-4">
              作品を公開しています...
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              あなたの作品が、世界に届けられようとしています
            </p>
          </motion.div>
        </section>
      ) : (
        <>
          {/* 成功ヘッダーセクション */}
          <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden bg-gradient-to-b from-white via-[#F8F6F1]/50 to-[#F8F6F1]">
            {/* 光のエフェクト */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-[#C3A36D]/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-[#D4B478]/30 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                {/* 成功アイコン */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#C3A36D] to-[#D4B478] rounded-full mb-6 sm:mb-8 shadow-2xl"
                >
                  <CheckCircle
                    className="w-12 h-12 sm:w-14 sm:h-14 text-white"
                    strokeWidth={2.5}
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-3xl sm:text-4xl md:text-5xl text-[#3A3A3A] mb-4 sm:mb-6 px-2"
                >
                  作品の公開が完了しました
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-lg sm:text-xl text-gray-600 mb-4 leading-relaxed px-2"
                >
                  {selectedArtworks.length}作品が、MGJのギャラリーに公開されました。
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* 次のステップ案内 */}
          <section className="py-8 sm:py-12 px-4 bg-white border-y border-gray-200">
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="text-center mb-8 sm:mb-10"
              >
                <h2 className="text-2xl sm:text-3xl text-[#3A3A3A] mb-2 sm:mb-3">
                  ここから何が起こるのか
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  あなたの作品は、これから多くの人の目に触れます
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="text-center p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F1] to-white rounded-xl sm:rounded-2xl border border-[#C3A36D]/20"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C3A36D]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-[#C3A36D]" />
                  </div>
                  <h3 className="text-lg sm:text-xl text-[#3A3A3A] mb-2 sm:mb-3">
                    1. 作品が閲覧される
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    ホテルやオフィスのオーナーが、MGJで公開されたあなたの作品を見て検討します。
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  className="text-center p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F1] to-white rounded-xl sm:rounded-2xl border border-[#C3A36D]/20"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C3A36D]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#C3A36D]" />
                  </div>
                  <h3 className="text-lg sm:text-xl text-[#3A3A3A] mb-2 sm:mb-3">
                    2. 展示先が決まったら発送
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    作品が選ばれたら、MGJから梱包用の段ボールをお送りします。作品を梱包して展示先へ直接郵送してください（送料はご負担いただきます）。
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="text-center p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F1] to-white rounded-xl sm:rounded-2xl border border-[#C3A36D]/20 sm:col-span-2 md:col-span-1"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#C3A36D]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-[#C3A36D]" />
                  </div>
                  <h3 className="text-lg sm:text-xl text-[#3A3A3A] mb-2 sm:mb-3">
                    3. 展示・販売
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    あなたの作品が実際の空間に飾られます。作品が購入されたら通知が届き、販売価格の50％が入金されます。
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 公開された作品一覧 */}
          <section className="py-12 sm:py-16 px-4 bg-[#F8F6F1]">
            <div className="container mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-center mb-8 sm:mb-12"
              >
                <h2 className="text-2xl sm:text-3xl text-[#3A3A3A] mb-3 sm:mb-4">
                  公開された作品
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  以下の作品が、現在MGJのギャラリーで公開されています
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {selectedArtworks.map((artwork: any, index: number) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 + index * 0.1, duration: 0.6 }}
                  >
                    <Card className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#C3A36D]/20 shadow-lg hover:shadow-xl transition-shadow relative">
                      {/* 公開中バッジ */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                        <Badge className="bg-gradient-to-r from-[#C3A36D] to-[#D4B478] text-white border-0 px-2 sm:px-3 py-1 text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          公開中
                        </Badge>
                      </div>

                      {/* 画像プレビュー */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
                        {artwork.isVideo ? (
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
                          {artwork.tags.map((tag: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs border-[#C3A36D]/30 text-[#C3A36D]"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
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
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* CTAボタン */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0, duration: 0.6 }}
                className="flex justify-center items-center"
              >
                <Button
                  onClick={handleGoToDashboard}
                  size="lg"
                  className="bg-gradient-to-r from-[#3A3A3A] to-[#4A4A4A] hover:opacity-90 text-white px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl w-full sm:w-auto"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  マイページへ
                </Button>
              </motion.div>
            </div>
          </section>

          {/* 追加のヒント・サポートセクション */}
          <section className="py-12 sm:py-16 px-4 bg-white">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.6 }}
                className="bg-gradient-to-br from-[#F8F6F1] to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-[#C3A36D]/20 text-center"
              >
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#C3A36D] mx-auto mb-4 sm:mb-6" />
                <h2 className="text-xl sm:text-2xl md:text-3xl text-[#3A3A3A] mb-3 sm:mb-4">
                  あなたのアート、楽しみにしています
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  作品の公開状況は、マイページからいつでも確認できます。
                  <br className="hidden sm:block" />
                  展示先が決まったら、MGJからすぐにご連絡します。
                </p>
                <p className="text-sm sm:text-base text-gray-500">
                  ご不明な点がございましたら、
                  <br className="sm:hidden" />
                  <br className="hidden sm:block" />
                  いつでもサポートまでお問い合わせください。
                </p>
              </motion.div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}

