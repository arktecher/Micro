import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1535056626760-b283260686b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwd2FsbCUyMG9mZmljZXxlbnwxfHx8fDE3NjExNzQ2NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1536241455566-5709c3aefd3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1vZGVybiUyMGFydHxlbnwxfHx8fDE3NjExNjAwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection heroImage={HERO_IMAGE} />
      <AboutSection aboutImage={ABOUT_IMAGE} />
      <HowItWorksSection />
      <BenefitsSection />
      <CTASection />

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl text-gray-900 mb-2">デモページ</h2>
            <p className="text-sm text-gray-600">開発中の機能を確認できます</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg text-gray-900 mb-2">
                  AIレコメンド理由の表示
                </h3>
                <p className="text-sm text-gray-600 mb-4 sm:mb-0">
                  AIがおすすめする作品の理由を、色の相性・スタイル・価格帯・サイズ・閲覧履歴の5つの指標で可視化します。
                </p>
              </div>
              <Link to="/ai-recommendation-reason-demo" className="w-full sm:w-auto">
                <Button className="bg-accent hover:bg-accent/90 gap-2 whitespace-nowrap w-full sm:w-auto">
                  デモを見る
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
