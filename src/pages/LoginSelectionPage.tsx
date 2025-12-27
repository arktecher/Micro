import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Palette, Building2, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function LoginSelectionPage() {
  const navigate = useNavigate();

  const userTypes = [
    {
      id: "artist",
      title: "アーティストの方",
      description: "作品を出品したい方",
      icon: Palette,
      iconColor: "text-[#C6A05C]",
      bgGradient: "from-[#C6A05C]/10 to-[#C6A05C]/5",
      path: "/login/artist"
    },
    {
      id: "corporate",
      title: "法人の方",
      description: "空間を彩り、収益化したい方",
      icon: Building2,
      iconColor: "text-[#A67C52]",
      bgGradient: "from-[#A67C52]/10 to-[#A67C52]/5",
      path: "/login/corporate"
    },
    {
      id: "customer",
      title: "ご購入の方",
      description: "作品を購入したい方",
      icon: ShoppingBag,
      iconColor: "text-[#8B7355]",
      bgGradient: "from-[#8B7355]/10 to-[#8B7355]/5",
      path: "/login/customer"
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-3 sm:mb-4">ログイン</h1>
            <p className="text-sm sm:text-base text-gray-600">ご利用のサービスを選択してください</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {userTypes.map((userType, index) => {
              const Icon = userType.icon;
              return (
                <motion.div
                  key={userType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
                >
                  <Card
                    className="p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group h-full"
                    onClick={() => navigate(userType.path)}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                        {/* アイコン */}
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${userType.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                          <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${userType.iconColor}`} />
                        </div>

                        {/* テキスト */}
                        <div className="space-y-2">
                          <h2 className="text-lg sm:text-xl text-gray-900">{userType.title}</h2>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {userType.description}
                          </p>
                        </div>

                        {/* ボタン風の要素 */}
                        <div className="pt-2 sm:pt-4 w-full">
                          <div className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-900 text-white rounded-md group-hover:bg-gray-800 transition-colors duration-300 text-sm sm:text-base">
                            ログイン
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* 補足テキスト */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-8 sm:mt-12 space-y-2 sm:space-y-3"
          >
            <p className="text-xs sm:text-sm text-gray-500">
              アカウントをお持ちでない方は、各サービスから新規登録できます
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}



