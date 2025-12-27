import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { QrCode, Copy, Edit, CheckCircle, Image as ImageIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeManagerProps {
  spaceId: string;
  spaceName: string;
  currentArtworkId?: string;
  currentArtworkTitle?: string;
  qrCodeUrl?: string;
}

export function QRCodeManager({ 
  spaceId, 
  spaceName, 
  currentArtworkId, 
  currentArtworkTitle,
  qrCodeUrl: initialQrCodeUrl 
}: QRCodeManagerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedUrl, setEditedUrl] = useState(initialQrCodeUrl || "");
  const [editedArtworkId, setEditedArtworkId] = useState(currentArtworkId || "");
  const [qrCodeUrl, setQrCodeUrl] = useState(initialQrCodeUrl || "");

  const baseUrl = window.location.origin;
  const fullUrl = qrCodeUrl || `${baseUrl}/artwork/${currentArtworkId || "1"}?source=qr`;

  const handleCopyUrl = () => {
    // Clipboard APIのフォールバック処理
    if (navigator.clipboard && window.isSecureContext) {
      // モダンなClipboard API
      navigator.clipboard.writeText(fullUrl)
        .then(() => {
          toast.success("URLをコピーしました");
        })
        .catch(() => {
          // フォールバック: 古い方法
          fallbackCopyTextToClipboard(fullUrl);
        });
    } else {
      // フォールバック: 古い方法
      fallbackCopyTextToClipboard(fullUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success("URLをコピーしました");
      } else {
        toast.error("コピーに失敗しました。URLを手動でコピーしてください。");
      }
    } catch (err) {
      console.error('Fallback: コピーに失敗しました', err);
      toast.error("コピーに失敗しました。URLを手動でコピーしてください。");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleSaveUrl = () => {
    // URLのバリデーション
    if (!editedUrl.trim()) {
      toast.error("URLを入力してください");
      return;
    }

    // 作品IDの抽出（簡易版）
    const artworkIdMatch = editedUrl.match(/\/artwork\/(\d+)/);
    if (artworkIdMatch) {
      setEditedArtworkId(artworkIdMatch[1]);
    }

    setQrCodeUrl(editedUrl);
    setIsEditDialogOpen(false);
    toast.success("QRコードのリンク先を更新しました");
    console.log(`スペース ${spaceId} のQRコードリンク先を更新:`, editedUrl);
  };

  const handleDownloadQR = () => {
    // SVGをPNGに変換してダウンロード
    const svg = document.querySelector(`#qr-canvas-${spaceId} svg`) as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 200;
      canvas.height = 200;
      
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `qr-code-${spaceId}-${spaceName}.png`;
          link.click();
          toast.success('QRコードをダウンロードしました');
        }
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <>
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            QRコード管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QRコード表示 */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
                <div id={`qr-canvas-${spaceId}`}>
                  <QRCodeSVG
                    value={fullUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  {spaceName}
                </p>
              </div>
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                QRコード画像をダウンロード
              </Button>
            </div>

            {/* リンク情報 */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">
                  現在の展示作品
                </Label>
                {currentArtworkTitle ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      展示中
                    </Badge>
                    <span className="text-sm">{currentArtworkTitle}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">作品未設定</p>
                )}
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">
                  QRコードのリンク先URL
                </Label>
                <div className="bg-white p-3 rounded border border-gray-200 break-all">
                  <p className="text-sm font-mono text-gray-700">
                    {fullUrl}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCopyUrl}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                URLをコピー
              </Button>

              <Button
                onClick={() => {
                  setEditedUrl(qrCodeUrl || fullUrl);
                  setIsEditDialogOpen(true);
                }}
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                リンク先を変更
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-800 leading-relaxed">
                  <strong>💡 自動更新について：</strong><br />
                  法人がスペースに新しい作品を選択すると、QRコードのリンク先は自動的に最新の作品に更新されます。
                  手動で変更した場合は、その設定が優先されます。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* リンク編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QRコードのリンク先を変更</DialogTitle>
            <DialogDescription>
              スペースのQRコードのリンク先を新しいURLに変更します。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>スペース名</Label>
              <Input value={spaceName} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>
                リンク先URL <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="https://microgalleryjapan.com/artwork/1?source=qr"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                作品ページのURLを入力してください。<br />
                例: https://microgalleryjapan.com/artwork/1?source=qr
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>推奨フォーマット：</strong><br />
                <code className="bg-white px-2 py-1 rounded text-xs">
                  {baseUrl}/artwork/[作品ID]?source=qr
                </code>
                <br /><br />
                <code>?source=qr</code> パラメータを付けることで、QRコード経由のアクセスを識別できます。
              </p>
            </div>

            {/* プレビュー */}
            {editedUrl && (
              <div className="space-y-2">
                <Label>QRコードプレビュー</Label>
                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex justify-center">
                  <QRCodeSVG
                    value={editedUrl}
                    size={150}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSaveUrl}
              disabled={!editedUrl.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

