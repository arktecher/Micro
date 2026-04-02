import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArtworkFilters } from "@/components/artworks/ArtworkFilters";
import { ArtworkGrid } from "@/components/artworks/ArtworkGrid";
import { SortOptions } from "@/components/artworks/SortOptions";
import { SORT_OPTIONS } from "@/data/artworks";
import { artworkService } from "@/services/artwork.service";
import type { Artwork as CatalogArtwork } from "@/types/artwork";
import { mapApiArtworkToCatalogArtwork } from "@/utils/catalogArtworkMapper";
import { buildCatalogListParams, type CatalogSortId, } from "@/utils/artworkCatalogQuery";
import { readCatalogSearchParamsFromLocation, parseArtworksCatalogUrl, serializeArtworksCatalogUrl, type ArtworksCatalogUrlState, } from "@/utils/artworksCatalogUrl";
function getVisiblePageNumbers(current: number, total: number): number[] {
    if (total <= 0)
        return [];
    if (total <= 9) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const windowSize = 9;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    let end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
export function ArtworksPage() {
    const navigate = useNavigate();
    const [, setSearchParams] = useSearchParams();
    const initialCatalog = useMemo(() => parseArtworksCatalogUrl(readCatalogSearchParamsFromLocation()), []);
    const [searchQuery, setSearchQuery] = useState(initialCatalog.searchQuery);
    const [debouncedSearch, setDebouncedSearch] = useState(initialCatalog.searchQuery);
    const [artistName, setArtistName] = useState(initialCatalog.artistName);
    const [debouncedArtistName, setDebouncedArtistName] = useState(initialCatalog.artistName);
    const [selectedSort, setSelectedSort] = useState<CatalogSortId>(initialCatalog.selectedSort);
    const [selectedColors, setSelectedColors] = useState<string[]>(initialCatalog.selectedColors);
    const [selectedSizes, setSelectedSizes] = useState<string[]>(initialCatalog.selectedSizes);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>(initialCatalog.selectedPriceRanges);
    const [selectedTechniques, setSelectedTechniques] = useState<string[]>(initialCatalog.selectedTechniques);
    const [selectedStyles, setSelectedStyles] = useState<string[]>(initialCatalog.selectedStyles);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInput, setPageInput] = useState("1");
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [artworks, setArtworks] = useState<CatalogArtwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const filterSig = useMemo(() => JSON.stringify({
        debouncedSearch,
        debouncedArtistName,
        selectedSort,
        selectedColors,
        selectedSizes,
        selectedPriceRanges,
        selectedTechniques,
        selectedStyles,
    }), [
        debouncedSearch,
        debouncedArtistName,
        selectedSort,
        selectedColors,
        selectedSizes,
        selectedPriceRanges,
        selectedTechniques,
        selectedStyles,
    ]);
    const prevFilterSigRef = useRef<string | null>(null);
    const lastPushedUrlRef = useRef<string | null>(null);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedArtistName(artistName), 400);
        return () => clearTimeout(t);
    }, [artistName]);
    useEffect(() => {
        lastPushedUrlRef.current = readCatalogSearchParamsFromLocation().toString();
    }, []);
    useEffect(() => {
        const urlState: ArtworksCatalogUrlState = {
            searchQuery: debouncedSearch,
            artistName: debouncedArtistName,
            selectedSort,
            currentPage,
            selectedColors,
            selectedSizes,
            selectedPriceRanges,
            selectedTechniques,
            selectedStyles,
        };
        const next = serializeArtworksCatalogUrl(urlState);
        const nextStr = next.toString();
        const cur = readCatalogSearchParamsFromLocation().toString();
        if (nextStr === cur) {
            lastPushedUrlRef.current = cur;
            return;
        }
        lastPushedUrlRef.current = nextStr;
        setSearchParams(next, { replace: true });
    }, [
        debouncedSearch,
        debouncedArtistName,
        selectedSort,
        currentPage,
        selectedColors,
        selectedSizes,
        selectedPriceRanges,
        selectedTechniques,
        selectedStyles,
        setSearchParams,
    ]);
    useEffect(() => {
        const onLocationChange = () => {
            const incoming = readCatalogSearchParamsFromLocation().toString();
            if (incoming === lastPushedUrlRef.current)
                return;
            lastPushedUrlRef.current = incoming;
            const p = parseArtworksCatalogUrl(readCatalogSearchParamsFromLocation());
            setSearchQuery(p.searchQuery);
            setDebouncedSearch(p.searchQuery);
            setArtistName(p.artistName);
            setDebouncedArtistName(p.artistName);
            setSelectedSort(p.selectedSort);
            setCurrentPage(p.currentPage);
            setSelectedColors(p.selectedColors);
            setSelectedSizes(p.selectedSizes);
            setSelectedPriceRanges(p.selectedPriceRanges);
            setSelectedTechniques(p.selectedTechniques);
            setSelectedStyles(p.selectedStyles);
        };
        window.addEventListener("hashchange", onLocationChange);
        window.addEventListener("popstate", onLocationChange);
        return () => {
            window.removeEventListener("hashchange", onLocationChange);
            window.removeEventListener("popstate", onLocationChange);
        };
    }, []);
    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);
    useEffect(() => {
        const first = prevFilterSigRef.current === null;
        const changed = !first && prevFilterSigRef.current !== filterSig;
        prevFilterSigRef.current = filterSig;
        if (changed && currentPage !== 1) {
            setCurrentPage(1);
            return;
        }
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const params = buildCatalogListParams({
                    page: currentPage,
                    debouncedSearch,
                    debouncedArtistName,
                    selectedSort,
                    selectedColors,
                    selectedSizes,
                    selectedPriceRanges,
                    selectedTechniques,
                    selectedStyles,
                });
                const res = await artworkService.listArtworks(params);
                if (cancelled)
                    return;
                setArtworks(res.items.map(mapApiArtworkToCatalogArtwork));
                setTotalCount(res.total);
                setTotalPages(res.total_pages ?? 0);
            }
            catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "作品一覧の読み込みに失敗しました");
                    setArtworks([]);
                    setTotalCount(0);
                    setTotalPages(0);
                }
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, [filterSig, currentPage]);
    const visiblePages = useMemo(() => getVisiblePageNumbers(currentPage, totalPages), [currentPage, totalPages]);
    const handleClearFilters = () => {
        setSelectedColors([]);
        setSelectedSizes([]);
        setSelectedPriceRanges([]);
        setSelectedTechniques([]);
        setSelectedStyles([]);
        setArtistName("");
        setDebouncedArtistName("");
    };
    const handleArtworkClick = (artworkId: string) => {
        navigate(`/artwork/${artworkId}?source=site`);
    };
    const handlePageChange = (page: number) => {
        if (page < 1)
            return;
        if (totalPages > 0 && page > totalPages)
            return;
        setCurrentPage(page);
        setPageInput(page.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handlePreviousPage = () => {
        if (currentPage > 1)
            handlePageChange(currentPage - 1);
    };
    const handleNextPage = () => {
        if (totalPages > 0 && currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };
    const handleGoToPage = () => {
        const page = parseInt(pageInput, 10);
        if (!isNaN(page) && page >= 1 && (totalPages === 0 || page <= totalPages)) {
            handlePageChange(page);
        }
        else {
            setPageInput(currentPage.toString());
        }
    };
    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter")
            handleGoToPage();
    };
    return (<div className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-[1600px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-primary mb-2 sm:mb-3">
              掲載作品
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Micro Galleryで展示されている作品をご覧いただけます
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-6 sm:mb-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
              <Input type="text" placeholder="作品名・作家名・タグで検索" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 sm:h-14 lg:h-16 pl-12 sm:pl-14 pr-4 sm:pr-6 text-base sm:text-lg bg-gray-50 border-gray-200 focus:bg-white"/>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8 sm:mb-12">
            <SortOptions options={SORT_OPTIONS} selected={selectedSort} onSelect={(id) => setSelectedSort(id as CatalogSortId)}/>
          </motion.div>

          <Separator className="mb-8 sm:mb-12"/>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full lg:w-72 lg:flex-shrink-0 mb-6 lg:mb-0">
              <ArtworkFilters selectedColors={selectedColors} selectedSizes={selectedSizes} selectedPriceRanges={selectedPriceRanges} selectedTechniques={selectedTechniques} selectedStyles={selectedStyles} artistName={artistName} onColorsChange={setSelectedColors} onSizesChange={setSelectedSizes} onPriceRangesChange={setSelectedPriceRanges} onTechniquesChange={setSelectedTechniques} onStylesChange={setSelectedStyles} onArtistNameChange={setArtistName} onClearAll={handleClearFilters}/>
            </motion.aside>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex-1">
              {error && (<div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>)}

              {loading ? (<div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-gray-500">
                  <Loader2 className="h-10 w-10 animate-spin"/>
                  <p className="text-sm">読み込み中…</p>
                </div>) : (<>
                  {!error && totalCount > 0 && (<p className="mb-4 text-sm text-gray-500">
                      {totalCount} 件
                      {totalPages > 1
                    ? `（${currentPage} / ${totalPages} ページ）`
                    : ""}
                    </p>)}
                  {!error && artworks.length === 0 ? (<div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center text-gray-600">
                      <p className="text-base">該当する作品が見つかりませんでした</p>
                      <p className="mt-2 text-sm text-gray-500">
                        条件を変えて再度お試しください
                      </p>
                    </div>) : (<ArtworkGrid artworks={artworks} onArtworkClick={handleArtworkClick}/>)}
                </>)}

              {!loading && totalPages > 1 && (<div className="mt-12 sm:mt-16">
                  <div className="lg:hidden flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2">
                      <Input type="number" min="1" max={totalPages} value={pageInput} onChange={(e) => setPageInput(e.target.value)} onKeyDown={handlePageInputKeyDown} className="w-20 h-10 text-center" placeholder="ページ"/>
                      <span className="text-sm text-gray-600">
                        / {totalPages}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1} className="flex-1">
                        前へ
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages} className="flex-1">
                        次へ
                      </Button>
                      <Button variant="default" size="sm" onClick={handleGoToPage} className="flex-1">
                        移動
                      </Button>
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-wrap justify-center items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                      前へ
                    </Button>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {visiblePages.map((page) => (<Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" className="w-10" onClick={() => handlePageChange(page)}>
                          {page}
                        </Button>))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages}>
                      次へ
                    </Button>
                  </div>
                </div>)}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>);
}
