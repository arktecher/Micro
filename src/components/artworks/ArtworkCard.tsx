import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { getFavoritesKey } from "@/lib/storageKeys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignupPromptDialog } from "@/components/common/SignupPromptDialog";

import type { Artwork } from "@/types/artwork";

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
}

export function ArtworkCard({ artwork, onClick }: ArtworkCardProps) {
  const { isAuthenticated, userType } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Check if artwork is in favorites
  useEffect(() => {
    if (isAuthenticated) {
      const storageKey = getFavoritesKey(userType);
      const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setIsLiked(favorites.includes(artwork.id));
    }
  }, [isAuthenticated, userType, artwork.id]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowSignupPrompt(true);
      return;
    }

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    // Update localStorage
    const storageKey = getFavoritesKey(userType);
    const favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");

    if (newIsLiked) {
      if (!favorites.includes(artwork.id)) {
        favorites.push(artwork.id);
        localStorage.setItem(storageKey, JSON.stringify(favorites));
      }
    } else {
      const index = favorites.indexOf(artwork.id);
      if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(favorites));
      }
    }

    // Dispatch event to update header count
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return (
    <>
      <Card
        className="group overflow-hidden border-0 shadow-none hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        {/* Thumbnail - Square 1:1 */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={artwork.image}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Status Badge */}
          {artwork.status === "rented" && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              <Badge className="bg-orange-500 text-white text-xs">
                貸出中
              </Badge>
            </div>
          )}
          {artwork.status === "displayed" && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              <Badge className="bg-blue-500 text-white text-xs">展示中</Badge>
            </div>
          )}

          {/* Size Badge */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <Badge
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm text-xs"
            >
              {artwork.size}
            </Badge>
          </div>

          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all z-10"
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
          <h3 className="text-sm sm:text-base md:text-lg text-primary line-clamp-1">
            {artwork.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
            {artwork.artist}
          </p>

          <p className="text-xs text-gray-500 hidden sm:block">
            {artwork.dimensions.width} × {artwork.dimensions.height} cm
          </p>

          <div className="flex items-center justify-between pt-1 sm:pt-2">
            <div>
              <p className="text-xs text-gray-500 mb-0.5 sm:mb-1 hidden sm:block">
                販売価格
              </p>
              <p className="text-base sm:text-lg md:text-xl text-primary">
                ¥{artwork.price.toLocaleString()}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex text-xs sm:text-sm"
            >
              詳細を見る
            </Button>
          </div>
        </div>
      </Card>

      {/* Signup Prompt Dialog */}
      <SignupPromptDialog
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        artworkId={artwork.id}
        artworkTitle={artwork.title}
      />
    </>
  );
}

