import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Frame, CheckCircle } from "lucide-react";

interface ArtworkAreaSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceImage: string;
  spaceName: string;
  currentArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onSave: (area: { x: number; y: number; width: number; height: number }) => void;
}

export function ArtworkAreaSelectionDialog({
  open,
  onOpenChange,
  spaceImage,
  spaceName,
  currentArea,
  onSave
}: ArtworkAreaSelectionDialogProps) {
  const [selectionArea, setSelectionArea] = useState(currentArea || {
    x: 30,
    y: 20,
    width: 25,
    height: 40
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDragging(true);
    setDragStart({ x, y });
    setSelectionArea({
      x,
      y,
      width: 0,
      height: 0
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const width = Math.abs(currentX - dragStart.x);
    const height = Math.abs(currentY - dragStart.y);

    setSelectionArea({
      x: Math.max(0, Math.min(100 - width, x)),
      y: Math.max(0, Math.min(100 - height, y)),
      width: Math.min(width, 100),
      height: Math.min(height, 100)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleSave = () => {
    if (selectionArea.width < 5 || selectionArea.height < 5) {
      return;
    }
    onSave(selectionArea);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Frame className="w-5 h-5 text-accent" />
            作品を飾る位置を指定
          </DialogTitle>
          <DialogDescription>
            {spaceName}で作品を展示するエリアをドラッグして選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 説明 */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Frame className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>操作方法：</strong>写真上でドラッグして、作品を展示したいエリアを選択してください
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>マウスをドラッグして四角形を描画します</li>
                  <li>選択したエリアに作品が配置されます</li>
                  <li>何度でもやり直せます</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 画像プレビュー */}
          <div
            ref={imageRef}
            className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <ImageWithFallback
              src={spaceImage}
              alt={spaceName}
              className="w-full h-full object-cover pointer-events-none"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />

            {/* 選択エリア表示 */}
            {selectionArea.width > 0 && selectionArea.height > 0 && (
              <motion.div
                className="absolute border-2 border-accent bg-accent/20 rounded-none"
                style={{
                  left: `${selectionArea.x}%`,
                  top: `${selectionArea.y}%`,
                  width: `${selectionArea.width}%`,
                  height: `${selectionArea.height}%`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* 角のハンドル */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-accent rounded-full" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-accent rounded-full" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-accent rounded-full" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-accent rounded-full" />
              </motion.div>
            )}

            {/* ドラッグ中のカーソル表示 */}
            {isDragging && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg text-sm">
                ドラッグしてエリアを選択中...
              </div>
            )}
          </div>

          {/* プレビュー情報 */}
          {selectionArea.width > 0 && selectionArea.height > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800">
                    <strong>エリアを選択しました</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    位置: {selectionArea.x.toFixed(1)}%, {selectionArea.y.toFixed(1)}% / 
                    サイズ: {selectionArea.width.toFixed(1)}% × {selectionArea.height.toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectionArea.width < 5 || selectionArea.height < 5}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            この位置で保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

