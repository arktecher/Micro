import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Sparkles, X, Palette, Image as ImageIcon, Heart, Globe, Brush, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// タグカテゴリの定義
const TAG_CATEGORIES = [
  {
    id: "style",
    label: "スタイル",
    icon: Palette,
    tags: [
      "抽象画", "具象画", "ミニマル", "モダン", "コンテンポラリー",
      "印象派", "表現主義", "ポップアート", "シュルレアリスム",
      "ストリートアート", "幾何学的", "オーガニック", "フォトリアリズム"
    ]
  },
  {
    id: "motif",
    label: "モチーフ",
    icon: ImageIcon,
    tags: [
      "風景", "人物", "動物", "植物", "静物", "都市",
      "自然", "海", "山", "空", "花", "建築",
      "抽象形態", "幾何学模様", "文字・タイポグラフィ"
    ]
  },
  {
    id: "mood",
    label: "ムード",
    icon: Heart,
    tags: [
      "静寂", "躍動感", "温かみ", "クール", "エレガント",
      "力強い", "繊細", "明るい", "落ち着き", "神秘的",
      "ノスタルジック", "未来的", "詩的", "ドラマチック"
    ]
  },
  {
    id: "cultural",
    label: "世界観",
    icon: Globe,
    tags: [
      "和風", "北欧", "地中海", "アジアン", "アフリカン",
      "モロッカン", "インダストリアル", "ボヘミアン", "禅",
      "ヴィンテージ", "レトロ", "SF", "ファンタジー"
    ]
  },
  {
    id: "technique",
    label: "技法",
    icon: Brush,
    tags: [
      "油彩", "アクリル", "水彩", "日本画", "版画",
      "ドローイング", "コラージュ", "ミクストメディア", "デジタル",
      "写真", "3DCG", "AI生成", "スプレー", "彫刻的"
    ]
  },
  {
    id: "interior",
    label: "インテリア適性",
    icon: Home,
    tags: [
      "オフィス向け", "ホテル向け", "カフェ向け", "病院向け",
      "住宅向け", "商業施設向け", "和室に合う", "洋室に合う",
      "広い空間向け", "小空間向け", "アクセント", "調和型"
    ]
  }
];

interface StyleTagsSectionProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  aiRecommendedTags?: string[];
}

export function StyleTagsSection({ 
  selectedTags, 
  onTagsChange,
  aiRecommendedTags = []
}: StyleTagsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  // カテゴリの開閉トグル
  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // タグの選択/解除
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // 検索クエリに基づいてタグをフィルタリング
  const filterTags = (tags: string[]) => {
    if (!searchQuery) return tags;
    return tags.filter(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // 検索中は全カテゴリを開く
  const shouldOpenCategory = (categoryId: string) => {
    return searchQuery ? true : openCategories.includes(categoryId);
  };

  // 検索結果があるカテゴリのみ表示
  const getVisibleCategories = () => {
    if (!searchQuery) return TAG_CATEGORIES;
    return TAG_CATEGORIES.filter(category => 
      filterTags(category.tags).length > 0
    );
  };

  return (
    <div className="space-y-4">
      <div className="border-l-4 border-l-accent pl-3 sm:pl-4">
        <h3 className="text-base sm:text-lg md:text-xl text-primary mb-1">スタイル・特徴（任意）</h3>
        <p className="text-xs sm:text-sm text-gray-600">作品に当てはまるスタイルや特徴を選択してください（複数選択可）</p>
      </div>

      <Card className="bg-white">
        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* 検索バー */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="タグを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg text-sm sm:text-base"
            />
          </div>

          {/* 選択済みタグ一覧 */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  className="bg-[#4A56E2] text-white px-2 sm:px-3 py-1 rounded-full cursor-pointer hover:bg-[#3A46D2] flex items-center gap-1 text-xs sm:text-sm"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* AIおすすめタグ */}
          {aiRecommendedTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                <Sparkles className="w-4 h-4 text-[#4A56E2]" />
                <span>AIのおすすめ</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiRecommendedTags.map(tag => (
                  <Badge
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 sm:px-3 py-1 rounded-full cursor-pointer transition-all text-xs sm:text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-[#4A56E2] text-white hover:bg-[#3A46D2]'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* カテゴリアコーディオン */}
          <div className="space-y-2">
            {getVisibleCategories().map(category => {
              const Icon = category.icon;
              const isOpen = shouldOpenCategory(category.id);
              const visibleTags = filterTags(category.tags);

              return (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* カテゴリヘッダー */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A56E2]" />
                      <span className="text-sm sm:text-base text-gray-800">{category.label}</span>
                      {selectedTags.some(tag => category.tags.includes(tag)) && (
                        <Badge className="bg-[#4A56E2] text-white text-xs px-2 py-0 rounded-full">
                          {selectedTags.filter(tag => category.tags.includes(tag)).length}
                        </Badge>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    )}
                  </button>

                  {/* タグリスト */}
                  {isOpen && (
                    <div className="p-3 sm:p-4 bg-white">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {visibleTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all ${
                              selectedTags.includes(tag)
                                ? 'bg-[#4A56E2] text-white hover:bg-[#3A46D2]'
                                : 'bg-[#F5F5F7] text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 検索結果なし */}
          {searchQuery && getVisibleCategories().length === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">「{searchQuery}」に一致するタグが見つかりませんでした</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

