import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { CheckCircle2, Mail, Clock, Phone, AlertCircle, MessageSquare } from "lucide-react";

export function ArtworkIssueReportConfirmationPage() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const location = useLocation();
  const state = location.state as {
    artwork: any;
    issueType: string;
    issueDescription: string;
    discoveryDate: string;
  } | null;

  // stateがない場合は前のページに戻す
  useEffect(() => {
    if (!state) {
      navigate(`/corporate-space/${spaceId}`);
    }
  }, [state, navigate, spaceId]);

  if (!state) return null;

  const { artwork } = state;
  const reportId = `ISS-${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* 成功メッセージ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg sm:text-xl text-[#3A3A3A] mb-2">報告を受け付けました</h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">
                    担当者が内容を確認し、24時間以内にメールでご連絡いたします。
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <div className="px-3 py-1 bg-white border border-gray-200 rounded-full">
                      報告ID: {reportId}
                    </div>
                    <div className="px-3 py-1 bg-white border border-gray-200 rounded-full">
                      {new Date().toLocaleDateString('ja-JP')} 報告
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* メインエリア */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            {/* 次のステップ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    次のステップ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                        1
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">メールを確認</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          ご登録のメールアドレスに報告受付の確認メールをお送りしました。迷惑メールフォルダもご確認ください。
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                        2
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">担当者からの連絡を待つ</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          24時間以内に担当者がメールまたはお電話でご連絡いたします。状況確認や追加情報のご提供をお願いする場合がございます。
                        </p>
                        <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                          <p className="text-xs sm:text-sm text-accent">
                            <strong>緊急の場合：</strong> 下記の連絡先に直接お電話ください
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                        3
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">対応方針の決定</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          状況を確認後、作品の修復・返却・交換などの対応方針を決定し、ご連絡いたします。
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* メールについて */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Mail className="w-5 h-5" />
                    確認メールについて
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs sm:text-sm text-gray-700">
                    以下の内容を含む確認メールをお送りしています：
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>報告ID（{reportId}）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>報告内容の要約</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>今後の対応フロー</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>担当者の連絡先</span>
                    </li>
                  </ul>

                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <strong>メールが届かない場合：</strong>
                    </p>
                    <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                      <li>• 迷惑メールフォルダをご確認ください</li>
                      <li>• ドメイン「@mgj.example.com」からのメールを受信できるよう設定してください</li>
                      <li>• それでも届かない場合は、下記のサポートにご連絡ください</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* サイドバー */}
          <div className="space-y-4 sm:space-y-6">
            {/* 報告対象作品 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">報告対象の作品</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-1">
                      {artwork.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">{artwork.artist}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 緊急連絡先 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    緊急連絡先
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    緊急の場合は、下記に直接お電話ください
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-red-600" />
                        <span className="text-xs sm:text-sm text-gray-600">電話番号</span>
                      </div>
                      <p className="text-sm sm:text-base text-red-700">03-1234-5678</p>
                      <p className="text-xs text-gray-600 mt-1">平日 9:00-18:00</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-xs sm:text-sm text-gray-600">メール</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 break-all">emergency@mgj.example.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 参考情報 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    作品の取り扱いについて
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3">
                    担当者からご連絡するまでの間：
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>作品はそのままの状態で保管してください</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>ご自身での修復は行わないでください</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>追加の写真撮影にご協力いただく場合があります</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* アクションボタン */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                onClick={() => navigate(`/corporate-space/${spaceId}`)}
                className="w-full bg-accent hover:bg-accent/90"
              >
                スペース詳細に戻る
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
