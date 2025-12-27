import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MGJ_COLORS,
  SIZE_OPTIONS,
  PRICE_RANGES,
  TECHNIQUE_OPTIONS,
  STYLE_OPTIONS,
} from "@/data/artworks";

interface ArtworkFiltersProps {
  selectedColors: string[];
  selectedSizes: string[];
  selectedPriceRanges: string[];
  selectedTechniques: string[];
  selectedStyles: string[];
  onColorsChange: (colors: string[]) => void;
  onSizesChange: (sizes: string[]) => void;
  onPriceRangesChange: (ranges: string[]) => void;
  onTechniquesChange: (techniques: string[]) => void;
  onStylesChange: (styles: string[]) => void;
  onClearAll: () => void;
}

export function ArtworkFilters({
  selectedColors,
  selectedSizes,
  selectedPriceRanges,
  selectedTechniques,
  selectedStyles,
  onColorsChange,
  onSizesChange,
  onPriceRangesChange,
  onTechniquesChange,
  onStylesChange,
  onClearAll,
}: ArtworkFiltersProps) {
  const toggleColor = (hex: string) => {
    onColorsChange(
      selectedColors.includes(hex)
        ? selectedColors.filter((c) => c !== hex)
        : [...selectedColors, hex]
    );
  };

  const toggleSize = (size: string) => {
    onSizesChange(
      selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size]
    );
  };

  const togglePriceRange = (rangeId: string) => {
    onPriceRangesChange(
      selectedPriceRanges.includes(rangeId)
        ? selectedPriceRanges.filter((r) => r !== rangeId)
        : [...selectedPriceRanges, rangeId]
    );
  };

  const toggleTechnique = (techniqueId: string) => {
    if (techniqueId === "all") {
      onTechniquesChange([]);
    } else {
      onTechniquesChange(
        selectedTechniques.includes(techniqueId)
          ? selectedTechniques.filter((t) => t !== techniqueId)
          : [...selectedTechniques, techniqueId]
      );
    }
  };

  const toggleStyle = (style: string) => {
    onStylesChange(
      selectedStyles.includes(style)
        ? selectedStyles.filter((s) => s !== style)
        : [...selectedStyles, style]
    );
  };

  return (
    <div className="space-y-10 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
      {/* Color Filter - 5x3 Grid */}
      <div>
        <h3 className="text-base text-primary mb-4">色</h3>
        <div className="grid grid-cols-5 gap-3">
          {MGJ_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => toggleColor(color.hex)}
              className={`w-9 h-9 rounded-full border-2 transition-all mx-auto ${
                selectedColors.includes(color.hex)
                  ? "border-primary ring-2 ring-primary/20 scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{
                backgroundColor: color.hex,
                boxShadow:
                  color.hex === "#FFFFFF"
                    ? "inset 0 0 0 1px #E5E7EB"
                    : "none",
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-base text-primary mb-4">サイズ</h3>
        <div className="grid grid-cols-4 gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              type="button"
              className={`py-3 text-center rounded-lg border transition-all ${
                selectedSizes.includes(size)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          S: 〜40cm / M: 41-70cm / L: 71-100cm / XL: 101cm〜
        </p>
      </div>

      {/* Price Range - Compact Grid */}
      <div>
        <h3 className="text-base text-primary mb-4">価格帯</h3>
        <div className="grid grid-cols-2 gap-2">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => togglePriceRange(range.id)}
              type="button"
              className={`px-3 py-2.5 text-center text-sm rounded-lg border transition-all ${
                selectedPriceRanges.includes(range.id)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Technique Filter - Compact Grid */}
      <div>
        <h3 className="text-base text-primary mb-4">技法</h3>
        <div className="flex flex-wrap gap-2">
          {TECHNIQUE_OPTIONS.map((technique) => (
            <button
              key={technique.id}
              onClick={() => toggleTechnique(technique.id)}
              type="button"
              className={`px-3 py-2 text-sm rounded-full border transition-all ${
                (technique.id === "all" &&
                  selectedTechniques.length === 0) ||
                selectedTechniques.includes(technique.id)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              {technique.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style Filter */}
      <div>
        <h3 className="text-base text-primary mb-4">スタイル</h3>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style}
              onClick={() => toggleStyle(style)}
              className={`px-4 py-2 text-sm rounded-full border transition-all ${
                selectedStyles.includes(style)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Artist Name Search */}
      <div>
        <h3 className="text-base text-primary mb-4">作家名</h3>
        <Input
          type="text"
          placeholder="作家名を入力"
          className="bg-gray-50 border-gray-200"
        />
      </div>

      {/* Clear All Filters */}
      <Button variant="outline" className="w-full" onClick={onClearAll}>
        フィルターをクリア
      </Button>
    </div>
  );
}

