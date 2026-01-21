import { motion } from "motion/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle, Info, ArrowRight } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ArtistWelcomePage() {
  const navigate = useNavigate();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/30 via-white to-gray-50">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          {/* ウェルカムメッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-10 sm:mb-16 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4 sm:mb-6"
            >
              <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-4 sm:mb-6 px-2"
            >
              確認メールを送信しました
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-2"
            >
              ご登録ありがとうございます。<br className="hidden sm:block" />
              次に、受信ボックスでメールアドレスの確認を完了してください。
            </motion.p>
          </motion.div>

          {/* 重要なお知らせ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8 sm:mb-12"
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl text-primary mb-3">
                      次にやること（必須）
                    </h3>
                  </div>
                </div>

                <div className="space-y-4 sm:ml-12 md:ml-16">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-primary mb-1">受信ボックスを確認してください</p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        「メールアドレス確認」のメールを開き、リンクをクリックして確認を完了してください。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-primary mb-1">確認が完了するまでログインできません</p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        メール確認が終わると、プロフィール編集やダッシュボードの利用ができるようになります。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-primary mb-1">迷惑メールも確認してください</p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        数分待っても届かない場合は、迷惑メールフォルダや受信設定をご確認ください。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-primary mb-1">確認が終わったら次へ</p>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        メール確認後、このページの「確認完了後はこちら」からログイン画面へ進めます。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 次のアクション（確認後） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-4 mb-8 sm:mb-12"
          >
            <Card className="border-2 border-accent bg-gradient-to-r from-accent/5 to-transparent hover:shadow-xl transition-all">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <Info className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
                    </div>
                  </div>
                  <div className="flex-grow w-full sm:w-auto">
                    <h3 className="text-lg sm:text-xl md:text-2xl text-primary mb-2">
                      確認完了後はこちら
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                      メール確認が完了したら、このボタンから次のステップへ進んでください。
                    </p>
                    <Button
                      size="lg"
                      onClick={() => navigate("/signup/confirm")}
                      className="bg-accent hover:bg-accent/90 text-white w-full sm:w-auto"
                    >
                      <span>確認完了後はこちら</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center px-2"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login-selection")}
              className="w-full sm:w-auto"
            >
              ログイン選択へ
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

