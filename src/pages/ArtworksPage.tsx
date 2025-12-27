import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Search } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { ArtworkFilters } from "@/components/artworks/ArtworkFilters";
import { ArtworkGrid } from "@/components/artworks/ArtworkGrid";
import { SortOptions } from "@/components/artworks/SortOptions";

import { SAMPLE_ARTWORKS, SORT_OPTIONS } from "@/data/artworks";
import { filterArtworks, sortArtworks } from "@/utils/artworkUtils";

export function ArtworksPage() {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const totalPages = 5; // This would come from API in real app

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync page input with current page
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Filter and sort artworks
  const filteredArtworks = filterArtworks(SAMPLE_ARTWORKS, {
    searchQuery,
    selectedColors,
    selectedSizes,
    selectedPriceRanges,
    selectedTechniques,
  });

  const sortedArtworks = sortArtworks(filteredArtworks, selectedSort);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPriceRanges([]);
    setSelectedTechniques([]);
    setSelectedStyles([]);
  };

  // Navigate to artwork detail
  const handleArtworkClick = (artworkId: string) => {
    navigate(`/artwork/${artworkId}?source=site`);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
      // Scroll to top of grid
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGoToPage();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-[1600px]">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-primary mb-2 sm:mb-3">
              掲載作品
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Micro Galleryで展示されている作品をご覧いただけます
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="作品名・作家名・タグで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 sm:h-14 lg:h-16 pl-12 sm:pl-14 pr-4 sm:pr-6 text-base sm:text-lg bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </motion.div>

          {/* Sorting Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            <SortOptions
              options={SORT_OPTIONS}
              selected={selectedSort}
              onSelect={setSelectedSort}
            />
          </motion.div>

          <Separator className="mb-8 sm:mb-12" />

          {/* Main Content: Filter Sidebar + Artwork Grid */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Filter Panel */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full lg:w-72 lg:flex-shrink-0 mb-6 lg:mb-0"
            >
              <ArtworkFilters
                selectedColors={selectedColors}
                selectedSizes={selectedSizes}
                selectedPriceRanges={selectedPriceRanges}
                selectedTechniques={selectedTechniques}
                selectedStyles={selectedStyles}
                onColorsChange={setSelectedColors}
                onSizesChange={setSelectedSizes}
                onPriceRangesChange={setSelectedPriceRanges}
                onTechniquesChange={setSelectedTechniques}
                onStylesChange={setSelectedStyles}
                onClearAll={handleClearFilters}
              />
            </motion.aside>

            {/* Artwork Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex-1"
            >
              <ArtworkGrid
                artworks={sortedArtworks}
                onArtworkClick={handleArtworkClick}
              />

              {/* Pagination */}
              <div className="mt-12 sm:mt-16">
                {/* Mobile Pagination */}
                <div className="lg:hidden flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onKeyDown={handlePageInputKeyDown}
                      className="w-20 h-10 text-center"
                      placeholder="ページ"
                    />
                    <span className="text-sm text-gray-600">
                      / {totalPages}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex-1"
                    >
                      前へ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex-1"
                    >
                      次へ
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleGoToPage}
                      className="flex-1"
                    >
                      移動
                    </Button>
                  </div>
                </div>

                {/* Desktop Pagination */}
                <div className="hidden lg:flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </Button>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        className="w-10"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
