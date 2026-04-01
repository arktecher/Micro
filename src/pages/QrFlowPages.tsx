import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { QrCode, AlertTriangle, ImageIcon } from "lucide-react";

/** Targets of backend redirects from GET /api/v1/qr/{id} (HashRouter paths). */
export function QrNotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-lg px-4 py-16 text-center">
        <QrCode className="w-14 h-14 mx-auto text-muted-foreground mb-4" aria-hidden />
        <h1 className="text-xl font-semibold text-foreground mb-2">QRコードが見つかりません</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          このQRは無効か、発行が取り消されています。展示スペースの画面からQRを再発行してください。
        </p>
        <Button asChild variant="outline">
          <Link to="/">トップへ</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}

export function QrErrorPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-lg px-4 py-16 text-center">
        <AlertTriangle className="w-14 h-14 mx-auto text-amber-600 mb-4" aria-hidden />
        <h1 className="text-xl font-semibold text-foreground mb-2">QRの処理に失敗しました</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          時間をおいて再度お試しください。繰り返す場合はサポートへお問い合わせください。
        </p>
        <Button asChild variant="outline">
          <Link to="/">トップへ</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}

export function SpaceEmptyPage() {
  const [params] = useSearchParams();
  const spaceId = params.get("space_id");

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-lg px-4 py-16 text-center">
        <ImageIcon className="w-14 h-14 mx-auto text-muted-foreground mb-4" aria-hidden />
        <h1 className="text-xl font-semibold text-foreground mb-2">展示作品がまだありません</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          このスペースには現在、壁に展示中の作品が登録されていません。法人が作品を割り当てると、同じQRから作品ページへ遷移します。
        </p>
        {spaceId && (
          <p className="text-[11px] text-muted-foreground/80 font-mono break-all mb-6">
            space_id: {spaceId}
          </p>
        )}
        {!spaceId && <div className="mb-6" />}
        <Button asChild variant="outline">
          <Link to="/">トップへ</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}
