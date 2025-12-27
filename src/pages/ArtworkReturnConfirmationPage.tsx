import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { CheckCircle2, Package, TruckIcon, Mail, AlertCircle } from "lucide-react";
import { openReturnLabelInNewWindow } from "@/components/ReturnLabelPreview";

export function ArtworkReturnConfirmationPage() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const location = useLocation();
  const state = location.state as {
    artwork: any;
    returnReason: string;
    additionalComments: string;
    displayDays: number;
    shippingCostBearer: "corporate" | "artist";
  } | null;

  // stateがない場合は前のページに戻す
  useEffect(() => {
    if (!state) {
      navigate(`/corporate-space/${spaceId}`);
    }
  }, [state, navigate, spaceId]);

  if (!state) return null;

  const { artwork, displayDays, shippingCostBearer } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
                  <h2 className="text-lg sm:text-xl text-[#3A3A3A] mb-2">返却申請を受け付けました</h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">
                    アーティストに通知されました。下記の住所へ作品をご返送ください。
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                    <Badge variant="outline" className="bg-white">
                      申請ID: RTN-{Date.now().toString().slice(-8)}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {new Date().toLocaleDateString('ja-JP')} 申請
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* メインエリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* 返送手順 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-accent" />
                    返送の手順
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shippingCostBearer === "corporate" ? (
                      <>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                            1
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">作品を梱包する</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              到着時の梱包材を使用するか、同等の保護材で丁寧に梱包してください。
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                            2
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">配送業者を手配する</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                              ヤマト運輸、佐川急便など、追跡可能な配送業者をご利用ください。
                            </p>
                            <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                              <p className="text-xs sm:text-sm text-accent">
                                <strong>重要：</strong> 元払い（送料は貴社負担）でお送りください
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                            3
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">追跡番号を記録する</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              発送後、追跡番号を控えてください。必要に応じてアーティストと共有します。
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                            1
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">作品到着時と同じ梱包箱で梱包する</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                              到着時の梱包箱と梱包材をそのまま使用して、作品を丁寧に梱包してください。
                            </p>
                            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <p className="text-xs sm:text-sm text-orange-700">
                                <strong>送料について：</strong> 展示期間が180日を超えているため、返送料はアーティストが負担します
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                            2
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">集荷の自動手配完了</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                              MGJシステムが配送業者に集荷を自動手配しました。2〜3営業日以内に配送業者から事前連絡があります。
                            </p>
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs sm:text-sm text-green-700">
                                ✓ 集荷予約完了　✓ 追跡番号は集荷後に自動登録されます
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                            3
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">配送業者に作品を引き渡す</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              配送業者が集荷に伺いますので、梱包済みの作品を引き渡してください。
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 送料負担情報 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className={shippingCostBearer === "corporate" ? "border-accent/30" : "border-orange-200"}>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <TruckIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${shippingCostBearer === "corporate" ? "text-accent" : "text-orange-600"}`} />
                    送料負担
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg ${shippingCostBearer === "corporate" ? "bg-accent/5 border border-accent/20" : "bg-orange-50 border border-orange-200"}`}>
                    <p className="text-xs sm:text-sm text-gray-700 mb-2">
                      {shippingCostBearer === "corporate" ? (
                        <>
                          <strong className="text-accent">法人様のご負担</strong>
                          <br />
                          展示期間が180日以内のため
                        </>
                      ) : (
                        <>
                          <strong className="text-orange-700">アーティストのご負担</strong>
                          <br />
                          展示期間が180日を超えているため
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 返却ラベルプレビュー */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    返却用ラベル
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    ボタンをクリックすると印刷画面が開きます
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    A4用紙などで印刷し、ラベル部分を切り取って梱包箱に貼り付けてください。
                  </p>
                  <Button
                    className="w-full justify-start gap-2 bg-[#A67C52] hover:bg-[#8B5E3C] text-white"
                    size="sm"
                    onClick={() => {
                      // 集荷元の住所を取得（展示場所の住所を優先）
                      const corporateAddress = state?.artwork?.displayLocation || '〒150-0001 東京都渋谷区神宮前1-2-3 サンプルビル5F';
                      
                      // ラベルデータを生成
                      const labelData = {
                        returnId: `RTN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                        artworkId: state?.artwork?.id || 'ART-2024-XXX',
                        rentalStartDate: new Date(Date.now() - state!.displayDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '/'),
                        rentalEndDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                        shippingType: state!.shippingCostBearer === 'corporate' ? 'cash_on_delivery' as const : 'prepaid' as const,
                        corporate: {
                          name: '株式会社サンプル商事',
                          address: corporateAddress,
                          phone: '03-1234-5678',
                        },
                        artist: {
                          name: state?.artwork?.artistName || state?.artwork?.artist || '山田 太郎',
                          address: state?.artwork?.artistAddress || '〒160-0022 東京都新宿区新宿3-4-5 アートマンション201',
                          phone: state?.artwork?.artistPhone || '090-1234-5678',
                        },
                        barcode: `YMT-${Date.now().toString().slice(-11)}`,
                      };
                      
                      openReturnLabelInNewWindow(labelData);
                    }}
                  >
                    <Package className="w-4 h-4" />
                    配送ラベルを印刷する
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* 返却対象作品 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">返却対象の作品</CardTitle>
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
                    <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1">
                      {artwork.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">{artwork.artist}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      展示期間：{displayDays}日間
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* お問い合わせ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-accent" />
                    ご不明な点がある場合
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    返送方法や梱包についてご不明な点がございましたら、お気軽にお問い合わせください。
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      size="sm"
                    >
                      <Mail className="w-4 h-4" />
                      サポートに連絡
                    </Button>
                  </div>
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


