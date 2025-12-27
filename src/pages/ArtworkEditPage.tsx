import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  X,
  Save,
  MapPin,
  Building2,
  Calendar,
  Eye,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

// モックデータ - 実際にはartworkIdに基づいてAPIから取得
const getMockArtwork = (id: string) => {
  // IDに応じて異なるステータスの作品を返す（デモ用）
  const artworks: Record<string, any> = {
    "1": {
      id: "1",
      title: "夏の思い出",
      status: "exhibited", // draft, published, exhibited, sold, returned
      exhibition: {
        location: "The Tokyo Hotel",
        venueName: "株式会社サンプル　本社ビル",
        venueAddress: "東京都渋谷区渋谷1-1-1",
        contactName: "山田 太郎",
        contactEmail: "yamada@sample-corp.jp",
        contactPhone: "03-1234-5678",
        startDate: "2024-12-01",
        qrScans: 23,
      },
    },
    "3": {
      id: "3",
      title: "静寂",
      status: "published",
    },
    "5": {
      id: "5",
      title: "冬の詩",
      status: "sold",
    },
    "6": {
      id: "6",
      title: "記憶の断片",
      status: "returned",
    },
    "7": {
      id: "7",
      title: "春の訪れ",
      status: "draft",
    },
  };

  const artwork = artworks[id || "1"] || artworks["1"];

  return {
    ...artwork,
    price: 50000,
    technique: "oil",
    year: 2024,
    width: 72.7,
    height: 53.0,
    depth: 2.0,
    weight: 3.5,
    theme: "summer-landscape",
    description: "夏の穏やかな風景を描いた作品です。光と影のコントラストを表現しました。",
    tags: ["風景", "モダン"],
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop",
  };
};

type FormData = {
  title: string;
  price: number;
  technique: string;
  year: number;
  width: number;
  height: number;
  depth: number;
  weight: number;
  theme: string;
  description: string;
  tags: string;
};

export function ArtworkEditPage() {
  const navigate = useNavigate();
  const { artworkId } = useParams();
  const mockArtwork = getMockArtwork(artworkId || "1");
  const [imagePreview, setImagePreview] = useState(mockArtwork.image);

  const [formData, setFormData] = useState<FormData>({
    title: mockArtwork.title,
    price: mockArtwork.price,
    technique: mockArtwork.technique,
    year: mockArtwork.year,
    width: mockArtwork.width,
    height: mockArtwork.height,
    depth: mockArtwork.depth,
    weight: mockArtwork.weight,
    theme: mockArtwork.theme,
    description: mockArtwork.description,
    tags: mockArtwork.tags.join(", "),
  });

  const status = mockArtwork.status;
  const isExhibited = status === "exhibited";
  const isDraft = status === "draft";
  const isPublished = status === "published";
  const isReturned = status === "returned";
  const isSold = status === "sold";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("作品情報を更新しました");
    // 実際にはAPIを呼び出して保存
  };

  // オンライン公開する
  const handlePublishOnline = () => {
    toast.success("作品をオンライン公開しました");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  // オンライン公開を停止する（未公開にする）
  const handleUnpublish = () => {
    toast.success("作品を未公開にしました");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  // 作品を回収する
  const handleRecall = () => {
    navigate(`/artwork-recall/${artworkId}`);
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  // 展示期間を計算
  const calculateExhibitionDays = () => {
    if (!isExhibited || !mockArtwork.exhibition) return 0;
    const startDate = new Date(mockArtwork.exhibition.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const exhibitionDays = calculateExhibitionDays();

  const techniqueOptions = [
    { value: "oil", label: "油彩" },
    { value: "acrylic", label: "アクリル" },
    { value: "watercolor", label: "水彩" },
    { value: "mixed-media", label: "ミクストメディア" },
    { value: "digital", label: "デジタル" },
    { value: "other", label: "その他" },
  ];

  const themeOptions = [
    { value: "summer-landscape", label: "夏の風景" },
    { value: "urban", label: "都市" },
    { value: "nature", label: "自然" },
    { value: "abstract", label: "抽象" },
    { value: "portrait", label: "人物" },
    { value: "still-life", label: "静物" },
    { value: "other", label: "その他" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      {/* メインコンテンツ */}
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* 左側：作品プレビュー */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-3 sm:mb-4">作品プレビュー</h3>
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 sm:mb-4">
                        <ImageWithFallback
                          src={imagePreview}
                          alt="作品プレビュー"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base sm:text-lg text-[#3A3A3A]">{formData.title || "作品タイトル"}</h4>
                        <p className="text-lg sm:text-xl text-[#C3A36D]">¥{(formData.price || 0).toLocaleString()}</p>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                          <p>
                            {techniqueOptions.find((opt) => opt.value === formData.technique)?.label || formData.technique} / {formData.year}年
                          </p>
                          <p>
                            {formData.width} × {formData.height} × {formData.depth} cm
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 展示情報 */}
                {isExhibited && mockArtwork.exhibition && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card className="border-[#C3A36D]/30 bg-[#C3A36D]/5">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C3A36D]" />
                          <h3 className="text-sm sm:text-base text-[#3A3A3A]">展示先情報</h3>
                          <Badge className="bg-[#C3A36D] text-white ml-auto text-xs">展示中</Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">展示場所</p>
                            <p className="text-xs sm:text-sm text-gray-900">{mockArtwork.exhibition.location}</p>
                            <p className="text-xs sm:text-sm text-gray-900">{mockArtwork.exhibition.venueName}</p>
                          </div>

                          <Separator />

                          <div>
                            <p className="text-xs text-gray-500 mb-1">住所</p>
                            <p className="text-xs sm:text-sm text-gray-900">{mockArtwork.exhibition.venueAddress}</p>
                          </div>

                          <Separator />

                          <div>
                            <p className="text-xs text-gray-500 mb-1">担当者</p>
                            <p className="text-xs sm:text-sm text-gray-900">{mockArtwork.exhibition.contactName}</p>
                            <p className="text-xs text-gray-500 mt-1">{mockArtwork.exhibition.contactEmail}</p>
                            <p className="text-xs text-gray-500">{mockArtwork.exhibition.contactPhone}</p>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">展示開始日</p>
                              <p className="text-xs sm:text-sm text-gray-900">{mockArtwork.exhibition.startDate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">展示期間</p>
                              <p className="text-xs sm:text-sm text-gray-900">{exhibitionDays}日</p>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <p className="text-xs text-gray-500 mb-1">QRスキャン回数</p>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-[#C3A36D]" />
                              <p className="text-base sm:text-lg text-[#3A3A3A]">{mockArtwork.exhibition.qrScans}回</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm sm:text-base"
                          onClick={handleRecall}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          作品を回収する
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 未公開の場合 */}
                {isDraft && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card className="border-gray-300 bg-gray-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-gray-500 text-white text-xs">未公開</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 mb-4">
                          この作品はまだオンライン公開されていません。法人ギャラリーに掲載して、より多くの人に見てもらいましょう。
                        </p>
                        <Button
                          className="w-full bg-[#C3A36D] hover:bg-[#C3A36D]/90 text-sm sm:text-base"
                          onClick={handlePublishOnline}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          オンライン公開する
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* オンライン公開中の場合 */}
                {isPublished && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card className="border-green-300 bg-green-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-green-500 text-white text-xs">オンライン公開中</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 mb-4">
                          この作品は法人ギャラリーに公開されています。法人がこの作品を選んで展示することができます。
                        </p>
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 text-sm sm:text-base"
                          onClick={handleUnpublish}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          未公開する
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 回収済みの場合 */}
                {isReturned && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card className="border-gray-300 bg-gray-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-gray-500 text-white text-xs">回収済み</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 mb-4">
                          この作品は展示先から回収されています。再度オンライン公開することができます。
                        </p>
                        <Button
                          className="w-full bg-[#C3A36D] hover:bg-[#C3A36D]/90 text-sm sm:text-base"
                          onClick={handlePublishOnline}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          オンライン公開する
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 売却済みの場合 */}
                {isSold && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Card className="border-blue-300 bg-blue-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-blue-500 text-white text-xs">売却済み</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 mb-2">
                          この作品は売却済みです。おめでとうございます！
                        </p>
                        <p className="text-xs text-gray-600">
                          売却済みの作品は編集や回収ができません。
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 右側：編集フォーム */}
            <div className="lg:col-span-2">
              {/* 売却済みの場合はフォームを表示しない */}
              {!isSold ? (
                <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
                  {/* 作品画像 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#C3A36D]" />
                          作品画像
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="image" className="text-sm sm:text-base">画像をアップロード</Label>
                            <div className="mt-2">
                              <Input
                                id="image"
                                type="file"
                                accept="image/*,.heic,.heif"
                                onChange={handleImageChange}
                                className="cursor-pointer text-xs sm:text-sm h-10 sm:h-12"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              推奨サイズ: 1000 × 1000 px以上、JPEG、PNG、または HEIC形式
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* 基本情報 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm sm:text-base">基本情報</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-sm sm:text-base">作品タイトル *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            placeholder="例: 夏の思い出"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price" className="text-sm sm:text-base">販売価格（円） *</Label>
                            <Input
                              id="price"
                              type="number"
                              value={formData.price}
                              onChange={(e) => handleInputChange("price", Number(e.target.value))}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                              placeholder="50000"
                              min={0}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="year" className="text-sm sm:text-base">制作年 *</Label>
                            <Input
                              id="year"
                              type="number"
                              value={formData.year}
                              onChange={(e) => handleInputChange("year", Number(e.target.value))}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                              placeholder="2024"
                              min={1900}
                              max={2100}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="technique" className="text-sm sm:text-base">技法 *</Label>
                          <Select
                            value={formData.technique}
                            onValueChange={(value) => handleInputChange("technique", value)}
                          >
                            <SelectTrigger className="mt-2 h-10 sm:h-12 text-sm sm:text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {techniqueOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-sm sm:text-base">作品の説明</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="mt-2 text-sm sm:text-base"
                            rows={4}
                            placeholder="作品のコンセプトや制作背景などを記入してください"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tags" className="text-sm sm:text-base">タグ（カンマ区切り）</Label>
                          <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => handleInputChange("tags", e.target.value)}
                            className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                            placeholder="例: 風景, モダン, 夏"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            複数のタグをカンマで区切って入力してください
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* サイズ */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm sm:text-base">サイズ</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                          <div>
                            <Label htmlFor="width" className="text-sm sm:text-base">幅（cm） *</Label>
                            <Input
                              id="width"
                              type="number"
                              step="0.1"
                              value={formData.width}
                              onChange={(e) => handleInputChange("width", Number(e.target.value))}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                              placeholder="72.7"
                              min={0}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="height" className="text-sm sm:text-base">高さ（cm） *</Label>
                            <Input
                              id="height"
                              type="number"
                              step="0.1"
                              value={formData.height}
                              onChange={(e) => handleInputChange("height", Number(e.target.value))}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                              placeholder="53.0"
                              min={0}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="depth" className="text-sm sm:text-base">奥行き（cm） *</Label>
                            <Input
                              id="depth"
                              type="number"
                              step="0.1"
                              value={formData.depth}
                              onChange={(e) => handleInputChange("depth", Number(e.target.value))}
                              className="mt-2 h-10 sm:h-12 text-sm sm:text-base"
                              placeholder="2.0"
                              min={0}
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* テーマ */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm sm:text-base">テーマ</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Label htmlFor="theme" className="text-sm sm:text-base">作品のテーマを選択してください *</Label>
                        <Select
                          value={formData.theme}
                          onValueChange={(value) => handleInputChange("theme", value)}
                        >
                          <SelectTrigger className="mt-2 h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {themeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* 保存ボタン */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleClose}
                      className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 w-full sm:w-auto bg-primary hover:bg-primary/90 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      変更を保存
                    </Button>
                  </motion.div>
                </form>
              ) : (
                /* 売却済みの場合は読み取り専用の情報表示 */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base">作品情報</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">作品名</p>
                          <p className="text-sm sm:text-base text-gray-900">{mockArtwork.title}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">価格</p>
                          <p className="text-sm sm:text-base text-gray-900">¥{mockArtwork.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">技法</p>
                          <p className="text-sm sm:text-base text-gray-900">
                            {techniqueOptions.find((opt) => opt.value === mockArtwork.technique)?.label || mockArtwork.technique}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">制作年</p>
                          <p className="text-sm sm:text-base text-gray-900">{mockArtwork.year}年</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">サイズ</p>
                          <p className="text-sm sm:text-base text-gray-900">
                            {mockArtwork.width} × {mockArtwork.height} × {mockArtwork.depth} cm
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">重量</p>
                          <p className="text-sm sm:text-base text-gray-900">{mockArtwork.weight} kg</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">説明</p>
                        <p className="text-sm sm:text-base text-gray-900">{mockArtwork.description}</p>
                      </div>
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleClose}
                          className="w-full text-sm sm:text-base"
                        >
                          閉じる
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

