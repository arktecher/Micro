import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignupPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  artworkId: string;
  artworkTitle: string;
  mode?: "favorite" | "purchase";
}

export function SignupPromptDialog({
  isOpen,
  onClose,
  artworkId,
  artworkTitle,
  mode = "favorite",
}: SignupPromptDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Config based on mode
  const config =
    mode === "purchase"
      ? {
          icon: ShoppingBag,
          iconBg: "from-[#8B7355]/10 to-[#8B7355]/5",
          iconColor: "text-[#8B7355]",
          title: "作品を購入しますか？",
          description: `「${artworkTitle}」を購入するには、アカウント登録が必要です。`,
          buttonText: "アカウント登録して購入する",
          benefits: [
            "• 作品を購入できます",
            "• 購入履歴を確認できます",
            "• 配送状況を追跡できます",
          ],
        }
      : {
          icon: Heart,
          iconBg: "from-red-50 to-pink-50",
          iconColor: "text-red-500",
          title: "お気に入りに追加しますか？",
          description: `「${artworkTitle}」をお気に入りに追加するには、アカウント登録が必要です。`,
          buttonText: "アカウント登録してお気に入りに追加",
          benefits: [
            "• お気に入り作品を保存できます",
            "• 購入履歴を確認できます",
            "• 作品の最新情報が届きます",
          ],
        };

  const IconComponent = config.icon;

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSignup = () => {
    const currentPath = location.pathname;
    localStorage.setItem("mgj_redirect_after_signup", currentPath);
    localStorage.setItem("mgj_pending_favorite_artwork_id", artworkId);
    navigate("/signup/customer");
  };

  const handleLogin = () => {
    const currentPath = location.pathname;
    localStorage.setItem("mgj_redirect_after_login", currentPath);
    localStorage.setItem("mgj_pending_favorite_artwork_id", artworkId);
    navigate("/login-selection");
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            margin: 0,
            padding: '1rem'
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              zIndex: 1
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md"
            style={{ 
              position: 'relative',
              zIndex: 2,
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="閉じる"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.iconBg} flex items-center justify-center`}
                >
                  <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-4 mb-8">
                <h2 className="text-2xl text-[#222]">{config.title}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {config.description}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-700 mb-2">
                    ✨ アカウント登録すると...
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {config.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSignup}
                  className="w-full h-12 bg-[#222] hover:bg-[#333] text-white"
                >
                  {config.buttonText}
                </Button>
              </div>

              {/* Login and Corporate Link */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  すでにアカウントをお持ちの方は
                  <button
                    onClick={handleLogin}
                    className="text-[#8B7355] hover:underline ml-1"
                  >
                    ログイン
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  法人アカウントをご希望の方は
                  <button
                    onClick={() => navigate("/signup/corporate")}
                    className="text-[#8B7355] hover:underline ml-1"
                  >
                    こちら
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

