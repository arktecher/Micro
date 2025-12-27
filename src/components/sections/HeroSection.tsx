import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

interface HeroSectionProps {
  heroImage: string;
}

const ANIMATION_DURATION = 0.8;
const ANIMATION_DELAYS = {
  title: 0.2,
  subtitle: 0.4,
  buttons: 0.6,
};

export function HeroSection({ heroImage }: HeroSectionProps) {
  const navigate = useNavigate();

  const handleArtistClick = () => {
    localStorage.setItem("userType", "artist");
    navigate("/artists");
  };

  const handleCorporateClick = () => {
    localStorage.setItem("userType", "corporate");
    navigate("/corporate");
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={heroImage}
          alt="アートのある空間"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/75"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_DURATION,
            delay: ANIMATION_DELAYS.title,
          }}
          className="text-5xl md:text-7xl mb-8 tracking-tight text-primary"
          style={{ fontWeight: 300, lineHeight: 1.2 }}
        >
          アートと共に、
          <br />
          空間の価値を育てる。
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_DURATION,
            delay: ANIMATION_DELAYS.subtitle,
          }}
          className="text-xl md:text-2xl mb-12 text-gray-600 max-w-3xl mx-auto"
          style={{ fontWeight: 300 }}
        >
          マイクロギャラリーは、アーティストと空間をつなぎ、
          <br className="hidden md:block" />
          新しい価値を創造します。
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_DURATION,
            delay: ANIMATION_DELAYS.buttons,
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={handleArtistClick}
            className="bg-primary hover:bg-primary/90 px-8 py-6 min-w-[240px]"
          >
            アーティストとして参加
          </Button>
          <Button
            size="lg"
            onClick={handleCorporateClick}
            className="bg-accent hover:bg-accent/90 text-white px-8 py-6 min-w-[240px]"
          >
            法人として参加
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
