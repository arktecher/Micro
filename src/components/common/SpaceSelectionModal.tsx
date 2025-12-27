import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

interface Space {
  id: string;
  name: string;
  address: string;
  image: string;
  displayedArtworks: number;
}

interface SpaceSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworkId: number;
}

export function SpaceSelectionModal({ open, onOpenChange, artworkId }: SpaceSelectionModalProps) {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    if (open) {
      loadSpaces();
    }
  }, [open]);

  const loadSpaces = () => {
    const savedSpaces = localStorage.getItem("mgj_registered_spaces");
    if (savedSpaces) {
      try {
        const parsedSpaces = JSON.parse(savedSpaces);
        setSpaces(parsedSpaces);
      } catch (e) {
        console.error("Failed to load spaces:", e);
        setSpaces([]);
      }
    } else {
      setSpaces([]);
    }
  };

  const handleSelectSpace = (spaceId: string) => {
    const selectedSpace = spaces.find(s => s.id === spaceId);
    if (!selectedSpace) return;

    const params = new URLSearchParams({
      spaceId: selectedSpace.id,
      spaceName: selectedSpace.name,
      spaceImage: selectedSpace.image,
      areaX: "30",
      areaY: "20",
      areaWidth: "25",
      areaHeight: "40",
      tab: "favorites"
    });
    
    navigate(`/ai-artwork-preview?${params.toString()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>展示するスペースを選択</DialogTitle>
          <DialogDescription>
            この作品を展示するスペースを選んでください
          </DialogDescription>
        </DialogHeader>

        {spaces.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">登録されているスペースがありません</p>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                navigate("/signup/corporate?addSpace=true");
              }}
            >
              スペースを登録する
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
                onClick={() => handleSelectSpace(space.id)}
              >
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <ImageWithFallback
                      src={space.image}
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-primary mb-1">{space.name}</h3>
                        <div className="flex items-start gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p className="text-xs">{space.address}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                    {space.displayedArtworks > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        展示中: {space.displayedArtworks}点
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}



