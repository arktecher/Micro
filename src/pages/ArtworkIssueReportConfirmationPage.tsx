import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { CheckCircle2, Mail, Clock, Phone, AlertCircle, MessageSquare } from "lucide-react";

type ConfirmationState = {
  artwork: { title: string; artist: string; image: string };
  issueType: string;
  issueTypeLabel?: string;
  issueDescription: string;
  discoveryDate: string;
  /** Server-generated UUID (same pattern as return request 申請ID) */
  reportId: string;
  discoveredAtIso?: string | null;
} | null;

function displayReportId(raw: string | undefined): string {
  const t = raw?.trim();
  return t || "—";
}

export function ArtworkIssueReportConfirmationPage() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const location = useLocation();
  const state = location.state as ConfirmationState;

  useEffect(() => {
    if (!state) {
      navigate(`/corporate-space/${spaceId}`);
    }
  }, [state, navigate, spaceId]);

  if (!state) return null;

  const { artwork, issueTypeLabel, issueDescription, discoveryDate, reportId } = state;
  const reportIdDisplay = displayReportId(reportId);

  const discoveryLabel = (() => {
    if (!discoveryDate) return "—";
    const d = new Date(discoveryDate);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return discoveryDate;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-10 sm:pt-24 sm:pb-12">
        {/* 成功メッセージ（固定ヘッダー分の余白 + 下セクションとの間隔） */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <h2 className="text-lg sm:text-xl text-[#3A3A3A] mb-2">報告を受け付けました</h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">
                    担当者が内容を確認し、必要に応じてご登録の連絡先へメールまたはお電話でご連絡します（目安：24時間以内）。
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    {reportIdDisplay !== "—" ? (
                      <div className="max-w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left shadow-sm">
                        <span className="mb-0.5 block text-[11px] font-medium text-gray-500">
                          報告ID（UUID）
                        </span>
                        <span className="block break-all font-mono text-xs text-gray-900 sm:text-sm">
                          {reportIdDisplay}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-white">
                        報告ID: —
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-white">
                      {new Date().toLocaleDateString("ja-JP")} 受付
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
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
                        <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">連絡をお待ちください</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          報告IDは控えとしてお使いください。追加の写真や状況のご連絡を依頼する場合があります。
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                        2
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm sm:text-base text-[#3A3A3A] mb-1">担当者からの連絡</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          状況を確認のうえ、メールまたはお電話でご連絡いたします。
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
                          状況を確認後、修復・返却・交換などの方針をご連絡します。
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
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Mail className="w-5 h-5" />
                    メールが届かない場合
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs sm:text-sm text-gray-700">
                    迷惑メールフォルダをご確認のうえ、それでも連絡がない場合はサポートまでお問い合わせください（報告IDをお伝えください）。
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span className="break-all font-mono text-[13px] sm:text-sm">
                        報告ID（{reportIdDisplay}）
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>不具合の種類：{issueTypeLabel ?? "—"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>発見日時：{discoveryLabel}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">報告内容の要約</CardTitle>
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
                    <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-1">{artwork.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{artwork.artist}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 space-y-1 border-t pt-3">
                    <p>
                      <span className="text-gray-500">種類：</span>
                      {issueTypeLabel ?? "—"}
                    </p>
                    <p>
                      <span className="text-gray-500">発見：</span>
                      {discoveryLabel}
                    </p>
                    <p className="whitespace-pre-wrap">
                      <span className="text-gray-500">詳細：</span>
                      {issueDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
                      <p className="text-xs sm:text-sm text-gray-700 break-all">
                        emergency@mgj.example.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
