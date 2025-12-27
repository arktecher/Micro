import { motion } from "motion/react";
import { ArtworkCard } from "./ArtworkCard";
import type { Artwork } from "@/types/artwork";

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (artworkId: string) => void;
}

export function ArtworkGrid({ artworks, onArtworkClick }: ArtworkGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-16">
      {artworks.map((artwork, index) => (
        <motion.div
          key={artwork.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
        >
          <ArtworkCard
            artwork={artwork}
            onClick={() => onArtworkClick(artwork.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}

