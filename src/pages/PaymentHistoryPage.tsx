import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  Filter,
  Package,
  ShoppingCart,
  CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";

// モックデータ
const allTransactions = [
  {
    id: "TXN-2024-001",
    date: "2024年12月31日",
    type: "income",
    category: "sales_commission",
    description: "販売報酬の振込（12月分）",
    artworkTitle: "青の記憶",
    amount: 9500,
    status: "completed"
  },
  {
    id: "TXN-2024-002",
    date: "2024年12月15日",
    type: "expense",
    category: "shipping",
    description: "作品返送料",
    artworkTitle: "都市の夜",
    amount: -1500,
    status: "completed"
  },
  {
    id: "TXN-2024-003",
    date: "2024年11月30日",
    type: "income",
    category: "sales_commission",
    description: "販売報酬の振込（11月分）",
    artworkTitle: "Forest Light",
    amount: 12000,
    status: "completed"
  },
  {
    id: "TXN-2024-004",
    date: "2024年11月18日",
    type: "expense",
    category: "shipping",
    description: "作品返送料",
    artworkTitle: "秋の風景",
    amount: -1800,
    status: "completed"
  },
  {
    id: "TXN-2024-005",
    date: "2024年10月31日",
    type: "income",
    category: "sales_commission",
    description: "販売報酬の振込（10月分）",
    artworkTitle: "都市の夕暮れ",
    amount: 8500,
    status: "completed"
  },
  {
    id: "TXN-2024-006",
    date: "2024年10月20日",
    type: "income",
    category: "sales_commission",
    description: "販売報酬の振込（10月分）",
    artworkTitle: "静かな森",
    amount: 7000,
    status: "completed"
  },
  {
    id: "TXN-2024-007",
    date: "2024年9月30日",
    type: "income",
    category: "sales_commission",
    description: "販売報酬の振込（9月分）",
    artworkTitle: "夕暮れの街",
    amount: 3800,
    status: "completed"
  },
  {
    id: "TXN-2024-008",
    date: "2024年9月10日",
    type: "expense",
    category: "shipping",
    description: "作品返送料",
    artworkTitle: "朝の光",
    amount: -2000,
    status: "completed"
  },
  {
    id: "TXN-2025-001",
    date: "2025年1月31日",
    type: "income",
    category: "sales_commission",
    description: "販売報酬の振込（1月分・予定）",
    artworkTitle: "-",
    amount: 9500,
    status: "pending"
  }
];

export function PaymentHistoryPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // フィルタリング
  const filteredTransactions = allTransactions.filter(transaction => {
    if (filterType !== "all" && transaction.type !== filterType) return false;
    
    if (filterPeriod !== "all") {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      
      if (filterPeriod === "this_month") {
        if (transactionDate.getMonth() !== now.getMonth() || 
            transactionDate.getFullYear() !== now.getFullYear()) return false;
      } else if (filterPeriod === "last_3_months") {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (transactionDate < threeMonthsAgo) return false;
      } else if (filterPeriod === "last_6_months") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (transactionDate < sixMonthsAgo) return false;
      }
    }
    
    return true;
  });

  // 統計計算
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = Math.abs(filteredTransactions
    .filter(t => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0));
  
  const netAmount = totalIncome - totalExpense;

  const getTypeIcon = (type: string) => {
    if (type === "income") {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    return <TrendingDown className="w-5 h-5 text-gray-600" />;
  };

  const getCategoryIcon = (category: string) => {
    if (category === "sales_commission") {
      return <ShoppingCart className="w-4 h-4" />;
    }
    if (category === "shipping") {
      return <Package className="w-4 h-4" />;
    }
    return <CreditCard className="w-4 h-4" />;
  };

  const handleDownloadCSV = () => {
    // TODO: CSVダウンロード機能
    console.log("CSV download functionality to be implemented");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Link to="/corporate-dashboard">
            <Button variant="ghost" className="mb-4 -ml-2 sm:-ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-xs sm:text-sm">ダッシュボードに戻る</span>
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl text-primary mb-2">入出金履歴</h1>
              <p className="text-sm sm:text-base text-gray-600">すべての取引履歴を確認できます</p>
            </div>
            <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleDownloadCSV}>
              <Download className="w-4 h-4" />
              <span className="text-xs sm:text-sm">CSVダウンロード</span>
            </Button>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm">総入金額</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-green-600">
                ¥{totalIncome.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-gray-600">
                販売報酬の合計
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm">総出金額</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-gray-600">
                ¥{totalExpense.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-gray-600">
                返送料などの費用
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm">純利益</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-primary">
                ¥{netAmount.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-gray-600">
                入金 - 出金
              </p>
            </CardContent>
          </Card>
        </div>

        {/* フィルターとタブ */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">取引履歴</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {filteredTransactions.length}件の取引
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="income">入金のみ</SelectItem>
                    <SelectItem value="expense">出金のみ</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全期間</SelectItem>
                    <SelectItem value="this_month">今月</SelectItem>
                    <SelectItem value="last_3_months">過去3ヶ月</SelectItem>
                    <SelectItem value="last_6_months">過去6ヶ月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all hover:shadow-md ${
                    transaction.type === "income"
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  } ${transaction.status === "pending" ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.type === "income" ? "bg-green-100" : "bg-gray-100"
                      }`}>
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs sm:text-sm font-medium">{transaction.description}</p>
                          {transaction.status === "pending" && (
                            <Badge variant="outline" className="text-xs">
                              予定
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(transaction.category)}
                            {transaction.id}
                          </span>
                          <span>{transaction.date}</span>
                          {transaction.artworkTitle !== "-" && (
                            <span className="truncate">「{transaction.artworkTitle}」</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className={`text-base sm:text-lg font-semibold ${
                        transaction.type === "income" ? "text-green-600" : "text-gray-600"
                      }`}>
                        {transaction.type === "income" ? "+" : ""}
                        ¥{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm sm:text-base">該当する取引がありません</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

