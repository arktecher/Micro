import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  LogOut,
  Heart,
  ChevronDown,
  LayoutDashboard,
  Building2,
  Package,
  Palette,
  MapPin,
  Mail,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { getFavoritesKey } from "@/lib/storageKeys";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const SCROLL_THRESHOLD = 100; // Minimum scroll distance before hiding header
const HEADER_HEIGHT = 80; // Approximate header height in pixels

export function Header() {
  const { isAuthenticated, userType, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll-based header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the top
      if (currentScrollY < SCROLL_THRESHOLD) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
        // Scrolling down
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Handle favorites count
  useEffect(() => {
    const updateFavoritesCount = () => {
      if (isAuthenticated) {
        const storageKey = getFavoritesKey(userType);
        const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setFavoritesCount(favorites.length);
      } else {
        setFavoritesCount(0);
      }
    };

    updateFavoritesCount();

    window.addEventListener("favoritesUpdated", updateFavoritesCount);
    window.addEventListener("storage", updateFavoritesCount);

    return () => {
      window.removeEventListener("favoritesUpdated", updateFavoritesCount);
      window.removeEventListener("storage", updateFavoritesCount);
    };
  }, [isAuthenticated, userType]);

  const handleLogout = () => {
    logout();
    navigate("/logout-confirmation");
    setIsMobileMenuOpen(false);
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: 1,
        y: isHeaderVisible ? 0 : -HEADER_HEIGHT,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="fixed top-0 left-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      style={{ width: "100vw" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity z-10"
          onClick={handleMobileNavClick}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary/80 rounded"></div>
          <span className="tracking-tight text-sm sm:text-base">
            マイクロギャラリー
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 lg:gap-8 text-sm lg:text-base">
          <Link
            to="/#how"
            className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
          >
            仕組み
          </Link>
          <Link
            to="/artworks"
            className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
          >
            掲載作品
          </Link>
          <Link
            to="/artists"
            className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
          >
            アーティストの方
          </Link>
          <Link
            to="/corporate"
            className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
          >
            法人の方
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1">
              よくある質問 <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-gray-500">
                FAQ
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/artists#faq")}>
                <Palette className="mr-2 h-4 w-4" />
                <span>アーティスト向け</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/corporate#faq")}>
                <Building2 className="mr-2 h-4 w-4" />
                <span>法人向け</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/contact")}>
                <Mail className="mr-2 h-4 w-4 text-accent" />
                <span>お問い合わせ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/admin"
            className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
          >
            管理者用
          </Link>

          <div className="flex items-center gap-4 ml-4">
            {isAuthenticated && userType === "customer" && currentUser ? (
              <>
                <Link
                  to="/my-page#favorites"
                  className="relative flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors whitespace-nowrap"
                  title="お気に入り"
                >
                  <Heart className="w-5 h-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors whitespace-nowrap focus:outline-none">
                      <User className="w-5 h-5" />
                      <span className="hidden md:inline">
                        {currentUser.name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {currentUser.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground font-mono">
                          {currentUser.id}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => navigate("/my-page#profile")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      マイページ
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate("/my-page#orders")}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      購入履歴
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate("/my-page#favorites")}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      お気に入り
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : isAuthenticated && userType === "artist" ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors whitespace-nowrap focus:outline-none">
                      <User className="w-5 h-5" />
                      <span className="hidden md:inline">
                        {currentUser?.name || "アーティスト"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {currentUser && (
                      <>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {currentUser.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground font-mono">
                              {currentUser.id}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onSelect={() => navigate("/dashboard#dashboard")}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate("/dashboard#profile")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      プロフィール
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate("/dashboard#artworks")}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      作品管理
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : isAuthenticated && userType === "corporate" ? (
              <>
                <button
                  onClick={() => navigate("/corporate-dashboard#favorites")}
                  className="relative flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors whitespace-nowrap"
                  title="お気に入り"
                >
                  <Heart className="w-5 h-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors whitespace-nowrap focus:outline-none">
                      <Building2 className="w-5 h-5" />
                      <span className="hidden md:inline">
                        {currentUser?.name || "法人"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {currentUser && (
                      <>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {currentUser.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground font-mono">
                              {currentUser.id}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onSelect={() =>
                        navigate("/corporate-dashboard#dashboard")
                      }
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      ダッシュボード
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate("/corporate-dashboard#spaces")}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      スペース管理
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate("/corporate-dashboard#artworks")}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      展示作品一覧
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login-selection">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                >
                  ログイン
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3 z-10">
          {/* Mobile Favorites Icon */}
          {isAuthenticated &&
            (userType === "customer" || userType === "corporate") && (
              <button
                onClick={() => {
                  if (userType === "customer") {
                    navigate("/my-page#favorites");
                  } else {
                    navigate("/corporate-dashboard#favorites");
                  }
                }}
                className="relative flex items-center text-gray-600 hover:text-red-500 transition-colors"
                title="お気に入り"
              >
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-primary transition-colors"
            aria-label="メニュー"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed top-[73px] left-0 w-screen h-[calc(100vh-73px)] border-t border-gray-200 bg-white/95 backdrop-blur-md overflow-y-auto"
            style={{ width: "100vw" }}
          >
            <nav className="flex flex-col h-full max-w-7xl mx-auto px-4 sm:px-6 py-4"
            >
              <div className="flex-1 space-y-3">
              {/* Navigation Links */}
              <Link
                to="/#how"
                onClick={handleMobileNavClick}
                className="block text-gray-600 hover:text-primary transition-colors py-2"
              >
                仕組み
              </Link>
              <Link
                to="/artworks"
                onClick={handleMobileNavClick}
                className="block text-gray-600 hover:text-primary transition-colors py-2"
              >
                掲載作品
              </Link>
              <Link
                to="/artists"
                onClick={handleMobileNavClick}
                className="block text-gray-600 hover:text-primary transition-colors py-2"
              >
                アーティストの方
              </Link>
              <Link
                to="/corporate"
                onClick={handleMobileNavClick}
                className="block text-gray-600 hover:text-primary transition-colors py-2"
              >
                法人の方
              </Link>
              <Link
                to="/admin"
                onClick={handleMobileNavClick}
                className="block text-gray-600 hover:text-primary transition-colors py-2"
              >
                管理者用
              </Link>

              {/* FAQ Section */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  よくある質問
                </p>
                <button
                  onClick={() => {
                    navigate("/artists#faq");
                    handleMobileNavClick();
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2 w-full text-left"
                >
                  <Palette className="w-4 h-4" />
                  <span>アーティスト向け</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/corporate#faq");
                    handleMobileNavClick();
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2 w-full text-left"
                >
                  <Building2 className="w-4 h-4" />
                  <span>法人向け</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/contact");
                    handleMobileNavClick();
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2 w-full text-left"
                >
                  <Mail className="w-4 h-4 text-accent" />
                  <span>お問い合わせ</span>
                </button>
              </div>

              </div>

              {/* User Menu - Always at bottom */}
              {isAuthenticated ? (
                <div className="mt-auto pt-4 border-t border-gray-200">
                  {currentUser && (
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {currentUser.id}
                      </p>
                    </div>
                  )}

                  {userType === "customer" && (
                    <>
                      <Link
                        to="/my-page#profile"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <User className="w-4 h-4" />
                        マイページ
                      </Link>
                      <Link
                        to="/my-page#orders"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <Package className="w-4 h-4" />
                        購入履歴
                      </Link>
                      <Link
                        to="/my-page#favorites"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <Heart className="w-4 h-4" />
                        お気に入り
                      </Link>
                    </>
                  )}

                  {userType === "artist" && (
                    <>
                      <Link
                        to="/dashboard#dashboard"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        ダッシュボード
                      </Link>
                      <Link
                        to="/dashboard#profile"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <User className="w-4 h-4" />
                        プロフィール
                      </Link>
                      <Link
                        to="/dashboard#artworks"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <Palette className="w-4 h-4" />
                        作品管理
                      </Link>
                    </>
                  )}

                  {userType === "corporate" && (
                    <>
                      <Link
                        to="/corporate-dashboard#dashboard"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        ダッシュボード
                      </Link>
                      <Link
                        to="/corporate-dashboard#spaces"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <MapPin className="w-4 h-4" />
                        スペース管理
                      </Link>
                      <Link
                        to="/corporate-dashboard#artworks"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors py-2"
                      >
                        <Palette className="w-4 h-4" />
                        展示作品一覧
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors py-2 w-full text-left mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <Link
                    to="/login-selection"
                    onClick={handleMobileNavClick}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      ログイン
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
