import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  ArrowLeft,
  AlertCircle,
  Camera,
  Upload,
  X,
  CheckCircle2,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import {
  getIssueReportContext,
  createIssueReport,
  uploadIssueReportImage,
  type IssueReportContext,
} from "@/services/space.service";
import { useAuth } from "@/contexts/AuthContext";
import { corporateRoleAllowsEdit } from "@/lib/corporatePermissions";

/** Neutral placeholder when API returns no image URL (avoid stock photos that look like mock data). */
const PLACEHOLDER_NO_ARTWORK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#f3f4f6" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="15">画像なし</text></svg>`,
  );

const ISSUE_TYPE_LABELS: Record<string, string> = {
  damage: "作品の破損（キズ、ひび割れ等）",
  stain: "汚れ・変色",
  frame: "額装・フレームの問題",
  delivery: "配送時の破損",
  other: "その他",
};

function formatJaDisplayStart(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArtworkIssueReportPage() {
  const navigate = useNavigate();
  const { spaceId } = useParams();
  const { userType, corporateRole, isInitialized, isAuthenticated } = useAuth();
  const [ctx, setCtx] = useState<IssueReportContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);

  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [discoveryDate, setDiscoveryDate] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(new Map());
  const [agreedToReport, setAgreedToReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!spaceId) {
      setContextLoading(false);
      setContextError("スペースIDが不正です");
      return;
    }
    if (!isInitialized) return;
    if (isAuthenticated && userType === "corporate" && corporateRole === null) {
      return;
    }
    if (
      isAuthenticated &&
      userType === "corporate" &&
      !corporateRoleAllowsEdit(corporateRole)
    ) {
      setContextLoading(false);
      setContextError("この操作には編集者以上の権限が必要です。");
      setCtx(null);
      return;
    }
    let cancelled = false;
    setContextLoading(true);
    setContextError(null);
    getIssueReportContext(spaceId)
      .then((data) => {
        if (!cancelled) setCtx(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setCtx(null);
          setContextError(
            e instanceof Error ? e.message : "情報の取得に失敗しました",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setContextLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [spaceId, isInitialized, isAuthenticated, userType, corporateRole]);

  const artworkCard = useMemo(() => {
    if (!ctx) return null;
    return {
      title: ctx.artwork_title || "無題",
      artist: ctx.artist_name || "—",
      image: (ctx.main_image_url && ctx.main_image_url.trim()) || PLACEHOLDER_NO_ARTWORK_IMAGE,
      location: ctx.display_location_label || ctx.space_name || "—",
      displayStart: formatJaDisplayStart(ctx.display_start_date),
    };
  }, [ctx]);

  const isImageFile = (file: File): boolean => {
    if (file.type.startsWith("image/")) return true;
    const fileName = file.name.toLowerCase();
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif"];
    return validExtensions.some((ext) => fileName.endsWith(ext));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const invalidFiles = files.filter((file) => !isImageFile(file));
    if (invalidFiles.length > 0) {
      toast.error("画像ファイルのみアップロード可能です（JPG, PNG, HEIC等）");
      return;
    }
    if (images.length + files.length > 5) {
      toast.error("画像は最大5枚までアップロードできます");
      return;
    }
    const currentCount = images.length;
    setImages([...images, ...files]);
    const newPreviewUrls = new Map(previewUrls);
    const { createImagePreviewUrl } = await import("@/lib/heicConverter");
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const index = currentCount + i;
      try {
        const previewUrl = await createImagePreviewUrl(file);
        newPreviewUrls.set(index, previewUrl);
      } catch {
        const fallbackUrl = URL.createObjectURL(file);
        newPreviewUrls.set(index, fallbackUrl);
      }
    }
    setPreviewUrls(newPreviewUrls);
  };

  const removeImage = async (index: number) => {
    const url = previewUrls.get(index);
    if (url) URL.revokeObjectURL(url);
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    const newPreviewUrls = new Map<number, string>();
    const { createImagePreviewUrl } = await import("@/lib/heicConverter");
    for (let i = 0; i < updatedImages.length; i++) {
      const file = updatedImages[i];
      try {
        newPreviewUrls.set(i, await createImagePreviewUrl(file));
      } catch {
        newPreviewUrls.set(i, URL.createObjectURL(file));
      }
    }
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      isAuthenticated &&
      userType === "corporate" &&
      !corporateRoleAllowsEdit(corporateRole)
    ) {
      toast.error("この操作には編集者以上の権限が必要です。");
      return;
    }
    if (!spaceId || !ctx) {
      toast.error("スペース情報を読み込めませんでした");
      return;
    }
    if (!issueType) {
      toast.error("不具合の種類を選択してください");
      return;
    }
    if (!issueDescription.trim()) {
      toast.error("詳細な状況を記入してください");
      return;
    }
    if (!discoveryDate) {
      toast.error("発見日時を入力してください");
      return;
    }
    if (!agreedToReport) {
      toast.error("報告内容の確認に同意してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const photoUrls: string[] = [];
      for (const file of images) {
        const up = await uploadIssueReportImage(file, spaceId);
        photoUrls.push(up.url);
      }
      const created = await createIssueReport(spaceId, {
        issue_type: issueType,
        description: issueDescription.trim(),
        discovered_at: discoveryDate,
        photo_urls: photoUrls.length ? photoUrls : undefined,
      });
      navigate(`/artwork-issue-report-confirmation/${spaceId}`, {
        state: {
          artwork: {
            title: ctx.artwork_title || "無題",
            artist: ctx.artist_name || "—",
            image:
              (ctx.main_image_url && ctx.main_image_url.trim()) ||
              PLACEHOLDER_NO_ARTWORK_IMAGE,
          },
          issueType,
          issueTypeLabel: ISSUE_TYPE_LABELS[issueType] ?? issueType,
          issueDescription: issueDescription.trim(),
          discoveryDate,
          reportId: created.id,
          discoveredAtIso: created.discovered_at,
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "報告の送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 sm:px-6 pb-16 pt-24 sm:pt-28">
          <Loader2 className="w-10 h-10 animate-spin text-accent" aria-hidden />
          <p className="text-sm text-muted-foreground">読み込み中…</p>
        </main>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>
    );
  }

  if (contextError || !ctx || !artworkCard) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">読み込みエラー</CardTitle>
              <CardDescription>{contextError ?? "表示できません"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate(`/corporate-space/${spaceId}`)}>
                スペース詳細に戻る
              </Button>
            </CardContent>
          </Card>
        </main>
        <div className="mt-auto shrink-0">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/corporate-space/${spaceId}`)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            スペース詳細に戻る
          </Button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl text-[#3A3A3A] mb-2">破損・不具合の報告</h1>
              <p className="text-sm sm:text-base text-gray-600">
                作品の破損や不具合を発見した場合は、速やかにご報告ください
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>報告対象の作品</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-full sm:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <ImageWithFallback
                      src={artworkCard.image}
                      alt={artworkCard.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow space-y-2">
                    <div>
                      <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1">{artworkCard.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{artworkCard.artist}</p>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      <p>展示場所：{artworkCard.location}</p>
                      <p>展示開始：{artworkCard.displayStart}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>不具合の種類</CardTitle>
                <CardDescription>該当する種類を選択してください</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={issueType} onValueChange={setIssueType}>
                  <div className="space-y-2 sm:space-y-3">
                    {(
                      [
                        ["damage", "作品の破損（キズ、ひび割れ等）"],
                        ["stain", "汚れ・変色"],
                        ["frame", "額装・フレームの問題"],
                        ["delivery", "配送時の破損"],
                        ["other", "その他"],
                      ] as const
                    ).map(([value, label]) => (
                      <div
                        key={value}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <RadioGroupItem value={value} id={value} />
                        <Label htmlFor={value} className="flex-grow cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>不具合を発見した日時</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="datetime-local"
                  value={discoveryDate}
                  onChange={(e) => setDiscoveryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>詳細な状況</CardTitle>
                <CardDescription>できるだけ具体的にご記入ください</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="例：作品の左下に約3cmのひび割れを発見しました。昨日の時点では確認できなかったため、本日発生したものと思われます。"
                  className="min-h-[120px] sm:min-h-[150px] resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-accent" />
                  写真のアップロード
                </CardTitle>
                <CardDescription>
                  不具合の状況がわかる写真を添付してください（最大5枚・任意）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {images.map((image, index) => {
                      const previewUrl = previewUrls.get(index) || URL.createObjectURL(image);
                      return (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={previewUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(ev) => {
                              const target = ev.target as HTMLImageElement;
                              target.src = URL.createObjectURL(image);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {images.length < 5 && (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">クリックして写真を選択</p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG, HEIC（最大5枚）</p>
                    </div>
                  </label>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  重要事項
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                    <p>
                      報告後、担当者が<strong>24時間以内</strong>にご連絡いたします
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                    <p>状況確認のため、追加の情報提供をお願いする場合があります</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                    <p>破損の程度によっては、作品の返却・交換を行います</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                    <p>緊急の場合は、下記の連絡先に直接お電話ください</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-red-200">
                  <p className="text-sm text-gray-700 mb-3">緊急連絡先</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-red-600" />
                      <span className="text-red-700">03-1234-5678</span>
                      <span className="text-gray-600">（平日 9:00-18:00）</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-red-600" />
                      <span className="text-red-700">emergency@mgj.example.com</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-red-200">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="report"
                      checked={agreedToReport}
                      onCheckedChange={(checked) => setAgreedToReport(checked as boolean)}
                    />
                    <Label htmlFor="report" className="cursor-pointer leading-relaxed">
                      上記の内容を確認し、報告内容に間違いがないことを確認しました
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/corporate-space/${spaceId}`)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={
                !issueType ||
                !issueDescription.trim() ||
                !discoveryDate ||
                !agreedToReport ||
                isSubmitting
              }
              className="bg-red-600 hover:bg-red-700 text-white min-w-[160px] w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  送信中...
                </>
              ) : (
                "報告を送信"
              )}
            </Button>
          </motion.div>
        </form>
      </main>

      <div className="mt-auto shrink-0">
        <Footer />
      </div>
    </div>
  );
}
