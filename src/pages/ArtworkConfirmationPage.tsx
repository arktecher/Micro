import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Sparkles,
  Package,
  QrCode,
  ArrowRight,
  Home,
  Plus
} from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

export function ArtworkConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { artwork, space } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!artwork || !space) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF9F6] to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">作品情報が見つかりません</p>
          <Button onClick={() => navigate('/corporate-dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF9F6] via-white to-[#FAF9F6] relative overflow-hidden">
      <Header />

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: [
                  "#C3A36D",
                  "#D4B478",
                  "#E7E4DD",
                  "#FFD700",
                ][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-20 pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-white to-[#FAF9F6] border-4 border-[#C3A36D]/40 shadow-2xl overflow-hidden">
            <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                }}
                className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
              >
                <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-4xl text-[#3A3A3A] mb-3 sm:mb-4"
              >
                🎉 おめでとうございます！
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8"
              >
                展示が確定しました
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white/80 rounded-xl border-2 border-[#C3A36D]/20 mb-6 sm:mb-8">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                    <ImageWithFallback
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover rounded-lg border-2 border-[#C3A36D]/30"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <Badge className="bg-green-500 text-white mb-2 text-xs sm:text-sm">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      展示確定
                    </Badge>
                    <h3 className="text-xl sm:text-2xl text-[#3A3A3A] mb-1">{artwork.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      {typeof artwork.artist === 'string' ? artwork.artist : artwork.artist?.name || 'Unknown Artist'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      展示場所: <span className="text-[#C3A36D]">{space.name}</span>
                    </p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 sm:p-6 bg-gradient-to-r from-[#C3A36D]/10 to-[#D4B478]/10 rounded-xl border border-[#C3A36D]/30 mb-6 sm:mb-8"
                >
                  <p className="text-base sm:text-lg text-[#3A3A3A] leading-relaxed">
                    あなたの空間が、いま<span className="text-[#C3A36D] text-lg sm:text-xl">"ギャラリー"</span>になりました。
                  </p>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 sm:mt-8"
        >
          <Card className="bg-white">
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <h2 className="text-lg sm:text-xl text-[#3A3A3A] mb-4 sm:mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#C3A36D]" />
                次のステップ
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1 text-xs sm:text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-1">アーティストに発送依頼を送信しました</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      数日以内に作品がお手元に届きます。配送状況はマイページの「配送状況」タブで確認できます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-1 text-xs sm:text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-1">作品が到着したら展示してください</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      同封の展示マニュアルに従って、作品を設置してください。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 mt-1 text-xs sm:text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-1 flex items-center gap-2">
                      <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                      QRコードを設置してください
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      作品と一緒にQRコードが同封されています。作品の近くに設置することで、訪問者が作品を購入できるようになります。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <Button
            onClick={() => navigate('/corporate-dashboard')}
            className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-[#C3A36D] to-[#D4B478] hover:opacity-90 text-white text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>他のスペースもアートを選ぶ</span>
          </Button>

          <Button
            onClick={() => navigate('/corporate-dashboard')}
            variant="outline"
            className="flex-1 h-12 sm:h-14 border-2 border-[#C3A36D] text-[#C3A36D] hover:bg-[#C3A36D]/5 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>マイページへ戻る</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <p className="text-xs sm:text-sm text-blue-900 text-center leading-relaxed">
            作品について質問がある場合や、変更をご希望の場合は、<br className="hidden sm:block" />
            マイページから24時間いつでもご連絡いただけます。
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}



