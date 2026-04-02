import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { X, Save, Building2, Eye, Package, Image as ImageIcon, Clock, ChevronLeft, ChevronRight, Upload, Sparkles, AlertCircle, Loader2, CheckCircle2, AlertTriangle, Truck, } from "lucide-react";
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
import { artworkService, type Artwork, type ArtworkImage, type ArtistIssueReportItem, isArtworkInTransitFamily, isArtworkReturnedAtArtistFamily, } from "@/services/artwork.service";
import { useAuth } from "@/contexts/AuthContext";
import { StyleTagsSection } from "@/components/common/StyleTagsSection";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
function issueTypeLabel(t: string): string {
    const m: Record<string, string> = {
        damage: "破損",
        stain: "汚れ",
        frame: "額・フレーム",
        delivery: "配送",
        other: "その他",
        missing: "紛失",
        quality: "品質",
    };
    return m[t] ?? t;
}
function issueStatusLabel(s: string): string {
    const m: Record<string, string> = {
        open: "未対応",
        investigating: "調査中",
        resolved: "解決済み",
        rejected: "却下",
    };
    return m[s] ?? s;
}
function formatIssueDate(iso: string | null): string {
    if (!iso)
        return "—";
    try {
        return new Date(iso).toLocaleString("ja-JP");
    }
    catch {
        return iso;
    }
}
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
    const [exhibitionRequestContext, setExhibitionRequestContext] = useState<Awaited<ReturnType<typeof artworkService.getExhibitionRequestContext>> | null>(null);
    const [isLoadingExhibitionRequest, setIsLoadingExhibitionRequest] = useState(false);
    const [markExhibitionShippedSubmitting, setMarkExhibitionShippedSubmitting] = useState(false);
    const [styleTags, setStyleTags] = useState<string[]>([]);
    const [isAIGenerated, setIsAIGenerated] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [confirmArrivalOpen, setConfirmArrivalOpen] = useState(false);
    const [confirmArrivalSubmitting, setConfirmArrivalSubmitting] = useState(false);
    const [issueReports, setIssueReports] = useState<ArtistIssueReportItem[]>([]);
    const [issueReportsLoading, setIssueReportsLoading] = useState(false);
    const [issueModalOpen, setIssueModalOpen] = useState(false);
    const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
    const [originalStyleTags, setOriginalStyleTags] = useState<string[]>([]);
    const [originalIsAIGenerated, setOriginalIsAIGenerated] = useState(false);
    const [originalImages, setOriginalImages] = useState<ArtworkImage[]>([]);
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
    useEffect(() => {
        if (!artworkId || !isInitialized)
            return;
        if (!isAuthenticated || userType !== "artist") {
            toast.error("このページはアーティスト専用です");
            navigate("/login/artist");
            return;
        }
        loadArtwork();
    }, [artworkId, isAuthenticated, userType, isInitialized]);
    const loadIssueReports = async () => {
        if (!artworkId)
            return;
        setIssueReportsLoading(true);
        try {
            const res = await artworkService.listArtworkIssueReports(artworkId);
            setIssueReports(res.items);
        }
        catch {
            setIssueReports([]);
        }
        finally {
            setIssueReportsLoading(false);
        }
    };
    const loadArtwork = async () => {
        if (!artworkId)
            return;
        setIsLoading(true);
        setExhibitionRequestContext(null);
        try {
            const data = await artworkService.getArtwork(artworkId);
            setArtwork(data);
            const loadedFormData: FormData = {
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
            };
            setFormData(loadedFormData);
            setOriginalFormData({ ...loadedFormData });
            const loadedStyleTags = data.style_tags || [];
            setStyleTags(loadedStyleTags);
            setIsAIGenerated(data.is_ai_generated || false);
            setOriginalStyleTags([...loadedStyleTags]);
            setOriginalIsAIGenerated(data.is_ai_generated || false);
            let loadedImages: ArtworkImage[] = [];
            if (data.images && data.images.length > 0) {
                loadedImages = data.images;
                setImages(loadedImages);
                setCurrentImageIndex(0);
            }
            else if (data.main_image_url) {
                loadedImages = [{
                        id: "main",
                        image_url: data.main_image_url,
                        image_order: 0,
                        is_main: true,
                    }];
                setImages(loadedImages);
                setCurrentImageIndex(0);
            }
            setOriginalImages([...loadedImages]);
            void loadIssueReports();
            if (data.status === "published" ||
                data.status === "exhibited" ||
                isArtworkInTransitFamily(data.status)) {
                loadExhibitionInfo();
            }
            if (data.status === "exhibition_requested" ||
                isArtworkInTransitFamily(data.status)) {
                await loadExhibitionRequestContext();
            }
        }
        catch (error: any) {
            console.error("Failed to load artwork:", error);
            toast.error("作品の読み込みに失敗しました");
            navigate("/dashboard#artworks");
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadExhibitionInfo = async () => {
        if (!artworkId)
            return;
        setIsLoadingExhibition(true);
        try {
            const info = await artworkService.getExhibitionInfo(artworkId);
            setExhibitionInfo(info);
        }
        catch (error: any) {
            console.error("Failed to load exhibition info:", error);
            setExhibitionInfo(null);
        }
        finally {
            setIsLoadingExhibition(false);
        }
    };
    useEffect(() => {
        if (!artworkId)
            return;
        const onVis = () => {
            if (document.visibilityState !== "visible")
                return;
            void loadExhibitionInfo();
        };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, [artworkId]);
    const loadExhibitionRequestContext = async () => {
        if (!artworkId)
            return;
        setIsLoadingExhibitionRequest(true);
        try {
            const ctx = await artworkService.getExhibitionRequestContext(artworkId);
            setExhibitionRequestContext(ctx);
        }
        catch (error: unknown) {
            console.error("Failed to load exhibition request context:", error);
            setExhibitionRequestContext(null);
        }
        finally {
            setIsLoadingExhibitionRequest(false);
        }
    };
    const allImages = [
        ...images.map((img) => ({ type: "existing" as const, data: img, url: img.image_url })),
        ...newImageFiles.map((file, index) => ({
            type: "new" as const,
            data: file,
            url: URL.createObjectURL(file)
        }))
    ];
    useEffect(() => {
        if (allImages.length > 0 && currentImageIndex >= allImages.length) {
            setCurrentImageIndex(Math.max(0, allImages.length - 1));
        }
    }, [allImages.length, currentImageIndex]);
    const hasChanges = (): boolean => {
        if (!originalFormData)
            return false;
        const formDataChanged = formData.title !== originalFormData.title ||
            formData.price !== originalFormData.price ||
            formData.lease_price !== originalFormData.lease_price ||
            formData.medium !== originalFormData.medium ||
            formData.year !== originalFormData.year ||
            formData.width !== originalFormData.width ||
            formData.height !== originalFormData.height ||
            formData.depth !== originalFormData.depth ||
            formData.weight !== originalFormData.weight ||
            formData.size_class !== originalFormData.size_class ||
            formData.support !== originalFormData.support ||
            formData.coating !== originalFormData.coating ||
            formData.packaging_info !== originalFormData.packaging_info ||
            formData.maintenance_info !== originalFormData.maintenance_info ||
            formData.description !== originalFormData.description ||
            formData.story !== originalFormData.story ||
            formData.has_frame !== originalFormData.has_frame;
        const styleTagsChanged = styleTags.length !== originalStyleTags.length ||
            styleTags.some((tag, index) => tag !== originalStyleTags[index]) ||
            originalStyleTags.some((tag, index) => tag !== styleTags[index]);
        const aiGeneratedChanged = isAIGenerated !== originalIsAIGenerated;
        const imagesChanged = newImageFiles.length > 0 || imagesToDelete.length > 0;
        return formDataChanged || styleTagsChanged || aiGeneratedChanged || imagesChanged;
    };
    useEffect(() => {
        if (allImages.length <= 1)
            return;
        if (isAutoPlaying && !isHovering) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
            }, 4000);
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
        const imageToDelete = images.find((img) => img.id === imageId);
        if (!imageToDelete)
            return;
        const remainingExistingImages = images.length - imagesToDelete.length - 1;
        const newImagesCount = newImageFiles.length;
        const totalImagesAfterDeletion = remainingExistingImages + newImagesCount;
        if (totalImagesAfterDeletion === 0) {
            toast.error("作品には少なくとも1枚の画像が必要です");
            return;
        }
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        setImagesToDelete((prev) => [...prev, imageId]);
        const newImagesCountAfterDelete = images.length - 1;
        if (currentImageIndex >= newImagesCountAfterDelete) {
            setCurrentImageIndex(Math.max(0, newImagesCountAfterDelete - 1));
        }
    };
    const nextImage = () => {
        const totalImages = images.length + newImageFiles.length;
        if (totalImages === 0)
            return;
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };
    const prevImage = () => {
        const totalImages = images.length + newImageFiles.length;
        if (totalImages === 0)
            return;
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!artworkId)
            return;
        setIsSaving(true);
        try {
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
                }
                catch (uploadError: any) {
                    console.error("Failed to upload image:", uploadError);
                    toast.error(`画像のアップロードに失敗しました: ${file.name}`);
                }
            }
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
                style_tags: styleTags,
                is_ai_generated: isAIGenerated,
            };
            if (uploadedImageUrls.length > 0) {
                updateData.new_image_urls = uploadedImageUrls;
            }
            if (imagesToDelete.length > 0) {
                updateData.delete_image_ids = imagesToDelete;
            }
            await artworkService.updateArtwork(artworkId, updateData);
            toast.success("作品情報を更新しました");
            setNewImageFiles([]);
            setImagesToDelete([]);
            await loadArtwork();
        }
        catch (error: any) {
            console.error("Failed to update artwork:", error);
            toast.error("作品情報の更新に失敗しました: " + (error.message || "不明なエラー"));
        }
        finally {
            setIsSaving(false);
        }
    };
    const handlePublishOnline = async () => {
        if (!artworkId)
            return;
        try {
            await artworkService.publishArtwork(artworkId);
            toast.success("作品をオンライン公開しました");
            await loadArtwork();
        }
        catch (error: any) {
            console.error("Failed to publish artwork:", error);
            toast.error("作品の公開に失敗しました");
        }
    };
    const handleUnpublish = async () => {
        if (!artworkId)
            return;
        try {
            await artworkService.unpublishArtwork(artworkId);
            toast.success("作品を未公開にしました");
            await loadArtwork();
        }
        catch (error: any) {
            console.error("Failed to unpublish artwork:", error);
            toast.error("作品の非公開に失敗しました");
        }
    };
    const handleRecall = () => {
        if (!exhibitionInfo?.assignment || exhibitionInfo.assignment.status !== "displaying") {
            return;
        }
        navigate(`/artwork-recall/${artworkId}`);
    };
    const handleConfirmReturnArrival = async () => {
        if (!artworkId)
            return;
        setConfirmArrivalSubmitting(true);
        try {
            const recallFlow = Boolean(exhibitionInfo?.recall_awaiting_artist_confirm);
            const res = recallFlow
                ? await artworkService.confirmRecallArrival(artworkId)
                : await artworkService.confirmReturnArrival(artworkId);
            toast.success(res.message || "着荷を確認しました");
            setConfirmArrivalOpen(false);
            await loadArtwork();
            await loadExhibitionInfo();
        }
        catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "着荷確認に失敗しました";
            toast.error(msg);
        }
        finally {
            setConfirmArrivalSubmitting(false);
        }
    };
    const handleMarkExhibitionShipped = async () => {
        if (!artworkId)
            return;
        setMarkExhibitionShippedSubmitting(true);
        try {
            const res = await artworkService.markExhibitionShipped(artworkId);
            toast.success(res.message || "発送済みとして登録しました");
            await loadArtwork();
        }
        catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "発送登録に失敗しました";
            toast.error(msg);
        }
        finally {
            setMarkExhibitionShippedSubmitting(false);
        }
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
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    if (!artworkId) {
        return null;
    }
    if (!isInitialized) {
        return (<div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-[#C3A36D] mx-auto mb-4"/>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>);
    }
    if (isLoading) {
        return (<div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-[#C3A36D] mx-auto mb-4"/>
          <p className="text-gray-600">作品を読み込み中...</p>
        </div>
      </div>);
    }
    if (!artwork) {
        return null;
    }
    const activeIssueReports = issueReports.filter((r) => r.status === "open" || r.status === "investigating");
    const hasActiveIssueAlerts = activeIssueReports.length > 0;
    const status = artwork.status;
    const isExhibited = exhibitionInfo?.is_exhibited || false;
    const isAssignmentDisplaying = exhibitionInfo?.assignment?.status === "displaying";
    const isInTransit = isArtworkInTransitFamily(status);
    const isExhibitionOutbound = exhibitionRequestContext?.has_exhibition_request === true;
    const suppressExhibitionRequestCardForRecall = Boolean(exhibitionInfo?.recall_awaiting_artist_confirm ||
        exhibitionInfo?.recall_awaiting_corporate_ship);
    const showArtistExhibitionRequestCard = (isLoadingExhibitionRequest ||
        exhibitionRequestContext?.has_exhibition_request) &&
        !suppressExhibitionRequestCardForRecall;
    const showExhibitionDetailCard = Boolean(exhibitionInfo?.assignment &&
        (isExhibited ||
            exhibitionInfo?.recall_awaiting_artist_confirm ||
            exhibitionInfo?.recall_awaiting_corporate_ship));
    const isExhibitionRequested = status === "exhibition_requested";
    const isDraft = status === "draft";
    const isPublished = status === "published" && !isExhibited;
    const isReturned = isArtworkReturnedAtArtistFamily(status);
    const isSold = status === "sold";
    const safeImageIndex = allImages.length > 0 ? Math.min(currentImageIndex, Math.max(0, allImages.length - 1)) : 0;
    const currentImage = allImages.length > 0 ? allImages[safeImageIndex] : null;
    return (<div className="min-h-screen bg-[#F8F6F1]">
      <Header />

      
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          {hasActiveIssueAlerts && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex gap-3 min-w-0">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5"/>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-900">
                    法人からこの作品に関する不具合・破損の報告があります（{activeIssueReports.length}件）
                  </p>
                  <p className="text-xs text-red-800/90 mt-1">
                    内容を確認し、必要に応じて運営までご連絡ください。
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" className="border-red-300 bg-white text-red-900 hover:bg-red-100 shrink-0" onClick={() => setIssueModalOpen(true)}>
                詳細を見る
              </Button>
            </motion.div>)}

          
          {exhibitionInfo?.recall_awaiting_artist_confirm &&
            isInTransit &&
            exhibitionInfo?.assignment && (<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border-2 border-sky-400/80 bg-gradient-to-r from-sky-50 to-blue-50/90 px-4 py-4 sm:px-6 sm:py-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-sky-950 flex items-center gap-2">
                      <Truck className="w-5 h-5 shrink-0"/>
                      回収向けの作品が発送されました
                    </p>
                    <p className="text-xs sm:text-sm text-sky-900/90 mt-2 leading-relaxed">
                      手元に届いたら、下のボタンで受領を確定してください。確定後、作品は「回収済み」となり、再びギャラリーに出す場合はオンライン公開から公開できます。
                    </p>
                  </div>
                  <Button type="button" size="lg" className="w-full sm:w-auto shrink-0 bg-sky-800 hover:bg-sky-900 text-white px-6" onClick={() => setConfirmArrivalOpen(true)}>
                    <CheckCircle2 className="w-5 h-5 mr-2"/>
                    作品の着荷を確認する
                  </Button>
                </div>
              </motion.div>)}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-3 sm:mb-4">作品プレビュー</h3>
                      
                      
                      {allImages.length > 0 ? (<div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 sm:mb-4" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                          <div className="relative w-full h-full">
                            {allImages.map((img, index) => (<motion.div key={index} initial={false} animate={{
                    opacity: index === currentImageIndex ? 1 : 0,
                    scale: index === currentImageIndex ? 1 : 0.95,
                }} transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                }} className={`absolute inset-0 ${index === currentImageIndex ? "z-10" : "z-0"}`}>
                                <ImageWithFallback src={img.url} alt={`作品プレビュー ${index + 1}`} className="w-full h-full object-cover"/>
                              </motion.div>))}
                          </div>
                          
                          
                          {allImages.length > 1 && (<>
                              <button type="button" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-20" aria-label="前の画像">
                                <ChevronLeft className="w-5 h-5"/>
                              </button>
                              <button type="button" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-20" aria-label="次の画像">
                                <ChevronRight className="w-5 h-5"/>
                              </button>
                            </>)}
                          
                          
                          {allImages.length > 1 && (<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                                {currentImageIndex + 1} / {allImages.length}
                              </div>
                              {isAutoPlaying && !isHovering && (<div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  <span>自動再生</span>
                                </div>)}
                            </div>)}
                        </div>) : (<div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                          <ImageIcon className="w-20 h-20 text-gray-300"/>
                        </div>)}

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base sm:text-lg text-[#3A3A3A]">{formData.title || "作品タイトル"}</h4>
                          {isExhibitionRequested && (<Badge className="bg-orange-600/90 text-white text-[10px] sm:text-xs">
                              展示依頼中
                            </Badge>)}
                          {isInTransit && isExhibitionOutbound && (<Badge className="bg-amber-700/90 text-white text-[10px] sm:text-xs">
                              発送済み（法人受領待ち）
                            </Badge>)}
                          {isInTransit && !isExhibitionOutbound && (<Badge className="bg-amber-600/90 text-white text-[10px] sm:text-xs">
                              返送中
                            </Badge>)}
                        </div>
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

                
                {showArtistExhibitionRequestCard && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
                    <Card className="border-orange-300 bg-orange-50/80">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-700"/>
                          <h3 className="text-sm sm:text-base text-[#3A3A3A]">
                            法人からの展示依頼
                          </h3>
                          {isLoadingExhibitionRequest ? (<Badge variant="outline" className="ml-auto text-xs border-orange-400">
                              読み込み中…
                            </Badge>) : exhibitionRequestContext?.assignment?.status ===
                "pending" ? (<Badge className="bg-orange-600 text-white ml-auto text-xs">
                              発送前
                            </Badge>) : (<Badge className="bg-amber-700 text-white ml-auto text-xs">
                              発送済み
                            </Badge>)}
                        </div>
                        {isLoadingExhibitionRequest ? (<p className="text-xs text-gray-600">発送先情報を取得しています…</p>) : exhibitionRequestContext?.has_exhibition_request ? (<>
                            <p className="text-xs sm:text-sm text-gray-800 mb-4 leading-relaxed">
                              法人がこの作品の展示を希望しています。以下の宛先へ配送し、手元から発送したら「発送済みにする」を押してください。
                            </p>
                            <div className="space-y-3 text-left">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">スペース名</p>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {exhibitionRequestContext.space?.name || "—"}
                                </p>
                                {exhibitionRequestContext.corporate?.company_name && (<p className="text-xs sm:text-sm text-gray-900 mt-0.5">
                                    {exhibitionRequestContext.corporate.company_name}
                                  </p>)}
                              </div>
                              <Separator />
                              {(exhibitionRequestContext.space?.address ||
                    exhibitionRequestContext.corporate?.address_formatted) && (<>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      配送先・住所
                                    </p>
                                    {exhibitionRequestContext.space?.address && (<p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">
                                        {exhibitionRequestContext.space.address}
                                      </p>)}
                                    {exhibitionRequestContext.corporate?.address_formatted && (<p className="text-xs sm:text-sm text-gray-900 mt-2 whitespace-pre-wrap">
                                        {exhibitionRequestContext.corporate.address_formatted}
                                      </p>)}
                                  </div>
                                  <Separator />
                                </>)}
                              {(exhibitionRequestContext.corporate?.contact_name ||
                    exhibitionRequestContext.corporate?.contact_email ||
                    exhibitionRequestContext.corporate?.contact_phone) && (<>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">連絡先</p>
                                    {exhibitionRequestContext.corporate?.contact_name && (<p className="text-xs sm:text-sm text-gray-900">
                                        {exhibitionRequestContext.corporate.contact_name}
                                      </p>)}
                                    {exhibitionRequestContext.corporate?.contact_email && (<p className="text-xs text-gray-600 mt-1 break-all">
                                        {exhibitionRequestContext.corporate.contact_email}
                                      </p>)}
                                    {exhibitionRequestContext.corporate?.contact_phone && (<p className="text-xs text-gray-600">
                                        {exhibitionRequestContext.corporate.contact_phone}
                                      </p>)}
                                  </div>
                                </>)}
                            </div>
                            {exhibitionRequestContext.can_mark_shipped ? (<div className="mt-4 space-y-2">
                                <Button type="button" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={markExhibitionShippedSubmitting} onClick={handleMarkExhibitionShipped}>
                                  {markExhibitionShippedSubmitting ? (<>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                      処理中…
                                    </>) : (<>
                                      <Package className="w-4 h-4 mr-2"/>
                                      発送済みにする（配送API連携予定・現状はモック）
                                    </>)}
                                </Button>
                                <p className="text-[11px] text-orange-900/80 leading-relaxed">
                                  実際に配送したあとに押してください。追跡番号の連携は今後のキャリアAPI実装時に追加します。
                                </p>
                              </div>) : (<p className="text-xs text-amber-900/90 mt-4 p-3 rounded-md bg-amber-100/80 border border-amber-300/60">
                                発送済みとして登録済みです。法人が受領・展示開始を確認するまでお待ちください。
                              </p>)}
                          </>) : null}
                      </CardContent>
                    </Card>
                  </motion.div>)}

                
                {showExhibitionDetailCard && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Card className="border-[#C3A36D]/30 bg-[#C3A36D]/5">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C3A36D]"/>
                          <h3 className="text-sm sm:text-base text-[#3A3A3A]">展示先情報</h3>
                          {isInTransit ? (<Badge className="bg-amber-600 text-white ml-auto text-xs">返送中</Badge>) : (<Badge className="bg-[#C3A36D] text-white ml-auto text-xs">展示中</Badge>)}
                        </div>

                        {exhibitionInfo.recall_awaiting_corporate_ship && (<div className="rounded-md border border-blue-400/80 bg-blue-50 p-3 mb-4 text-left">
                            <p className="text-xs font-semibold text-blue-950 flex items-center gap-2 mb-1.5">
                              <Package className="w-3.5 h-3.5 shrink-0"/>
                              回収依頼を送信済みです
                            </p>
                            <p className="text-[11px] text-blue-900/90 leading-relaxed">
                              法人が作品を発送するまでお待ちください。発送後はこちらで着荷確認ができるようになります。
                            </p>
                          </div>)}

                        {exhibitionInfo.return_request && (<div className="rounded-md border border-amber-400/80 bg-amber-50 p-3 mb-4 text-left">
                            <p className="text-xs font-semibold text-amber-950 flex items-center gap-2 mb-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0"/>
                              法人より返却の申請があります
                            </p>
                            <p className="text-[11px] text-amber-900/90 leading-relaxed">
                              {exhibitionInfo.return_request.status === "pending" ||
                    exhibitionInfo.return_request.status === "approved"
                    ? "法人が作品をアーティスト宛に発送したあと、受領確認ができるようになります。発送は法人側の作業です（アーティストからの発送は不要です）。登録住所をご確認ください。"
                    : "法人が返送を発送済みに登録しました。作品到着後、下のボタンで受領を確認してください。"}
                            </p>
                            {exhibitionInfo.return_request.requested_date && (<p className="text-[11px] text-amber-800 mt-2">
                                申請日:{" "}
                                {new Date(`${exhibitionInfo.return_request.requested_date}T12:00:00`).toLocaleDateString("ja-JP")}
                              </p>)}
                            {exhibitionInfo.return_request.reason && (<p className="text-[11px] text-amber-900/85 mt-1">
                                内容: {exhibitionInfo.return_request.reason}
                              </p>)}
                            <p className="text-[10px] text-amber-800/80 mt-2 font-mono break-all">
                              申請ID: {exhibitionInfo.return_request.id}
                            </p>
                            {isInTransit &&
                    exhibitionInfo.return_request.status === "in_transit" && (<Button type="button" size="sm" className="mt-3 w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white" onClick={() => setConfirmArrivalOpen(true)}>
                                <CheckCircle2 className="w-4 h-4 mr-2"/>
                                作品の着荷を確認する
                              </Button>)}
                          </div>)}

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">展示場所</p>
                            <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.space?.name || "未設定"}</p>
                            {exhibitionInfo.assignment.corporate?.company_name && (<p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.corporate.company_name}</p>)}
                          </div>

                          <Separator />

                          {exhibitionInfo.assignment.space?.address && (<>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">住所</p>
                                <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.space.address}</p>
                          </div>
                          <Separator />
                            </>)}

                          {(exhibitionInfo.assignment.corporate?.contact_name ||
                exhibitionInfo.assignment.corporate?.contact_email ||
                exhibitionInfo.assignment.corporate?.contact_phone) && (<>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">担当者</p>
                                {exhibitionInfo.assignment.corporate.contact_name && (<p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.corporate.contact_name}</p>)}
                                {exhibitionInfo.assignment.corporate.contact_email && (<p className="text-xs text-gray-500 mt-1">{exhibitionInfo.assignment.corporate.contact_email}</p>)}
                                {exhibitionInfo.assignment.corporate.contact_phone && (<p className="text-xs text-gray-500">{exhibitionInfo.assignment.corporate.contact_phone}</p>)}
                          </div>
                          <Separator />
                            </>)}

                          <div className="grid grid-cols-2 gap-3">
                            {exhibitionInfo.assignment.display_start_date && (<div>
                              <p className="text-xs text-gray-500 mb-1">展示開始日</p>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {new Date(exhibitionInfo.assignment.display_start_date).toLocaleDateString('ja-JP')}
                                </p>
                            </div>)}
                            {exhibitionInfo.assignment.exhibition_days > 0 && (<div>
                              <p className="text-xs text-gray-500 mb-1">展示期間</p>
                                <p className="text-xs sm:text-sm text-gray-900">{exhibitionInfo.assignment.exhibition_days}日</p>
                            </div>)}
                          </div>

                          <Separator />

                          <div>
                            <p className="text-xs text-gray-500 mb-1">QRスキャン回数</p>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-[#C3A36D]"/>
                              <p className="text-base sm:text-lg text-[#3A3A3A]">{exhibitionInfo.assignment.qr_scan_count || 0}回</p>
                            </div>
                          </div>
                        </div>

                        {!exhibitionInfo.return_request &&
                !exhibitionInfo.recall_awaiting_corporate_ship && (<div className="mt-4 space-y-2">
                            <Button type="button" variant="outline" disabled={!isAssignmentDisplaying} title={!isAssignmentDisplaying
                    ? "法人が作品を受領し、展示が開始されたあとに利用できます。"
                    : undefined} className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm sm:text-base disabled:opacity-50" onClick={handleRecall}>
                              <Package className="w-4 h-4 mr-2"/>
                              作品を回収する
                            </Button>
                            {!isAssignmentDisplaying && (<p className="text-[11px] text-gray-500 leading-relaxed">
                                発送済みで法人の受領・展示開始前は、回収の手続きに進めません。
                              </p>)}
                          </div>)}
                      </CardContent>
                    </Card>
                  </motion.div>)}

                
                {isDraft && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Card className="border-gray-300 bg-gray-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-gray-500 text-white text-xs">未公開</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 mb-4">
                          この作品はまだオンライン公開されていません。法人ギャラリーに掲載して、より多くの人に見てもらいましょう。
                        </p>
                        <Button className="w-full bg-[#C3A36D] hover:bg-[#C3A36D]/90 text-sm sm:text-base" onClick={handlePublishOnline}>
                          <Eye className="w-4 h-4 mr-2"/>
                          オンライン公開する
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>)}

                
                {isPublished && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Card className="border-green-300 bg-green-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-green-500 text-white text-xs">オンライン公開中</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 mb-4">
                          この作品は法人ギャラリーに公開されています。法人がこの作品を選んで展示することができます。
                        </p>
                        <Button variant="outline" className="w-full border-gray-300 text-sm sm:text-base" onClick={handleUnpublish}>
                          <Eye className="w-4 h-4 mr-2"/>
                          未公開する
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>)}

                
                {isReturned && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Card className="border-gray-300 bg-gray-50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-gray-500 text-white text-xs">回収済み</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 mb-4">
                          この作品は展示先から回収されています。再度オンライン公開することができます。
                        </p>
                        <Button className="w-full bg-[#C3A36D] hover:bg-[#C3A36D]/90 text-sm sm:text-base" onClick={handlePublishOnline}>
                          <Eye className="w-4 h-4 mr-2"/>
                          オンライン公開する
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>)}

                
                {isSold && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
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
                  </motion.div>)}
              </div>
            </div>

            
            <div className="lg:col-span-2">
              {!isSold ? (<form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
                  
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#C3A36D]"/>
                          作品の写真・動画
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          
                          {images.length > 0 && (<div>
                              <Label className="text-sm mb-2 block">現在の画像</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {images.map((img, index) => (<div key={img.id} className="relative group">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                      <img src={img.image_url} alt={`画像 ${index + 1}`} className="w-full h-full object-cover"/>
                                    </div>
                                    <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="画像を削除">
                                      <X className="w-3 h-3"/>
                                    </button>
                                    {img.is_main && (<Badge className="absolute bottom-1 left-1 bg-[#C3A36D] text-white text-xs">メイン</Badge>)}
                                  </div>))}
                              </div>
                            </div>)}

                          
                          {newImageFiles.length > 0 && (<div>
                              <Label className="text-sm mb-2 block">追加する画像</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {newImageFiles.map((file, index) => (<div key={index} className="relative group">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                      <img src={URL.createObjectURL(file)} alt={`新規画像 ${index + 1}`} className="w-full h-full object-cover"/>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="画像を削除">
                                      <X className="w-3 h-3"/>
                                    </button>
                                  </div>))}
                              </div>
                            </div>)}

                          
                          <div>
                            <Label htmlFor="images" className="text-sm sm:text-base">画像をアップロード</Label>
                            <div className="mt-2">
                              <Input id="images" type="file" accept="image/*,.heic,.heif" multiple onChange={handleImageUpload} className="cursor-pointer text-xs sm:text-sm h-10 sm:h-12"/>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              推奨サイズ: 1000 × 1000 px以上、JPEG、PNG、または HEIC形式（複数選択可）
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
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
                          <Input id="title" type="text" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="例：夏の思い出" required/>
                        </div>

                          <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm">
                              販売価格（円）{" "}
                              <span className="text-accent">*</span>
                            </Label>
                            <Input id="price" type="number" value={formData.price} onChange={(e) => handleInputChange("price", Number(e.target.value))} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="50000" min={0} required/>
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
                              <Label htmlFor="width" className="text-xs sm:text-sm text-gray-600">
                                幅（cm）
                              </Label>
                            <Input id="width" type="number" step="0.1" value={formData.width} onChange={(e) => handleInputChange("width", Number(e.target.value))} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="45.5" min={0} required/>
                          </div>

                            <div className="space-y-2">
                              <Label htmlFor="height" className="text-xs sm:text-sm text-gray-600">
                                高さ（cm）
                              </Label>
                              <Input id="height" type="number" step="0.1" value={formData.height} onChange={(e) => handleInputChange("height", Number(e.target.value))} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="60.0" min={0} required/>
                        </div>

                            <div className="space-y-2">
                              <Label htmlFor="depth" className="text-xs sm:text-sm text-gray-600">
                                奥行き（cm）
                              </Label>
                              <Input id="depth" type="number" step="0.1" value={formData.depth} onChange={(e) => handleInputChange("depth", Number(e.target.value))} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="3.0" min={0}/>
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
                          <Select value={String(formData.year)} onValueChange={(value) => handleInputChange("year", Number(value))}>
                              <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base">
                                <SelectValue placeholder="年を選択"/>
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((year) => (<SelectItem key={year} value={String(year)}>
                                    {year}年
                                  </SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">
                              額装 <span className="text-accent">*</span>
                            </Label>
                            <div className="flex items-center gap-4 h-10 sm:h-12">
                              <div className="flex items-center space-x-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-md border">
                                <Switch id="has_frame" checked={formData.has_frame} onCheckedChange={(checked) => handleInputChange("has_frame", checked)}/>
                                <Label htmlFor="has_frame" className="cursor-pointer text-sm sm:text-base">
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
                            <Input id="lease_price" type="number" value={formData.lease_price} onChange={(e) => handleInputChange("lease_price", Number(e.target.value))} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="10000" min={0}/>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="medium" className="text-sm">
                              技法 <span className="text-accent">*</span>
                            </Label>
                            <Select value={formData.medium} onValueChange={(value) => handleInputChange("medium", value)}>
                              <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base">
                                <SelectValue placeholder="技法を選択"/>
                            </SelectTrigger>
                            <SelectContent>
                              {techniqueOptions.map((option) => (<SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>))}
                            </SelectContent>
                          </Select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="weight" className="text-sm">
                              重量（kg）
                            </Label>
                            <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={(e) => handleInputChange("weight", Number(e.target.value))} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="3.5" min={0}/>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="size_class" className="text-sm">
                              サイズクラス
                            </Label>
                            <Select value={formData.size_class} onValueChange={(value) => handleInputChange("size_class", value)}>
                              <SelectTrigger className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base">
                                <SelectValue placeholder="サイズクラスを選択"/>
                              </SelectTrigger>
                              <SelectContent>
                                {sizeClassOptions.map((option) => (<SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="support" className="text-sm">
                              支持体
                            </Label>
                            <Input id="support" value={formData.support} onChange={(e) => handleInputChange("support", e.target.value)} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="例: キャンバス、紙"/>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="coating" className="text-sm">
                              仕上げ
                            </Label>
                            <Input id="coating" value={formData.coating} onChange={(e) => handleInputChange("coating", e.target.value)} className="h-11 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary text-sm sm:text-base" placeholder="例: UV保護ニス仕上げ"/>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    <StyleTagsSection selectedTags={styleTags} onTagsChange={setStyleTags} aiRecommendedTags={[
                "抽象画",
                "ミニマル",
                "モダン",
                "温かみ",
            ]}/>
                  </motion.div>

                  
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
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
                          <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} className="min-h-[120px] sm:min-h-[150px] bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none text-sm sm:text-base" placeholder="この作品に込めた思いや、制作のきっかけ、テーマなどを自由にご記入ください。&#10;&#10;例：&#10;夏の海辺で感じた懐かしさと儚さを表現しました。波の音と潮の香り、子供の頃の記憶が重なり合う瞬間を色彩で表現しています。"/>
                          <p className="text-xs text-gray-500">
                            作品を見る人に伝えたいことを、あなたの言葉で書いてみてください
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="story" className="text-sm">
                            作品のストーリー
                          </Label>
                          <Textarea id="story" value={formData.story} onChange={(e) => handleInputChange("story", e.target.value)} className="min-h-[120px] sm:min-h-[150px] bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none text-sm sm:text-base" placeholder="作品にまつわるストーリーやエピソードを記入してください"/>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm sm:text-base">その他の情報</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                          <Label htmlFor="packaging_info" className="text-sm">梱包情報</Label>
                          <Textarea id="packaging_info" value={formData.packaging_info} onChange={(e) => handleInputChange("packaging_info", e.target.value)} className="mt-2 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none" rows={3} placeholder="梱包に関する注意事項を記入してください"/>
                          </div>

                          <div>
                          <Label htmlFor="maintenance_info" className="text-sm">メンテナンス情報</Label>
                          <Textarea id="maintenance_info" value={formData.maintenance_info} onChange={(e) => handleInputChange("maintenance_info", e.target.value)} className="mt-2 bg-gray-100 border-gray-200 focus:bg-white focus:border-primary resize-none" rows={3} placeholder="メンテナンスに関する注意事項を記入してください"/>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="border-l-4 border-l-purple-500 pl-3 sm:pl-4">
                        <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"/>
                          AI生成作品の明示
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          利用規約で同意いただいた内容です
                        </p>
                      </div>

                      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-transparent">
                        <CardContent className="p-4 sm:p-6">
                          <div className="space-y-3 sm:space-y-4">
                            
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-sm sm:text-base flex items-center gap-2">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"/>
                                この作品はAI生成作品ですか？
                              </Label>

                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                
                                <div className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 transition-all cursor-pointer ${isAIGenerated
                ? "bg-purple-100 border-purple-500 shadow-md"
                : "bg-white border-gray-300 hover:border-gray-400"}`} onClick={() => setIsAIGenerated(true)}>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isAIGenerated
                ? "border-purple-600 bg-purple-600"
                : "border-gray-300"}`}>
                                      {isAIGenerated && (<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"/>)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-sm sm:text-base ${isAIGenerated
                ? "text-purple-700"
                : "text-gray-700"}`}>
                                        はい
                                      </div>
                                      <div className={`text-xs ${isAIGenerated
                ? "text-purple-600"
                : "text-gray-500"}`}>
                                        AI技術を使用しています
                                      </div>
                                    </div>
                                    {isAIGenerated && (<Badge className="bg-purple-600 text-white text-xs sm:text-sm flex-shrink-0">
                                        AI
                                      </Badge>)}
                                  </div>
                                </div>

                                
                                <div className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 transition-all cursor-pointer ${!isAIGenerated
                ? "bg-gray-100 border-gray-500 shadow-md"
                : "bg-white border-gray-300 hover:border-gray-400"}`} onClick={() => setIsAIGenerated(false)}>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${!isAIGenerated
                ? "border-gray-600 bg-gray-600"
                : "border-gray-300"}`}>
                                      {!isAIGenerated && (<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"/>)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-sm sm:text-base ${!isAIGenerated
                ? "text-gray-700"
                : "text-gray-600"}`}>
                                        いいえ
                                      </div>
                                      <div className={`text-xs ${!isAIGenerated
                ? "text-gray-600"
                : "text-gray-500"}`}>
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

                  
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button type="button" variant="outline" size="lg" onClick={handleClose} className="flex-1 w-full sm:w-auto text-sm sm:text-base" disabled={isSaving}>
                      キャンセル
                    </Button>
                    <Button type="submit" size="lg" className="flex-1 w-full sm:w-auto bg-primary hover:bg-primary/90 text-sm sm:text-base" disabled={isSaving || !hasChanges()}>
                      {isSaving ? (<>
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin"/>
                          保存中...
                        </>) : (<>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>
                      変更を保存
                        </>)}
                    </Button>
                  </motion.div>
                </form>) : (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
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
                        {artwork.weight && (<div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">重量</p>
                            <p className="text-sm sm:text-base text-gray-900">{artwork.weight} kg</p>
                        </div>)}
                      </div>
                      {artwork.description && (<div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">説明</p>
                          <p className="text-sm sm:text-base text-gray-900">{artwork.description}</p>
                      </div>)}
                      {artwork.story && (<div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">ストーリー</p>
                          <p className="text-sm sm:text-base text-gray-900">{artwork.story}</p>
                        </div>)}
                      <div className="pt-4">
                        <Button variant="outline" size="lg" onClick={handleClose} className="w-full text-sm sm:text-base">
                          閉じる
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>)}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmArrivalOpen} onOpenChange={setConfirmArrivalOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>作品の着荷を確認しますか？</AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-2">
              <span className="block">
                {exhibitionInfo?.recall_awaiting_artist_confirm
            ? "実際に作品を受け取ったことを確認します。完了すると、アーティストからの回収依頼に伴う返送は完了となり、展示は終了扱いになります。"
            : "実際に作品を受け取ったことを確認します。完了すると、返却申請は完了となり、展示は終了扱いになります。"}
              </span>
              <span className="block text-sm text-muted-foreground">
                ステータスは「回収済み」になります。ギャラリーに再掲載する場合は、あとから「オンライン公開する」から公開してください。
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={confirmArrivalSubmitting}>
              キャンセル
            </AlertDialogCancel>
            <Button type="button" disabled={confirmArrivalSubmitting} onClick={() => void handleConfirmReturnArrival()} className="bg-amber-700 hover:bg-amber-800 text-white">
              {confirmArrivalSubmitting ? (<>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                  処理中…
                </>) : ("着荷を確認する")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-4xl max-w-[min(56rem,calc(100vw-1.5rem))] max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle>不具合・破損の報告</DialogTitle>
            <DialogDescription>
              スペースから届いた報告の一覧です。対応状況は運営が管理します。
            </DialogDescription>
          </DialogHeader>
          {issueReportsLoading ? (<div className="flex items-center justify-center py-8 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2"/>
              読み込み中…
            </div>) : issueReports.length === 0 ? (<p className="text-sm text-muted-foreground py-4">報告はありません。</p>) : (<ul className="space-y-6">
              {issueReports.map((item) => (<li key={item.id} className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 text-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{issueTypeLabel(item.issue_type)}</Badge>
                    <Badge className={item.status === "resolved" || item.status === "rejected"
                    ? "bg-gray-100 text-gray-800 border-gray-200"
                    : "bg-amber-100 text-amber-900 border-amber-200"}>
                      {issueStatusLabel(item.status)}
                    </Badge>
                  </div>
                  {item.space_name && (<p className="text-xs text-gray-600">
                      <span className="font-medium text-gray-700">スペース</span>{" "}
                      {item.space_name}
                    </p>)}
                  <p className="text-[#3A3A3A] whitespace-pre-wrap">{item.description}</p>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>発見: {formatIssueDate(item.discovered_at)}</p>
                    <p>報告日時: {formatIssueDate(item.created_at)}</p>
                  </div>
                  {item.photo_urls && item.photo_urls.length > 0 && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                      {item.photo_urls.map((url, i) => (<a key={`${item.id}-ph-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm hover:opacity-95 transition-opacity">
                          <img src={url} alt={`報告写真 ${i + 1}`} className="w-full max-h-[min(22rem,50vh)] h-auto min-h-[10rem] object-contain"/>
                        </a>))}
                    </div>)}
                </li>))}
            </ul>)}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>);
}
