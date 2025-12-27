import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight, Plus, X, Camera, CheckCircle } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ArtistProfileEditPage() {
  const navigate = useNavigate();

  // プロフィール情報
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [artworkDescription, setArtworkDescription] = useState("");
  const [biographies, setBiographies] = useState<{ year: string; content: string }[]>([
    { year: "", content: "" },
  ]);

  // 年のリストを生成（1950年から現在まで）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) =>
    (currentYear - i).toString(),
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // クリーンアップ: photoPreviewのURLを解放
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);

      // プレビュー用のURLを作成（HEIC変換を含む）
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      try {
        const { createImagePreviewUrl } = await import("@/lib/heicConverter");
        const previewUrl = await createImagePreviewUrl(file);
        setPhotoPreview(previewUrl);
      } catch (error) {
        console.error("Error creating preview:", error);
        // Fallback to regular object URL
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
      }
    }
  };

  const addBiography = () => {
    setBiographies([...biographies, { year: "", content: "" }]);
  };

  const removeBiography = (index: number) => {
    if (biographies.length > 1) {
      setBiographies(biographies.filter((_, i) => i !== index));
    }
  };

  const updateBiography = (index: number, field: "year" | "content", value: string) => {
    const updated = [...biographies];
    updated[index][field] = value;
    setBiographies(updated);
  };

  const handleSubmit = () => {
    // プロフィールデータを保存
    console.log("Profile data:", {
      photo,
      artworkDescription,
      biographies,
    });
    navigate("/signup/artist/artworks");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/30 via-white to-gray-50">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 mb-4 sm:mb-6">
              <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 sm:mb-4 px-2">
              プロフィールを充実させましょう
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
              あなたのことをもっと知ってもらうことで、<br className="hidden sm:block" />
              あなたの作品が選ばれやすくなります。
            </p>
          </motion.div>

          {/* フォーム */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white shadow-xl border-2">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  プロフィール情報
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  あなたの創作活動について教えてください
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                {/* プロフィール写真 */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="border-l-4 border-l-accent pl-3 sm:pl-4">
                    <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1">プロフィール写真</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      あなたの写真があれば、より親しみを持ってもらえます（任意）
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo" className="text-sm sm:text-base">
                      写真をアップロード
                    </Label>

                    {/* 写真プレビュー */}
                    {photoPreview && (
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 sm:border-4 border-accent/20 shadow-lg">
                          <img
                            src={photoPreview}
                            alt="プロフィール写真プレビュー"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-4">
                      <label
                        htmlFor="photo"
                        className="flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-all cursor-pointer flex-1 sm:flex-initial"
                      >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700 truncate">
                          {photo ? photo.name : "ファイルを選択"}
                        </span>
                      </label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500">JPG、PNG、HEIC形式（最大5MB）</p>
                  </div>
                </div>

                {/* 経歴 */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="border-l-4 border-l-accent pl-3 sm:pl-4">
                    <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1">来歴・経歴</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      年ごとに活動や展示歴、受賞歴などをご記入ください
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {biographies.map((bio, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-start bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="w-full sm:w-28 md:w-32 flex-shrink-0">
                          <Select
                            value={bio.year}
                            onValueChange={(value) => updateBiography(index, "year", value)}
                          >
                            <SelectTrigger className="h-10 sm:h-12 bg-white text-sm sm:text-base">
                              <SelectValue placeholder="年を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}年
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-grow min-w-0">
                          <Input
                            type="text"
                            placeholder="東京藝術大学 美術学部卒業"
                            value={bio.content}
                            onChange={(e) => updateBiography(index, "content", e.target.value)}
                            className="h-10 sm:h-12 bg-white text-sm sm:text-base"
                          />
                        </div>

                        {biographies.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBiography(index)}
                            className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 hover:text-red-500 hover:bg-red-50 self-start sm:self-auto"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addBiography}
                      className="w-full border-dashed border-2 h-10 sm:h-12 hover:bg-accent/5 hover:border-accent text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      経歴を追加
                    </Button>
                  </div>
                </div>

                {/* 作品説明 */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="border-l-4 border-l-accent pl-3 sm:pl-4">
                    <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1">作品について</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      どのような作品を制作していますか？
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artworkDescription" className="text-sm sm:text-base">
                      作品の説明
                    </Label>
                    <Textarea
                      id="artworkDescription"
                      placeholder="作品のスタイル、テーマ、使用する画材・技法などを教えてください。&#10;&#10;例：&#10;抽象画を中心に制作しています。自然の中にある色彩や形からインスピレーションを得て、アクリル絵の具を使った大胆な色使いが特徴です。"
                      value={artworkDescription}
                      onChange={(e) => setArtworkDescription(e.target.value)}
                      className="min-h-[120px] sm:min-h-[150px] bg-white resize-y text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500">
                      作品を見たことがない人にも伝わるように書いてみてください
                    </p>
                  </div>
                </div>

                {/* 完了メッセージ */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-green-900 mb-1">
                      プロフィールを充実させることで、展示のチャンスが広がります
                    </p>
                    <p className="text-xs sm:text-sm text-green-700">
                      保存後、作品の登録に進みます
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ボタン */}
          <Card className="bg-white mt-4 sm:mt-6">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => navigate("/signup/artist/artworks")}
                  className="w-full sm:w-auto px-4 sm:px-6 order-2 sm:order-1 text-sm sm:text-base"
                >
                  スキップして作品登録へ
                </Button>

                <Button
                  onClick={handleSubmit}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto px-6 sm:px-8 order-1 sm:order-2 text-sm sm:text-base"
                >
                  <span>保存して作品登録へ</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* サポートメッセージ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 sm:mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-cream/30 to-transparent border-0 shadow-none">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                  ご不明な点やご質問がございましたら、お気軽にお問い合わせください。<br className="hidden sm:block" />
                  <a
                    href="mailto:support@microgalleryjapan.com"
                    className="text-primary hover:underline break-all sm:break-normal"
                  >
                    support@microgalleryjapan.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

