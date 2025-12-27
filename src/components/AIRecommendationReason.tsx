import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RecommendationScore {
  colorMatch: number; // 0-100
  styleMatch: number; // 0-100
  priceMatch: number; // 0-100
  sizeMatch: number; // 0-100
  historyMatch: number; // 0-100
}

interface AIRecommendationReasonProps {
  artworkTitle: string;
  artistName: string;
  spaceName: string;
  scores?: RecommendationScore;
  summary?: string;
}

interface ScoreItemProps {
  label: string;
  subLabel: string;
  score: number;
}

function ScoreItem({ label, subLabel, score }: ScoreItemProps) {
  // スコアに応じた色を設定
  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{subLabel}</p>
        </div>
        <span className="text-base text-gray-900 ml-4">{score}%</span>
      </div>
      
      {/* プログレスバー */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(score)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AIRecommendationReason({
  artworkTitle,
  artistName,
  spaceName,
  scores,
  summary
}: AIRecommendationReasonProps) {
  // スコアがない場合はランダム生成（デモ用）
  const defaultScores: RecommendationScore = scores || {
    colorMatch: Math.floor(Math.random() * 20) + 75, // 75-95
    styleMatch: Math.floor(Math.random() * 20) + 70, // 70-90
    priceMatch: Math.floor(Math.random() * 15) + 80, // 80-95
    sizeMatch: Math.floor(Math.random() * 20) + 75, // 75-95
    historyMatch: Math.floor(Math.random() * 25) + 65, // 65-90
  };

  const defaultSummary = summary || `「${artworkTitle}」（${artistName}）は、${spaceName}の雰囲気と色調が近く、サイズと予算もスペースにフィットしています。`;

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* 要約コメント */}
        <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
            {defaultSummary}
          </p>
        </div>

        <Separator className="bg-gray-100" />

        {/* スコア指標のグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 色の相性 */}
          <ScoreItem
            label="色の相性"
            subLabel="スペースの壁色との近さ"
            score={defaultScores.colorMatch}
          />

          {/* スタイルの近さ */}
          <ScoreItem
            label="スタイルの近さ"
            subLabel="ミニマル / ポップ などのスタイル一致度"
            score={defaultScores.styleMatch}
          />

          {/* 価格帯のフィット */}
          <ScoreItem
            label="価格帯のフィット"
            subLabel="設定予算との近さ"
            score={defaultScores.priceMatch}
          />

          {/* サイズの相性 */}
          <ScoreItem
            label="サイズの相性"
            subLabel="スペースの壁面サイズとのフィット感"
            score={defaultScores.sizeMatch}
          />

          {/* 閲覧履歴との相性 */}
          <ScoreItem
            label="閲覧履歴との相性"
            subLabel="過去にチェックした作品傾向との近さ"
            score={defaultScores.historyMatch}
          />
        </div>

        <Separator className="bg-gray-100" />

        {/* 注釈 */}
        <div className="pt-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            ※ スコアは Micro Gallery のAIが、色・スタイル・サイズ・予算・閲覧履歴をもとに算出しています。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}



