import { Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-white/80 rounded"></div>
              <span className="tracking-tight">マイクロギャラリー</span>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-md">
              アーティストと空間をつなぎ、新しい価値を創造するプラットフォーム。
            </p>
          </div>

          <div>
            <h4 className="mb-4">リンク</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="#about"
                  className="hover:text-white transition-colors"
                >
                  マイクロギャラリーについて
                </a>
              </li>
              <li>
                <a href="#how" className="hover:text-white transition-colors">
                  仕組み
                </a>
              </li>
              <li>
                <a
                  href="#/contact"
                  className="hover:text-white transition-colors"
                >
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">法的事項</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="#/terms-of-service"
                  className="hover:text-white transition-colors"
                >
                  利用規約
                </a>
              </li>
              <li>
                <a
                  href="#/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a
                  href="#/cookie-policy"
                  className="hover:text-white transition-colors"
                >
                  クッキーポリシー
                </a>
              </li>
              <li>
                <a
                  href="#/commercial-transactions"
                  className="hover:text-white transition-colors"
                >
                  特定商取引法に基づく表記
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Micro Gallery Japan. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

