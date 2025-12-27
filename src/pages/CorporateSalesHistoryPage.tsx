import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import {
  TrendingUp,
  ShoppingCart,
  MapPin,
  Calendar,
  Download,
  ArrowLeft,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

// モックデータ
const salesHistory = [
  {
    id: 1,
    artworkTitle: "夕暮れの街",
    artist: "佐々木 健",
    spaceName: "1階エントランス",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400",
    salePrice: 38000,
    revenue: 3800,
    soldDate: "2024年8月15日",
    displayPeriod: "2024年7月1日 〜 2024年8月15日",
    displayDays: 45,
    payoutStatus: "支払済",
    payoutDate: "2024年9月30日",
  },
  {
    id: 2,
    artworkTitle: "静かな森",
    artist: "渡辺 さくら",
    spaceName: "会議室A",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400",
    salePrice: 35000,
    revenue: 3500,
    soldDate: "2024年9月20日",
    displayPeriod: "2024年8月5日 〜 2024年9月20日",
    displayDays: 46,
    payoutStatus: "支払済",
    payoutDate: "2024年10月31日",
  },
  {
    id: 3,
    artworkTitle: "青い朝",
    artist: "高橋 美和",
    spaceName: "受付",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400",
    salePrice: 42000,
    revenue: 4200,
    soldDate: "2024年10月8日",
    displayPeriod: "2024年9月1日 〜 2024年10月8日",
    displayDays: 37,
    payoutStatus: "処理中",
    payoutDate: "2024年11月30日（予定）",
  },
  {
    id: 4,
    artworkTitle: "モダンスペース",
    artist: "伊藤 健二",
    spaceName: "1階エントランス",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400",
    salePrice: 48000,
    revenue: 4800,
    soldDate: "2024年11月12日",
    displayPeriod: "2024年10月15日 〜 2024年11月12日",
    displayDays: 28,
    payoutStatus: "処理中",
    payoutDate: "2024年12月31日（予定）",
  },
  {
    id: 5,
    artworkTitle: "記憶の断片",
    artist: "田中 健一",
    spaceName: "会議室A",
    image: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=400",
    salePrice: 50000,
    revenue: 5000,
    soldDate: "2024年12月5日",
    displayPeriod: "2024年11月1日 〜 2024年12月5日",
    displayDays: 34,
    payoutStatus: "未払い",
    payoutDate: "2025年1月31日（予定）",
  },
];

const monthlyData = [
  { month: "7月", revenue: 3800, sales: 1 },
  { month: "8月", revenue: 3800, sales: 1 },
  { month: "9月", revenue: 7300, sales: 2 },
  { month: "10月", revenue: 9000, sales: 2 },
  { month: "11月", revenue: 4800, sales: 1 },
  { month: "12月", revenue: 5000, sales: 1 },
];

export function CorporateSalesHistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filteredSales = salesHistory.filter((sale) => {
    if (filter === "all") return true;
    if (filter === "paid") return sale.payoutStatus === "支払済";
    if (filter === "pending") return sale.payoutStatus === "処理中";
    if (filter === "unpaid") return sale.payoutStatus === "未払い";
    return true;
  });

  const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.revenue, 0);
  const totalSales = salesHistory.length;
  const paidRevenue = salesHistory
    .filter((sale) => sale.payoutStatus === "支払済")
    .reduce((sum, sale) => sum + sale.revenue, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/corporate-dashboard")}
            className="mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ダッシュボードに戻る
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl text-[#3A3A3A] mb-2">売上履歴</h1>
            <p className="text-sm sm:text-base text-gray-600">
              作品販売の履歴と報酬の詳細を確認できます
            </p>
          </motion.div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">累計収益（10%）</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl text-green-600">
                  ¥{totalRevenue.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  販売総額: ¥{(totalRevenue * 10).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">総販売点数</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl text-[#3A3A3A]">
                  {totalSales}点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <ShoppingCart className="w-4 h-4" />
                  平均展示日数: 38日
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">支払済み収益</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl text-blue-600">
                  ¥{paidRevenue.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  次回振込: 2025年1月31日
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 月別推移グラフ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">月別収益推移</CardTitle>
              <CardDescription className="text-xs sm:text-sm">過去6ヶ月の収益実績</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="revenue"
                      fill="#10b981"
                      name="収益（円）"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 販売履歴リスト */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">販売履歴一覧</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    全{totalSales}件の販売実績
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-40 h-9 sm:h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="paid">支払済</SelectItem>
                      <SelectItem value="pending">処理中</SelectItem>
                      <SelectItem value="unpaid">未払い</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm h-9 sm:h-10">
                    <Download className="w-4 h-4 mr-2" />
                    CSV出力
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredSales.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">該当する販売履歴がありません</p>
                </div>
              ) : (
                filteredSales.map((sale, index) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:shadow-md transition-all"
                  >
                    <div className="w-full sm:w-24 h-48 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={sale.image}
                        alt={sale.artworkTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="flex-grow min-w-0">
                          <h3 className="text-base sm:text-lg text-[#3A3A3A] mb-1 break-words">
                            {sale.artworkTitle}
                          </h3>
                          <p className="text-sm text-gray-600">{sale.artist}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="break-words">{sale.spaceName}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            展示期間: {sale.displayPeriod} ({sale.displayDays}日間)
                          </p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <Badge
                            className={`mb-2 ${
                              sale.payoutStatus === "支払済"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : sale.payoutStatus === "処理中"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {sale.payoutStatus}
                          </Badge>
                          <p className="text-xs sm:text-sm text-gray-600">販売価格</p>
                          <p className="text-base sm:text-lg text-[#3A3A3A]">
                            ¥{sale.salePrice.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">収益（10%）</p>
                          <p className="text-lg sm:text-xl text-green-600">
                            ¥{sale.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          販売日: {sale.soldDate}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 flex-shrink-0" />
                          振込予定: {sale.payoutDate}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 補足情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <h3 className="text-sm sm:text-base text-[#3A3A3A] mb-3">報酬の受け取りについて</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
            <li>• 報酬は作品販売価格の10%です</li>
            <li>• 毎月末締めで翌月末に振込を行います</li>
            <li>
              • 振込先は
              <Link
                to="/corporate-profile?tab=payment"
                className="text-blue-600 underline ml-1"
              >
                設定ページ
              </Link>
              で変更できます
            </li>
            <li>• 詳細な売上レポートはCSV形式でダウンロードできます</li>
          </ul>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

