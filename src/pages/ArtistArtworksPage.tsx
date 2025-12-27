import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Upload, ArrowRight, Plus, X, Sparkles } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StyleTagsSection } from "@/components/common/StyleTagsSection";
import { createImagePreviewUrl, isHeicFile } from "@/lib/heicConverter";
import { toast } from "sonner";

interface Artwork {
  id: string;
  name: string;
  price: string;
  width: string;
  height: string;
  depth: string;
  year: string;
  theme: string;
  hasFrame: boolean;
  isAIGenerated: boolean;
  files: File[];
  styleTags: string[];
}

export function ArtistArtworksPage() {
  const navigate = useNavigate();

  // ページ遷移時に一番上にスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [artworks, setArtworks] = useState<Artwork[]>([
    {
      id: "1",
      name: "",
      price: "",
      width: "",
      height: "",
      depth: "",
      year: "",
      theme: "",
      hasFrame: false,
      isAIGenerated: false,
      files: [],
      styleTags: [],
    },
  ]);

  // Store preview URLs for each file (key: artworkId-fileIndex, value: preview URL)
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());
  // Store loading states for preview URLs (key: artworkId-fileIndex)
  const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(new Set());

  // 年のリストを生成（1950年から現在まで）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) =>
    (currentYear - i).toString()
  );

  // クリーンアップ: ファイルプレビューのURLを解放
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const addArtwork = () => {
    const newId = (artworks.length + 1).toString();
    setArtworks([
      ...artworks,
      {
        id: newId,
        name: "",
        price: "",
        width: "",
        height: "",
        depth: "",
        year: "",
        theme: "",
        hasFrame: false,
        isAIGenerated: false,
        files: [],
        styleTags: [],
      },
    ]);
  };

  const removeArtwork = (id: string) => {
    if (artworks.length > 1) {
      setArtworks(artworks.filter((artwork) => artwork.id !== id));
    }
  };

  const updateArtwork = (id: string, field: keyof Artwork, value: any) => {
    setArtworks(
      artworks.map((artwork) =>
        artwork.id === id ? { ...artwork, [field]: value } : artwork
      )
    );
  };

  const handleFileChange = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const artwork = artworks.find((a) => a.id === id);
      if (artwork) {
        const currentFileCount = artwork.files.length;
        
        // Validate file sizes
        const invalidFiles = filesArray.filter(
          (file) => file.size > 50 * 1024 * 1024 // 50MB limit
        );
        if (invalidFiles.length > 0) {
          toast.error("ファイルサイズは50MB以下にしてください");
          return;
        }

        // Add files to artwork
        updateArtwork(id, "files", [...artwork.files, ...filesArray]);

        // Mark files as loading
        const newLoadingPreviews = new Set(loadingPreviews);
        const keysToLoad: string[] = [];
        for (let i = 0; i < filesArray.length; i++) {
          const fileIndex = currentFileCount + i;
          const key = `${id}-${fileIndex}`;
          keysToLoad.push(key);
          newLoadingPreviews.add(key);
        }
        setLoadingPreviews(newLoadingPreviews);

        // Create preview URLs for all new files (including HEIC conversion)
        const newPreviewUrls = new Map(previewUrls);
        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];
          const fileIndex = currentFileCount + i;
          const key = `${id}-${fileIndex}`;
          
          try {
            const previewUrl = await createImagePreviewUrl(file);
            newPreviewUrls.set(key, previewUrl);
          } catch (error) {
            console.error("Error creating preview for file:", file.name, error);
            // Fallback to regular object URL if conversion fails
            const fallbackUrl = URL.createObjectURL(file);
            newPreviewUrls.set(key, fallbackUrl);
          } finally {
            // Remove from loading set
            newLoadingPreviews.delete(key);
          }
        }
        setPreviewUrls(newPreviewUrls);
        setLoadingPreviews(newLoadingPreviews);
      }
    }
  };

  const removeFile = async (artworkId: string, fileIndex: number) => {
    const artwork = artworks.find((a) => a.id === artworkId);
    if (artwork) {
      // Clean up preview URL for removed file
      const removedKey = `${artworkId}-${fileIndex}`;
      const removedUrl = previewUrls.get(removedKey);
      if (removedUrl) {
        URL.revokeObjectURL(removedUrl);
      }

      // Remove file from artwork
      const updatedFiles = artwork.files.filter(
        (_, index) => index !== fileIndex
      );
      updateArtwork(artworkId, "files", updatedFiles);

      // Recreate preview URLs for remaining files (to fix indices)
      const newPreviewUrls = new Map(previewUrls);
      
      // Remove all preview URLs for this artwork
      Array.from(newPreviewUrls.keys()).forEach((key) => {
        if (key.startsWith(`${artworkId}-`)) {
          const url = newPreviewUrls.get(key);
          if (url) {
            URL.revokeObjectURL(url);
          }
          newPreviewUrls.delete(key);
        }
      });

      // Recreate preview URLs for remaining files
      for (let i = 0; i < updatedFiles.length; i++) {
        const file = updatedFiles[i];
        const key = `${artworkId}-${i}`;
        try {
          const previewUrl = await createImagePreviewUrl(file);
          newPreviewUrls.set(key, previewUrl);
        } catch (error) {
          console.error("Error creating preview for file:", file.name, error);
          const fallbackUrl = URL.createObjectURL(file);
          newPreviewUrls.set(key, fallbackUrl);
        }
      }

      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Artwork registration data:", artworks);

    // Check if user has already agreed to terms
    const hasAgreed = localStorage.getItem("mgj_artist_terms_agreed");
    if (hasAgreed === "true") {
      // User has already agreed, skip contract page and go directly to artwork selection
      navigate("/artwork-selection");
    } else {
      // User hasn't agreed yet, show contract page
      navigate("/signup/artist/contract");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/30 via-white to-gray-50">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-12"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 mb-4 sm:mb-6">
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 sm:mb-4 px-2">
                作品を登録しましょう
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
                あなたの作品が誰かの心に響きます。
                <br className="hidden sm:block" />
                写真と一緒に、作品の情報を教えてください。
              </p>
            </div>

            {/* 重要なお知らせ */}
            <Card className="border-2 border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
              <CardContent className="p-4 sm:p-6">
                <p className="text-center text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  作品の写真は、あなたの代わりに語ります。
                  <br className="hidden sm:block" />
                  光の当たり方や角度を工夫して、作品の魅力が伝わる写真を撮ってみてください。
                  <br className="hidden sm:block" />
                  後から作品を追加・編集することもできますので、まずは今ある作品から始めましょう。
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 作品登録フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="shadow-xl border-2 relative">
                  {/* 作品番号と削除ボタン */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 sm:gap-3 z-10">
                    <div className="px-2 sm:px-4 py-1 sm:py-2 bg-primary/10 rounded-full">
                      <span className="text-xs sm:text-sm text-primary">
                        作品 {index + 1}
                      </span>
                    </div>
                    {artworks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArtwork(artwork.id)}
                        className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    )}
                  </div>

                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white pr-20 sm:pr-32 pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl">
                      作品情報
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1">
                      写真・動画と作品の詳細をご記入ください
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <div className="space-y-6 sm:space-y-8">
                      {/* 写真・動画アップロード */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="border-l-4 border-l-accent pl-3 sm:pl-4">
                          <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1">
                            作品の写真・動画
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold text-accent">
                              7〜8枚の登録を推奨
                            </span>{" "}
                            - 様々な角度からの写真があると選ばれやすくなります
                          </p>
                        </div>

                        {/* 進捗インジケーター */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                            <span className="text-xs sm:text-sm text-gray-700">
                              登録済み:{" "}
                              <span className="font-bold text-primary">
                                {artwork.files.length}
                              </span>{" "}
                              枚
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600">
                              {artwork.files.length >= 7 ? (
                                <span className="text-green-600 font-semibold">
                                  ✓ 推奨枚数達成！
                                </span>
                              ) : (
                                <span>推奨: 7〜8枚</span>
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                artwork.files.length >= 7
                                  ? "bg-green-500"
                                  : "bg-accent"
                              }`}
                              style={{
                                width: `${Math.min(
                                  (artwork.files.length / 7) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          {artwork.files.length < 7 && (
                            <p className="text-xs text-gray-600 mt-2">
                              💡
                              全体像、部分的なディテール、横からの角度、質感がわかる写真など、多角的な写真をおすすめします
                            </p>
                          )}
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          {/* アップロード済みファイル一覧（プレビュー付き） */}
                          {artwork.files.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                              {artwork.files.map((file, fileIndex) => {
                                const previewKey = `${artwork.id}-${fileIndex}`;
                                const previewUrl = previewUrls.get(previewKey);
                                const isLoading = loadingPreviews.has(previewKey);
                                
                                return (
                                  <div
                                    key={`${artwork.id}-${fileIndex}`}
                                    className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square border-2 border-gray-200 hover:border-accent transition-all"
                                  >
                                    {/* プレビュー画像 */}
                                    <div className="absolute inset-0">
                                      {isLoading ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                          <div className="text-center">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-xs text-gray-600">読み込み中...</p>
                                          </div>
                                        </div>
                                      ) : previewUrl ? (
                                        file.type.startsWith("video/") ? (
                                          <video
                                            src={previewUrl}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <img
                                            src={previewUrl}
                                            alt={`Preview ${fileIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              // Fallback if preview fails
                                              const target = e.target as HTMLImageElement;
                                              const fallbackUrl = URL.createObjectURL(file);
                                              target.src = fallbackUrl;
                                            }}
                                          />
                                        )
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                          <p className="text-xs text-gray-500">プレビュー準備中...</p>
                                        </div>
                                      )}
                                    </div>

                                  {/* 削除ボタン */}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        removeFile(artwork.id, fileIndex)
                                      }
                                      className="text-white hover:text-red-500 hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
                                    >
                                      <X className="w-4 h-4 sm:w-6 sm:h-6" />
                                    </Button>
                                  </div>

                                  {/* ファイル名とインデックス */}
                                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black/70 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                                    #{fileIndex + 1}
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 sm:p-2 truncate">
                                    {file.name}
                                    {isHeicFile(file) && (
                                      <span className="ml-1 text-[10px] opacity-75">(HEIC)</span>
                                    )}
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          )}

                          {/* アップロードボタン */}
                          <label
                            htmlFor={`files-${artwork.id}`}
                            className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-6 sm:py-8 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                              artwork.files.length < 7
                                ? "border-accent bg-accent/5 hover:bg-accent/10 hover:border-accent"
                                : "border-gray-300 hover:border-primary hover:bg-primary/5"
                            }`}
                          >
                            <Upload
                              className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${
                                artwork.files.length < 7
                                  ? "text-accent"
                                  : "text-gray-600"
                              }`}
                            />
                            <div className="text-center">
                              <span className="text-sm sm:text-base text-gray-700 font-medium block">
                                {artwork.files.length === 0
                                  ? "写真をアップロード（7〜8枚推奨）"
                                  : artwork.files.length < 7
                                  ? `さらに写真を追加（あと${
                                      7 - artwork.files.length
                                    }枚で推奨枚数）`
                                  : "写真を追加"}
                              </span>
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                写真・動画（JPG、PNG、HEIC、MP4など、最大50MB）
                              </p>
                            </div>
                          </label>
                          <Input
                            id={`files-${artwork.id}`}
                            type="file"
                            accept="image/*,video/*,.heic,.heif"
                            multiple
                            onChange={(e) => handleFileChange(artwork.id, e)}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* 作品の基本情報 */}
                      <div className="space-y-4 sm:space-y-6">
                        <div className="border-l-4 border-l-primary pl-3 sm:pl-4">
                          <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1">
                            基本情報
                          </h3>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`name-${artwork.id}`}
                              className="text-sm sm:text-base"
                            >
                              作品名 <span className="text-accent">*</span>
                            </Label>
                            <Input
                              id={`name-${artwork.id}`}
                              type="text"
                              placeholder="例：夏の思い出"
                              value={artwork.name}
                              onChange={(e) =>
                                updateArtwork(
                                  artwork.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="h-10 sm:h-12 bg-white text-sm sm:text-base"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`price-${artwork.id}`}
                              className="text-sm sm:text-base"
                            >
                              販売価格（円）{" "}
                              <span className="text-accent">*</span>
                            </Label>
                            <Input
                              id={`price-${artwork.id}`}
                              type="number"
                              placeholder="50000"
                              value={artwork.price}
                              onChange={(e) =>
                                updateArtwork(
                                  artwork.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="h-10 sm:h-12 bg-white text-sm sm:text-base"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm sm:text-base">
                              作品サイズ（額装込み）{" "}
                              <span className="text-accent">*</span>
                            </Label>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">
                            ※ 額縁がある場合は、額縁を含めた外寸をご入力ください
                          </p>
                          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor={`width-${artwork.id}`}
                                className="text-xs sm:text-sm text-gray-600"
                              >
                                幅（cm）
                              </Label>
                              <Input
                                id={`width-${artwork.id}`}
                                type="number"
                                step="0.1"
                                placeholder="45.5"
                                value={artwork.width}
                                onChange={(e) =>
                                  updateArtwork(
                                    artwork.id,
                                    "width",
                                    e.target.value
                                  )
                                }
                                className="h-10 sm:h-12 bg-white text-sm sm:text-base"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`height-${artwork.id}`}
                                className="text-xs sm:text-sm text-gray-600"
                              >
                                高さ（cm）
                              </Label>
                              <Input
                                id={`height-${artwork.id}`}
                                type="number"
                                step="0.1"
                                placeholder="60.0"
                                value={artwork.height}
                                onChange={(e) =>
                                  updateArtwork(
                                    artwork.id,
                                    "height",
                                    e.target.value
                                  )
                                }
                                className="h-10 sm:h-12 bg-white text-sm sm:text-base"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor={`depth-${artwork.id}`}
                                className="text-xs sm:text-sm text-gray-600"
                              >
                                奥行き（cm）
                              </Label>
                              <Input
                                id={`depth-${artwork.id}`}
                                type="number"
                                step="0.1"
                                placeholder="3.0"
                                value={artwork.depth}
                                onChange={(e) =>
                                  updateArtwork(
                                    artwork.id,
                                    "depth",
                                    e.target.value
                                  )
                                }
                                className="h-10 sm:h-12 bg-white text-sm sm:text-base"
                              />
                              <p className="text-xs text-gray-500">
                                ※ 平面作品の場合は空欄可
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`year-${artwork.id}`}
                              className="text-sm sm:text-base"
                            >
                              制作年 <span className="text-accent">*</span>
                            </Label>
                            <Select
                              value={artwork.year || undefined}
                              onValueChange={(value) =>
                                updateArtwork(artwork.id, "year", value)
                              }
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

                          <div className="space-y-2">
                            <Label className="text-sm sm:text-base">
                              額装 <span className="text-accent">*</span>
                            </Label>
                            <div className="flex items-center gap-4 h-10 sm:h-12">
                              <div className="flex items-center space-x-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-md border">
                                <Switch
                                  id={`hasFrame-${artwork.id}`}
                                  checked={artwork.hasFrame}
                                  onCheckedChange={(checked) =>
                                    updateArtwork(
                                      artwork.id,
                                      "hasFrame",
                                      checked
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`hasFrame-${artwork.id}`}
                                  className="cursor-pointer text-sm sm:text-base"
                                >
                                  {artwork.hasFrame ? "額装あり" : "額装なし"}
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* スタイルタグ */}
                      <StyleTagsSection
                        selectedTags={artwork.styleTags}
                        onTagsChange={(tags) =>
                          updateArtwork(artwork.id, "styleTags", tags)
                        }
                        aiRecommendedTags={[
                          "抽象画",
                          "ミニマル",
                          "モダン",
                          "温かみ",
                        ]}
                      />

                      {/* テーマ・ストーリー */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="border-l-4 border-l-accent pl-3 sm:pl-4">
                          <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1">
                            テーマ・ストーリー
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            作品に込めた思いや背景を教えてください
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`theme-${artwork.id}`}
                            className="text-sm sm:text-base"
                          >
                            作品の説明 <span className="text-accent">*</span>
                          </Label>
                          <Textarea
                            id={`theme-${artwork.id}`}
                            placeholder="この作品に込めた思いや、制作のきっかけ、テーマなどを自由にご記入ください。&#10;&#10;例：&#10;夏の海辺で感じた懐かしさと儚さを表現しました。波の音と潮の香り、子供の頃の記憶が重なり合う瞬間を色彩で表現しています。"
                            value={artwork.theme}
                            onChange={(e) =>
                              updateArtwork(artwork.id, "theme", e.target.value)
                            }
                            className="min-h-[120px] sm:min-h-[150px] bg-white resize-y text-sm sm:text-base"
                          />
                          <p className="text-xs text-gray-500">
                            作品を見る人に伝えたいことを、あなたの言葉で書いてみてください
                          </p>
                        </div>
                      </div>

                      {/* AI生成作品フラグ */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="border-l-4 border-l-purple-500 pl-3 sm:pl-4">
                          <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            AI生成作品の明示
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            利用規約で同意いただいた内容です
                          </p>
                        </div>

                        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-transparent">
                          <CardContent className="p-4 sm:p-6">
                            <div className="space-y-3 sm:space-y-4">
                              {/* 質問形式のUI */}
                              <div className="space-y-2 sm:space-y-3">
                                <Label className="text-sm sm:text-base flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                  この作品はAI生成作品ですか？
                                </Label>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                  {/* はい */}
                                  <div
                                    className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 transition-all cursor-pointer ${
                                      artwork.isAIGenerated
                                        ? "bg-purple-100 border-purple-500 shadow-md"
                                        : "bg-white border-gray-300 hover:border-gray-400"
                                    }`}
                                    onClick={() =>
                                      updateArtwork(
                                        artwork.id,
                                        "isAIGenerated",
                                        true
                                      )
                                    }
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div
                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                          artwork.isAIGenerated
                                            ? "border-purple-600 bg-purple-600"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {artwork.isAIGenerated && (
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div
                                          className={`text-sm sm:text-base ${
                                            artwork.isAIGenerated
                                              ? "text-purple-700"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          はい
                                        </div>
                                        <div
                                          className={`text-xs ${
                                            artwork.isAIGenerated
                                              ? "text-purple-600"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          AI技術を使用しています
                                        </div>
                                      </div>
                                      {artwork.isAIGenerated && (
                                        <Badge className="bg-purple-600 text-white text-xs sm:text-sm flex-shrink-0">
                                          AI
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* いいえ */}
                                  <div
                                    className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 transition-all cursor-pointer ${
                                      !artwork.isAIGenerated
                                        ? "bg-gray-100 border-gray-500 shadow-md"
                                        : "bg-white border-gray-300 hover:border-gray-400"
                                    }`}
                                    onClick={() =>
                                      updateArtwork(
                                        artwork.id,
                                        "isAIGenerated",
                                        false
                                      )
                                    }
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div
                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                          !artwork.isAIGenerated
                                            ? "border-gray-600 bg-gray-600"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {!artwork.isAIGenerated && (
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div
                                          className={`text-sm sm:text-base ${
                                            !artwork.isAIGenerated
                                              ? "text-gray-700"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          いいえ
                                        </div>
                                        <div
                                          className={`text-xs ${
                                            !artwork.isAIGenerated
                                              ? "text-gray-600"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          AIを使用していません
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white/70 p-3 sm:p-4 rounded-lg border border-purple-100">
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                  <strong className="text-purple-700">
                                    AI生成作品とは：
                                  </strong>
                                  <br />
                                  AI技術（画像生成AI、画像加工AIなど）を使用して、生成・編集・加工した作品のことです。
                                </p>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mt-2 sm:mt-3">
                                  <strong className="text-purple-700">
                                    明示義務について：
                                  </strong>
                                  <br />
                                  AI技術を使用した作品を投稿する場合は、必ず「はい」を選択してください。
                                  これは利用規約で同意いただいた
                                  <strong>「AI生成物の明示義務」</strong>
                                  に基づくものです。
                                </p>
                                <p className="text-xs text-purple-600 mt-2 sm:mt-3">
                                  ※
                                  違反が確認された場合、作品の削除やアカウント停止の措置を取る場合があります
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* 送信ボタン */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 sm:pt-6 border-t"
            >
              <Card className="border-2 border-primary/30 bg-gradient-to-r from-blue-50 to-transparent mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl text-primary">
                      ご安心ください
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                      <p>
                        ✓
                        次のステップでは、利用規約と契約書の内容をご確認いただきます
                      </p>
                      <p>
                        ✓{" "}
                        <strong>
                          契約に同意しても、作品はまだ公開されません
                        </strong>
                      </p>
                      <p>
                        ✓ 実際の公開は、その次の画面で
                        <strong>
                          あなた自身が「公開する」ボタンを押したとき
                        </strong>
                        に行われます
                      </p>
                      <p>✓ 作品の情報は後から編集することもできます</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto sm:min-w-[300px] h-12 sm:h-14 bg-primary hover:bg-primary/90 text-base sm:text-lg mx-auto flex items-center justify-center gap-2"
              >
                <span>登録して次へ進む</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>
          </form>

          {/* サポートメッセージ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 sm:mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-cream/30 to-transparent border-0 shadow-none">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                  作品の撮影方法や入力内容でお困りの際は、お気軽にお問い合わせください。
                  <br className="hidden sm:block" />
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
