import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { artworkService, type Artwork } from "@/services/artwork.service";
import { assignSpaceArtwork } from "@/services/space.service";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, Search, ArrowLeft, } from "lucide-react";
type Step = "pick" | "confirm";
const PAGE_SIZE = 12;
const ARTWORK_LIST_SCROLL_CLASS = "min-h-[280px] max-h-[min(60vh,640px)] overflow-y-scroll overscroll-y-contain px-4 sm:px-6 py-3 " +
    "[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.28)_#e5e7eb] " +
    "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 " +
    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400";
function artworkThumb(a: Artwork): string {
    return (a.main_image_url ||
        a.images?.find((i) => i.is_main)?.image_url ||
        a.images?.[0]?.image_url ||
        "");
}
function formatPriceJpy(n: number): string {
    return `¥${Number(n).toLocaleString("ja-JP")}`;
}
export interface ManualArtworkSelectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    spaceId: string;
    currentArtworkId?: string | null;
    currentArtworkTitle?: string | null;
    pendingExhibitionArtworkId?: string | null;
    pendingExhibitionTitle?: string | null;
    spaceBlocksNewExhibitionRequest?: boolean;
    onAssigned: () => void | Promise<void>;
}
export function ManualArtworkSelectDialog({ open, onOpenChange, spaceId, currentArtworkId, currentArtworkTitle, pendingExhibitionArtworkId, pendingExhibitionTitle, spaceBlocksNewExhibitionRequest = false, onAssigned, }: ManualArtworkSelectDialogProps) {
    const [step, setStep] = useState<Step>("pick");
    const [listTab, setListTab] = useState<"all" | "favorites">("all");
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<Artwork[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [listLoading, setListLoading] = useState(false);
    const [selected, setSelected] = useState<Artwork | null>(null);
    const [assigning, setAssigning] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
        return () => clearTimeout(t);
    }, [searchInput]);
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, listTab]);
    useEffect(() => {
        if (open) {
            setStep("pick");
            setSelected(null);
            setPage(1);
            setSearchInput("");
            setListTab("all");
        }
    }, [open]);
    useEffect(() => {
        if (!open || step !== "pick")
            return;
        let cancelled = false;
        const run = async () => {
            setListLoading(true);
            try {
                if (listTab === "all") {
                    const res = await artworkService.listArtworks({
                        status: "published",
                        page,
                        page_size: PAGE_SIZE,
                        search: debouncedSearch || undefined,
                        sort_by: "published_at",
                        sort_order: "desc",
                        eligible_for_corporate_assignment: true,
                    });
                    if (cancelled)
                        return;
                    setItems(res.items);
                    const tp = res.total_pages;
                    const computed = typeof tp === "number" && tp >= 1
                        ? tp
                        : Math.max(1, Math.ceil((res.total || 0) / PAGE_SIZE));
                    setTotalPages(computed);
                }
                else {
                    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.CORPORATE_FAVORITES) || "[]");
                    const ids: string[] = Array.isArray(raw)
                        ? raw.map(String).slice(0, 40)
                        : [];
                    const results = await Promise.all(ids.map((id) => artworkService.getArtwork(id).catch(() => null)));
                    let pubs = results.filter((x): x is Artwork => x != null &&
                        x.status === "published");
                    const q = debouncedSearch.toLowerCase();
                    if (q) {
                        pubs = pubs.filter((a) => a.title.toLowerCase().includes(q) ||
                            (a.artist?.name || "").toLowerCase().includes(q));
                    }
                    if (cancelled)
                        return;
                    setItems(pubs);
                    setTotalPages(1);
                }
            }
            catch (e) {
                console.error(e);
                if (!cancelled) {
                    setItems([]);
                    setTotalPages(1);
                    toast.error(e instanceof Error ? e.message : "作品一覧の取得に失敗しました");
                }
            }
            finally {
                if (!cancelled)
                    setListLoading(false);
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [open, step, listTab, page, debouncedSearch]);
    const handleAssign = async () => {
        if (!selected)
            return;
        if (spaceBlocksHardBlock)
            return;
        if (pendingPipelineConflict)
            return;
        setAssigning(true);
        try {
            const res = await assignSpaceArtwork(spaceId, {
                artwork_id: selected.id,
                assignment_reason: "manual_selection",
            });
            toast.success(res.message || "展示依頼を処理しました");
            onOpenChange(false);
            await onAssigned();
        }
        catch (e) {
            console.error(e);
            toast.error(e instanceof Error ? e.message : "展示依頼の送信に失敗しました");
        }
        finally {
            setAssigning(false);
        }
    };
    const replacingWallDisplay = Boolean(currentArtworkId) &&
        String(currentArtworkId) !== String(selected?.id);
    const pendingPipelineConflict = Boolean(pendingExhibitionArtworkId &&
        selected &&
        String(pendingExhibitionArtworkId) !== String(selected.id));
    const sameAsPendingPipeline = Boolean(pendingExhibitionArtworkId &&
        selected &&
        String(pendingExhibitionArtworkId) === String(selected.id));
    const spaceBlocksHardBlock = Boolean(spaceBlocksNewExhibitionRequest) &&
        Boolean(selected) &&
        !(pendingExhibitionArtworkId &&
            String(pendingExhibitionArtworkId) === String(selected.id));
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl sm:max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="px-4 sm:px-6 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="text-base sm:text-lg pr-8">
            {step === "pick"
            ? "展示する作品を選ぶ"
            : "展示依頼を送りますか？"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-left">
            {step === "pick"
            ? "オンライン公開中で、どのスペースでも壁に載っておらず、別スペース含め展示依頼・発送手続き中でもない作品だけが表示されます。依頼後はアーティストが発送し、受領確認で壁の展示が始まります。"
            : pendingPipelineConflict
                ? "このスペースでは別の作品への展示手続きが進行中です。完了するまで別の作品を選べません。"
                : replacingWallDisplay
                    ? "現在壁に別の作品が展示中の場合でも、ここでは「新しい作品への展示依頼」を送ります。既存の展示は、新しい作品の受領・展示開始までそのままです。"
                    : "選択した作品に対して展示依頼を送ります。アーティストの発送後、受領確認で展示が始まります。"}
          </DialogDescription>
        </DialogHeader>

        {step === "pick" ? (<>
            <div className="px-4 sm:px-6 py-3 space-y-3 shrink-0 border-b border-border/60">
              {spaceBlocksNewExhibitionRequest && (<p className="text-[11px] sm:text-xs rounded-md bg-red-50 border border-red-200 text-red-900 px-3 py-2 leading-relaxed">
                  このスペースではすでに作品の展示手続き（依頼〜輸送中）が進行中です。完了するまで別の作品は選べません。
                </p>)}
              {pendingExhibitionArtworkId && (<p className="text-[11px] sm:text-xs rounded-md bg-amber-50 border border-amber-200 text-amber-950 px-3 py-2 leading-relaxed">
                  {pendingExhibitionTitle ? (<>
                      このスペースでは「{pendingExhibitionTitle}
                      」への展示手続きが進行中です。別の作品を選ぶと確認画面では送信できません（同じ作品なら手続きの確認のみです）。
                    </>) : (<>
                      このスペースでは別の作品への展示手続きが進行中です。別作品を選ぶと確認画面では送信できません。
                    </>)}
                </p>)}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"/>
                <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={listTab === "all"
                ? "タイトル・作家名で検索"
                : "お気に入りを絞り込み"} className="pl-10 sm:pl-11" autoComplete="off"/>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted/80 border border-border/60">
                <button type="button" onClick={() => setListTab("all")} className={`rounded-md py-2 text-xs sm:text-sm font-medium transition-colors ${listTab === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"}`}>
                  公開作品
                </button>
                <button type="button" onClick={() => setListTab("favorites")} className={`rounded-md py-2 text-xs sm:text-sm font-medium transition-colors ${listTab === "favorites"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"}`}>
                  お気に入り
                </button>
              </div>
              {listTab === "favorites" && (<p className="text-[11px] text-muted-foreground">
                  ダッシュボードの「お気に入り」で保存した作品が対象です（最大40件まで読み込み）。
                </p>)}
            </div>

            <div className={cn("flex-1 min-h-0 border-y border-border/50", ARTWORK_LIST_SCROLL_CLASS)}>
              <div className="space-y-2.5 pb-1">
                {listLoading ? (<div className="flex justify-center py-14 text-muted-foreground text-sm gap-2">
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    読み込み中…
                  </div>) : items.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-12">
                    {listTab === "favorites"
                    ? "該当するお気に入りの公開作品がありません。"
                    : "作品が見つかりません。"}
                  </p>) : (items.map((a) => (<button key={a.id} type="button" onClick={() => {
                    if (spaceBlocksNewExhibitionRequest &&
                        (!pendingExhibitionArtworkId ||
                            String(pendingExhibitionArtworkId) !== String(a.id))) {
                        toast.error("このスペースでは別の展示手続きが進行中です。完了してから作品を選び直してください。");
                        return;
                    }
                    setSelected(a);
                    setStep("confirm");
                }} className="w-full flex gap-4 p-2.5 sm:p-3 rounded-xl border border-border/80 hover:bg-muted/50 text-left transition-colors">
                      <div className="w-[5.5rem] h-[5.5rem] sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted shrink-0 ring-1 ring-border/60">
                        <ImageWithFallback src={artworkThumb(a)} alt="" className="w-full h-full object-cover"/>
                      </div>
                      <div className="min-w-0 flex-1 py-1 flex flex-col justify-center">
                        <p className="font-medium text-sm sm:text-base line-clamp-2">
                          {a.title}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">
                          {a.artist?.name || "アーティスト"}
                        </p>
                        <p className="text-sm text-primary font-medium mt-2">
                          {formatPriceJpy(a.price)}
                        </p>
                      </div>
                    </button>)))}
              </div>
            </div>

            {listTab === "all" && totalPages > 1 && (<div className="flex items-center justify-center gap-2 py-2 border-t shrink-0">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1 || listLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="w-4 h-4"/>
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {page} / {totalPages}
                </span>
                <Button type="button" variant="outline" size="sm" disabled={page >= totalPages || listLoading} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-4 h-4"/>
                </Button>
              </div>)}
          </>) : (selected && (<div className="px-4 sm:px-6 py-4 space-y-4 max-h-[min(55vh,520px)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.28)_#e5e7eb] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
              {pendingPipelineConflict && (<div className="text-xs sm:text-sm rounded-lg bg-red-50 border border-red-200 text-red-900 px-3 py-2">
                  進行中の展示依頼:
                  {pendingExhibitionTitle ? (<span className="font-medium">「{pendingExhibitionTitle}」</span>) : ("別の作品")}
                  。別の作品を選ぶ場合は、当該手続きが完了してから再度お試しください。
                </div>)}
              {sameAsPendingPipeline && !pendingPipelineConflict && (<div className="text-xs sm:text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2">
                  この作品への展示依頼はすでに進行中です。送信しても手続きは継続されます（重複登録はされません）。
                </div>)}
              {replacingWallDisplay &&
                currentArtworkTitle &&
                !pendingPipelineConflict && (<div className="text-xs sm:text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2">
                    壁面では現在「{currentArtworkTitle}
                    」を展示中です。新しい作品への依頼を送っても、既存の展示は受領確認まで続きます。
                  </div>)}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full max-w-[14rem] sm:max-w-none sm:w-44 aspect-square rounded-xl overflow-hidden bg-muted mx-auto sm:mx-0 shrink-0 ring-1 ring-border/60">
                  <ImageWithFallback src={artworkThumb(selected)} alt="" className="w-full h-full object-cover"/>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold text-base">{selected.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.artist?.name || "アーティスト"}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {formatPriceJpy(selected.price)}
                  </p>
                </div>
              </div>
            </div>))}

        <DialogFooter className="px-4 sm:px-6 py-3 border-t shrink-0 flex-col-reverse sm:flex-row gap-2">
          {step === "confirm" ? (<>
              <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={assigning} onClick={() => {
                setStep("pick");
                setSelected(null);
            }}>
                <ArrowLeft className="w-4 h-4 mr-2"/>
                戻る
              </Button>
              <Button type="button" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent" disabled={assigning || pendingPipelineConflict || spaceBlocksHardBlock} onClick={() => void handleAssign()}>
                {assigning ? (<>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    送信中…
                  </>) : ("展示依頼を送る")}
              </Button>
            </>) : (<Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              閉じる
            </Button>)}
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
