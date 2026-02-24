import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  X,
  Save,
  Building2,
  Eye,
  Package,
  Image as ImageIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Upload,
  Sparkles,
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
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { artworkService, type Artwork, type ArtworkImage } from "@/services/artwork.service";
import { useAuth } from "@/contexts/AuthContext";
import { StyleTagsSection } from "@/components/common/StyleTagsSection";

type FormData = {
  title: string;
  price: number;
  lease_price: number;
  medium: string;
  year: number;
  width: number;
  height: number;
  depth: number;
  weight: number;
  size_class: string;
  support: string;
  coating: string;
  packaging_info: string;
  maintenance_info: string;
  description: string;
  story: string;
  has_frame: boolean;
};

export function ArtworkEditPage() {
  const navigate = useNavigate();
  const { artworkId } = useParams();
  const { isAuthenticated, userType, isInitialized } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<ArtworkImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [exhibitionInfo, setExhibitionInfo] = useState<any>(null);
  const [isLoadingExhibition, setIsLoadingExhibition] = useState(false);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    price: 0,
    lease_price: 0,
    medium: "",
    year: new Date().getFullYear(),
    width: 0,
    height: 0,
    depth: 0,
    weight: 0,
    size_class: "",
    support: "",
    coating: "",
    packaging_info: "",
    maintenance_info: "",
    description: "",
    story: "",
    has_frame: false,
  });

  // Load artwork data from API
  useEffect(() => {
    if (!artworkId || !isInitialized) return;

    // Check authentication
    if (!isAuthenticated || userType !== "artist") {
      toast.error("このページはアーティスト専用です");
      navigate("/login/artist");
      return;
    }

    loadArtwork();
  }, [artworkId, isAuthenticated, userType, isInitialized]);

  const loadArtwork = async () => {
    if (!artworkId) return;

    setIsLoading(true);
    try {
      const data = await artworkService.getArtwork(artworkId);
      setArtwork(data);

      // Set form data from artwork
      setFormData({
        title: data.title || "",
        price: Number(data.price) || 0,
        lease_price: Number(data.lease_price) || 0,
        medium: data.medium || "",
        year: data.year || new Date().getFullYear(),
        width: data.dimensions?.width || 0,
        height: data.dimensions?.height || 0,
        depth: data.dimensions?.depth || 0,
        weight: Number(data.weight) || 0,
        size_class: data.size_class || "",
        support: data.support || "",
        coating: data.coating || "",
        packaging_info: data.packaging_info || "",
        maintenance_info: data.maintenance_info || "",
        description: data.description || "",
        story: data.story || "",
        has_frame: data.has_frame || false,
      });

      // Set style tags and AI generated flag
      setStyleTags(data.style_tags || []);
      setIsAIGenerated(data.is_ai_generated || false);

      // Set images
      if (data.images && data.images.length > 0) {
        setImages(data.images);
        setCurrentImageIndex(0);
      } else if (data.main_image_url) {
        // Fallback to main_image_url if images array is not available
        setImages([{
          id: "main",
          image_url: data.main_image_url,
          image_order: 0,
          is_main: true,
        }]);
        setCurrentImageIndex(0);
      }

      // Load exhibition information if artwork is published
      if (data.status === "published") {
        loadExhibitionInfo();
      }
    } catch (error: any) {
      console.error("Failed to load artwork:", error);
      toast.error("作品の読み込みに失敗しました");
      navigate("/dashboard#artworks");
    } finally {
      setIsLoading(false);
    }
  };

  const loadExhibitionInfo = async () => {
    if (!artworkId) return;

    setIsLoadingExhibition(true);
    try {
      const info = await artworkService.getExhibitionInfo(artworkId);
      setExhibitionInfo(info);
    } catch (error: any) {
      console.error("Failed to load exhibition info:", error);
      setExhibitionInfo(null);
    } finally {
      setIsLoadingExhibition(false);
    }
  };

  // Combine existing images and new image previews for carousel
  // This needs to be calculated before conditional returns to ensure hooks are called in order
  const allImages = [
    ...images.map((img) => ({ type: "existing" as const, data: img, url: img.image_url })),
    ...newImageFiles.map((file, index) => ({ 
      type: "new" as const, 
      data: file, 
      url: URL.createObjectURL(file) 
    }))
  ];

  // Update index if it's out of bounds - MUST be before any conditional returns
  useEffect(() => {
    if (allImages.length > 0 && currentImageIndex >= allImages.length) {
      setCurrentImageIndex(Math.max(0, allImages.length - 1));
    }
  }, [allImages.length, currentImageIndex]);

  // Auto-play carousel
  useEffect(() => {
    if (allImages.length <= 1) return; // Don't auto-play if only one image
    
    if (isAutoPlaying && !isHovering) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 4000); // Change image every 4 seconds

      return () => clearInterval(interval);
    }
  }, [allImages.length, isAutoPlaying, isHovering]);

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewImageFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = (imageId: string) => {
    // Only delete existing images (not new uploads)
    const imageToDelete = images.find((img) => img.id === imageId);
    if (imageToDelete) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setImagesToDelete((prev) => [...prev, imageId]);
      // Adjust carousel index if needed
      const newImagesCount = images.length - 1;
      if (currentImageIndex >= newImagesCount) {
        setCurrentImageIndex(Math.max(0, newImagesCount - 1));
      }
    }
  };

  const nextImage = () => {
    const totalImages = images.length + newImageFiles.length;
    if (totalImages === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    // Pause auto-play when user manually navigates
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of no interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevImage = () => {
    const totalImages = images.length + newImageFiles.length;
    if (totalImages === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    // Pause auto-play when user manually navigates
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of no interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkId) return;

    setIsSaving(true);
    try {
      // Upload new images first
      const uploadedImageUrls: string[] = [];

      for (const file of newImageFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bucket", "artworks");
          formData.append("subfolder", artwork?.custom_id || artworkId);
          formData.append("generate_sizes", "thumbnail,medium,large");
          formData.append("convert_heic", "true");

          const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/uploads/upload/processed`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("mgj_access_token")}`,
            },
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error("画像のアップロードに失敗しました");
          }

          const uploadData = await uploadResponse.json();
          const imageUrl = uploadData.images?.large?.url || uploadData.images?.medium?.url;
          if (imageUrl) {
            uploadedImageUrls.push(imageUrl);
          }
        } catch (uploadError: any) {
          console.error("Failed to upload image:", uploadError);
          toast.error(`画像のアップロードに失敗しました: ${file.name}`);
        }
      }

      // Update artwork with all fields
      const updateData: any = {
        title: formData.title,
        price: formData.price,
        lease_price: formData.lease_price || undefined,
        medium: formData.medium,
        year: formData.year,
        dimensions: {
          width: formData.width,
          height: formData.height,
          depth: formData.depth || undefined,
        },
        size_class: formData.size_class || undefined,
        support: formData.support || undefined,
        weight: formData.weight || undefined,
        has_frame: formData.has_frame,
        coating: formData.coating || undefined,
        packaging_info: formData.packaging_info || undefined,
        maintenance_info: formData.maintenance_info || undefined,
        description: formData.description || undefined,
        story: formData.story || undefined,
        style_tags: styleTags,  // Always send array (empty array clears tags)
        is_ai_generated: isAIGenerated,
      };

      // Add new image URLs if any were uploaded
      if (uploadedImageUrls.length > 0) {
        updateData.new_image_urls = uploadedImageUrls;
      }

      // Add image IDs to delete if any were marked for deletion
      if (imagesToDelete.length > 0) {
        updateData.delete_image_ids = imagesToDelete;
      }

      await artworkService.updateArtwork(artworkId, updateData);

    toast.success("作品情報を更新しました");
      
      // Clear new image files and deletion list after successful update
      setNewImageFiles([]);
      setImagesToDelete([]);
      
      // Reload artwork to get updated data
      await loadArtwork();
    } catch (error: any) {
      console.error("Failed to update artwork:", error);
      toast.error("作品情報の更新に失敗しました: " + (error.message || "不明なエラー"));
    } finally {
      setIsSaving(false);
    }
  };

  // オンライン公開する
  const handlePublishOnline = async () => {
    if (!artworkId) return;

    try {
      await artworkService.publishArtwork(artworkId);
    toast.success("作品をオンライン公開しました");
      await loadArtwork();
    } catch (error: any) {
      console.error("Failed to publish artwork:", error);
      toast.error("作品の公開に失敗しました");
    }
  };

  // オンライン公開を停止する（未公開にする）
  const handleUnpublish = async () => {
    if (!artworkId) return;

    try {
      await artworkService.unpublishArtwork(artworkId);
    toast.success("作品を未公開にしました");
      await loadArtwork();
    } catch (error: any) {
      console.error("Failed to unpublish artwork:", error);
      toast.error("作品の非公開に失敗しました");
    }
  };

  // 作品を回収する
  const handleRecall = () => {
    navigate(`/artwork-recall/${artworkId}`);
  };

  const handleClose = () => {
    navigate("/dashboard#artworks");
  };

  const techniqueOptions = [
    { value: "oil", label: "油彩" },
    { value: "acrylic", label: "アクリル" },
    { value: "watercolor", label: "水彩" },
    { value: "mixed-media", label: "ミクストメディア" },
    { value: "digital", label: "デジタル" },
    { value: "other", label: "その他" },
  ];

  const sizeClassOptions = [
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];

  // 年のリストを生成（1950年から現在まで）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) =>
    currentYear - i
  );

  if (!artworkId) {
    return null;
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-[#C3A36D] mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-[#C3A36D] mx-auto mb-4" />
          <p className="text-gray-600">作品を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return null;
  }

  const status = artwork.status;
  const isExhibited = exhibitionInfo?.is_exhibited || false;
  const isDraft = status === "draft";
  const isPublished = status === "published" && !isExhibited;
  const isReturned = status === "recalled";
  const isSold = status === "sold";

  // Ensure currentImageIndex is within bounds
  const safeImageIndex = allImages.length > 0 ? Math.min(currentImageIndex, Math.max(0, allImages.length - 1)) : 0;
  const currentImage = allImages.length > 0 ? allImages[safeImageIndex] : null;

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
                      
                      {/* Image Carousel */}
                      {allImages.length > 0 ? (
                        <div 
                          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 sm:mb-4"
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                        >
                          <div className="relative w-full h-full">
                            {allImages.map((img, index) => (
                              <motion.div
                                key={index}
                                initial={false}
                                animate={{
                                  opacity: index === currentImageIndex ? 1 : 0,
                                  scale: index === currentImageIndex ? 1 : 0.95,
                                }}
                                transition={{
                                  duration: 0.6,
                                  ease: "easeInOut",
                                }}
                                className={`absolute inset-0 ${
                                  index === currentImageIndex ? "z-10" : "z-0"
                                }`}
                              >
                                <ImageWithFallback
                                  src={img.url}
                                  alt={`作品プレビュー ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </motion.div>
                            ))}
                          </div>
                          
                          {/* Navigation arrows */}
                          {allImages.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-20"
                                aria-label="前の画像"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-20"
                                aria-label="次の画像"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          {/* Image counter and auto-play indicator */}
                          {allImages.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                                {currentImageIndex + 1} / {allImages.length}
                              </div>
                              {isAutoPlaying && !isHovering && (
                                <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  <span>自動再生</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                          <ImageIcon className="w-20 h-20 text-gray-300" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-base sm:text-lg text-[#3A3A3A]">{formData.title || "作品タイトル"}</h4>
                        <p className="text-lg sm:text-xl text-[#C3A36D]">¥{(formData.price || 0).toLocaleString()}</p>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                          <p>
                            {techniqueOptions.find((opt) => opt.value === formData.medium)?.label || formData.medium} / {formData.year}年
                          </p>
                          <p>
                            {formData.width} × {formData.height} {formData.depth > 0 ? `× ${formData.depth}` : ""} cm
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 展示情報 */}
                {isExhibited && exhibitionInfo?.assignment && (
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
                            <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.space?.name || "未設定"}</p>
                            {exhibitionInfo.assignment.corporate?.company_name && (
                              <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.corporate.company_name}</p>
                            )}
                          </div>

                          <Separator />

                          {exhibitionInfo.assignment.space?.address && (
                            <>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">住所</p>
                                <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.space.address}</p>
                          </div>
                          <Separator />
                            </>
                          )}

                          {(exhibitionInfo.assignment.corporate?.contact_name ||
                            exhibitionInfo.assignment.corporate?.contact_email ||
                            exhibitionInfo.assignment.corporate?.contact_phone) && (
                            <>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">担当者</p>
                                {exhibitionInfo.assignment.corporate.contact_name && (
                                  <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.corporate.contact_name}</p>
                                )}
                                {exhibitionInfo.assignment.corporate.contact_email && (
                                  <p className="text-xs text-gray-500 mt-1">{exhibitionInfo.assignment.corporate.contact_email}</p>
                                )}
                                {exhibitionInfo.assignment.corporate.contact_phone && (
                                  <p className="text-xs text-gray-500">{exhibitionInfo.assignment.corporate.contact_phone}</p>
                                )}
                          </div>
                          <Separator />
                            </>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {exhibitionInfo.assignment.display_start_date && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">展示開始日</p>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {new Date(exhibitionInfo.assignment.display_start_date).toLocaleDateString('ja-JP')}
                                </p>
                            </div>
                            )}
                            {exhibitionInfo.assignment.exhibition_days > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">展示期間</p>
                                <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.exhibition_days}日</p>
                            </div>
                            )}
                          </div>

                          <Separator />

                          <div>
                            <p className="text-xs text-gray-500 mb-1">QRスキャン回数</p>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-[#C3A36D]" />
                              <p className="text-base sm:text-lg text-[#3A3A3A]">{exhibitionInfo.assignment.qr_scan_count || 0}回</p>
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
                          作品の写真・動画
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Existing images grid */}
                          {images.length > 0 && (
                          <div>
                              <Label className="text-sm mb-2 block">現在の画像</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {images.map((img, index) => (
                                  <div key={img.id} className="relative group">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                      <img
                                        src={img.image_url}
                                        alt={`画像 ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteImage(img.id)}
                                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label="画像を削除"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                    {img.is_main && (
                                      <Badge className="absolute bottom-1 left-1 bg-[#C3A36D] text-white text-xs">メイン</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New images preview */}
                          {newImageFiles.length > 0 && (
                            <div>
                              <Label className="text-sm mb-2 block">追加する画像</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {newImageFiles.map((file, index) => (
                                  <div key={index} className="relative group">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={`新規画像 ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveNewImage(index)}
                                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label="画像を削除"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Upload button */}
                          <div>
                            <Label htmlFor="images" className="text-sm sm:text-base">画像をアップロード</Label>
                            <div className="mt-2">
                              <Input
                                id="images"
                                type="file"
                                accept="image/*,.heic,.heif"
                                multiple
                                onChange={handleImageUpload}
                                className="cursor-pointer text-xs sm:text-sm h-10 sm:h-12"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              推奨サイズ: 1000 × 1000 px以上、JPEG、PNG、または HEIC形式（複数選択可）
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* 作品の基本情報 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="border-l-4 border-l-primary pl-3 sm:pl-4">
                          <CardTitle className="text-base sm:text-lg md:text-xl text-primary mb-1">
                            基本情報
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm">
                              作品名 <span className="text-accent">*</span>
                            </Label>
                          <Input
                            id="title"
                              type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                              className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                              placeholder="例：夏の思い出"
                            required
                          />
                        </div>

                          <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm">
                              販売価格（円）{" "}
                              <span className="text-accent">*</span>
                            </Label>
                            <Input
                              id="price"
                              type="number"
                              value={formData.price}
                              onChange={(e) => handleInputChange("price", Number(e.target.value))}
                              className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                              placeholder="50000"
                              min={0}
                              required
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
                                htmlFor="width"
                                className="text-xs sm:text-sm text-gray-600"
                              >
                                幅（cm）
                              </Label>
                            <Input
                                id="width"
                              type="number"
                                step="0.1"
                                value={formData.width}
                                onChange={(e) => handleInputChange("width", Number(e.target.value))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                                placeholder="45.5"
                                min={0}
                              required
                            />
                          </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="height"
                                className="text-xs sm:text-sm text-gray-600"
                              >
                                高さ（cm）
                              </Label>
                              <Input
                                id="height"
                                type="number"
                                step="0.1"
                                value={formData.height}
                                onChange={(e) => handleInputChange("height", Number(e.target.value))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                                placeholder="60.0"
                                min={0}
                                required
                              />
                        </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="depth"
                                className="text-xs sm:text-sm text-gray-600"
                              >
                                奥行き（cm）
                              </Label>
                              <Input
                                id="depth"
                                type="number"
                                step="0.1"
                                value={formData.depth}
                                onChange={(e) => handleInputChange("depth", Number(e.target.value))}
                                className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                                placeholder="3.0"
                                min={0}
                              />
                              <p className="text-xs text-gray-500">
                                ※ 平面作品の場合は空欄可
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="year" className="text-sm">
                              制作年 <span className="text-accent">*</span>
                            </Label>
                          <Select
                              value={String(formData.year)}
                              onValueChange={(value) => handleInputChange("year", Number(value))}
                            >
                              <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base">
                                <SelectValue placeholder="年を選択" />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year} value={String(year)}>
                                    {year}年
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">
                              額装 <span className="text-accent">*</span>
                            </Label>
                            <div className="flex items-center gap-4 h-10 sm:h-12">
                              <div className="flex items-center space-x-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-md border">
                                <Switch
                                  id="has_frame"
                                  checked={formData.has_frame}
                                  onCheckedChange={(checked) => handleInputChange("has_frame", checked)}
                                />
                                <Label
                                  htmlFor="has_frame"
                                  className="cursor-pointer text-sm sm:text-base"
                                >
                                  {formData.has_frame ? "額装あり" : "額装なし"}
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="lease_price" className="text-sm">
                              レンタル価格（円/月）
                            </Label>
                            <Input
                              id="lease_price"
                              type="number"
                              value={formData.lease_price}
                              onChange={(e) => handleInputChange("lease_price", Number(e.target.value))}
                              className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                              placeholder="10000"
                              min={0}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="medium" className="text-sm">
                              技法 <span className="text-accent">*</span>
                            </Label>
                            <Select
                              value={formData.medium}
                              onValueChange={(value) => handleInputChange("medium", value)}
                            >
                              <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base">
                                <SelectValue placeholder="技法を選択" />
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
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="weight" className="text-sm">
                              重量（kg）
                            </Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.1"
                              value={formData.weight}
                              onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                              className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                              placeholder="3.5"
                              min={0}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="size_class" className="text-sm">
                              サイズクラス
                            </Label>
                            <Select
                              value={formData.size_class}
                              onValueChange={(value) => handleInputChange("size_class", value)}
                            >
                              <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base">
                                <SelectValue placeholder="サイズクラスを選択" />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeClassOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="support" className="text-sm">
                              支持体
                            </Label>
                            <Input
                              id="support"
                              value={formData.support}
                              onChange={(e) => handleInputChange("support", e.target.value)}
                              className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                              placeholder="例: キャンバス、紙"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="coating" className="text-sm">
                              仕上げ
                            </Label>
                            <Input
                              id="coating"
                              value={formData.coating}
                              onChange={(e) => handleInputChange("coating", e.target.value)}
                              className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base"
                              placeholder="例: UV保護ニス仕上げ"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* スタイルタグ */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <StyleTagsSection
                      selectedTags={styleTags}
                      onTagsChange={setStyleTags}
                      aiRecommendedTags={[
                        "抽象画",
                        "ミニマル",
                        "モダン",
                        "温かみ",
                      ]}
                    />
                  </motion.div>

                  {/* テーマ・ストーリー */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="border-l-4 border-l-accent pl-3 sm:pl-4">
                          <CardTitle className="text-base sm:text-lg md:text-xl text-primary mb-1">
                            テーマ・ストーリー
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600">
                            作品に込めた思いや背景を教えてください
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm">
                            作品の説明
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            className="min-h-[120px] sm:min-h-[150px] bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none text-sm sm:text-base"
                            placeholder="この作品に込めた思いや、制作のきっかけ、テーマなどを自由にご記入ください。&#10;&#10;例：&#10;夏の海辺で感じた懐かしさと儚さを表現しました。波の音と潮の香り、子供の頃の記憶が重なり合う瞬間を色彩で表現しています。"
                          />
                          <p className="text-xs text-gray-500">
                            作品を見る人に伝えたいことを、あなたの言葉で書いてみてください
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="story" className="text-sm">
                            作品のストーリー
                          </Label>
                          <Textarea
                            id="story"
                            value={formData.story}
                            onChange={(e) => handleInputChange("story", e.target.value)}
                            className="min-h-[120px] sm:min-h-[150px] bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none text-sm sm:text-base"
                            placeholder="作品にまつわるストーリーやエピソードを記入してください"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* その他の情報 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm sm:text-base">その他の情報</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                          <Label htmlFor="packaging_info" className="text-sm">梱包情報</Label>
                          <Textarea
                            id="packaging_info"
                            value={formData.packaging_info}
                            onChange={(e) => handleInputChange("packaging_info", e.target.value)}
                            className="mt-2 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none"
                            rows={3}
                            placeholder="梱包に関する注意事項を記入してください"
                            />
                          </div>

                          <div>
                          <Label htmlFor="maintenance_info" className="text-sm">メンテナンス情報</Label>
                          <Textarea
                            id="maintenance_info"
                            value={formData.maintenance_info}
                            onChange={(e) => handleInputChange("maintenance_info", e.target.value)}
                            className="mt-2 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none"
                            rows={3}
                            placeholder="メンテナンスに関する注意事項を記入してください"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* AI生成作品フラグ */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
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
                                    isAIGenerated
                                      ? "bg-purple-100 border-purple-500 shadow-md"
                                      : "bg-white border-gray-300 hover:border-gray-400"
                                  }`}
                                  onClick={() => setIsAIGenerated(true)}
                                >
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div
                                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        isAIGenerated
                                          ? "border-purple-600 bg-purple-600"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isAIGenerated && (
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className={`text-sm sm:text-base ${
                                          isAIGenerated
                                            ? "text-purple-700"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        はい
                                      </div>
                                      <div
                                        className={`text-xs ${
                                          isAIGenerated
                                            ? "text-purple-600"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        AI技術を使用しています
                                      </div>
                                    </div>
                                    {isAIGenerated && (
                                      <Badge className="bg-purple-600 text-white text-xs sm:text-sm flex-shrink-0">
                                        AI
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* いいえ */}
                                <div
                                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 transition-all cursor-pointer ${
                                    !isAIGenerated
                                      ? "bg-gray-100 border-gray-500 shadow-md"
                                      : "bg-white border-gray-300 hover:border-gray-400"
                                  }`}
                                  onClick={() => setIsAIGenerated(false)}
                                >
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div
                                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        !isAIGenerated
                                          ? "border-gray-600 bg-gray-600"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {!isAIGenerated && (
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className={`text-sm sm:text-base ${
                                          !isAIGenerated
                                            ? "text-gray-700"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        いいえ
                                      </div>
                                      <div
                                        className={`text-xs ${
                                          !isAIGenerated
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
                  </motion.div>

                  {/* 保存ボタン */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleClose}
                      className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                      disabled={isSaving}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 w-full sm:w-auto bg-primary hover:bg-primary/90 text-sm sm:text-base"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      変更を保存
                        </>
                      )}
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
                          <p className="text-sm sm:text-base text-gray-900">{artwork.title}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">価格</p>
                          <p className="text-sm sm:text-base text-gray-900">¥{artwork.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">技法</p>
                          <p className="text-sm sm:text-base text-gray-900">
                            {techniqueOptions.find((opt) => opt.value === artwork.medium)?.label || artwork.medium}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">制作年</p>
                          <p className="text-sm sm:text-base text-gray-900">{artwork.year}年</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">サイズ</p>
                          <p className="text-sm sm:text-base text-gray-900">
                            {artwork.dimensions?.width} × {artwork.dimensions?.height} {artwork.dimensions?.depth ? `× ${artwork.dimensions.depth}` : ""} cm
                          </p>
                        </div>
                        {artwork.weight && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">重量</p>
                            <p className="text-sm sm:text-base text-gray-900">{artwork.weight} kg</p>
                        </div>
                        )}
                      </div>
                      {artwork.description && (
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">説明</p>
                          <p className="text-sm sm:text-base text-gray-900">{artwork.description}</p>
                      </div>
                      )}
                      {artwork.story && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">ストーリー</p>
                          <p className="text-sm sm:text-base text-gray-900">{artwork.story}</p>
                        </div>
                      )}
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
