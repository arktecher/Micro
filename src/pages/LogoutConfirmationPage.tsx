import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function LogoutConfirmationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-12 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto text-center"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-3 sm:mb-4">ログアウトしました</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-12">
            ご利用ありがとうございました。<br />
            またのご利用をお待ちしております。
          </p>

          {/* Buttons */}
          <div className="space-y-3 sm:space-y-4">
            <Link to="/" className="block">
              <Button className="w-full h-11 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white">
                トップページに戻る
              </Button>
            </Link>
            
            <Link to="/login-selection" className="block">
              <Button variant="outline" className="w-full h-11 sm:h-12 border-gray-300 hover:bg-gray-50">
                再ログイン
              </Button>
            </Link>
          </div>

          {/* Additional Links */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">ログインはこちらから</p>
            <div className="flex flex-col gap-2 sm:gap-3">
              <Link 
                to="/login/customer" 
                className="text-xs sm:text-sm text-primary hover:underline transition-colors"
              >
                購入者としてログイン
              </Link>
              <Link 
                to="/login/artist" 
                className="text-xs sm:text-sm text-primary hover:underline transition-colors"
              >
                アーティストとしてログイン
              </Link>
              <Link 
                to="/login/corporate" 
                className="text-xs sm:text-sm text-primary hover:underline transition-colors"
              >
                法人としてログイン
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}



