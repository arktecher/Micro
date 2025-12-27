export interface Artwork {
  id: string;
  title: string;
  artist: string;
  size: string;
  dimensions: {
    width: number;
    height: number;
  };
  price: number;
  technique: string;
  dominantColor: string;
  image: string;
  status: string;
  createdAt: string;
  popularity: number;
}

export interface ArtworkFilters {
  searchQuery: string;
  selectedColors: string[];
  selectedSizes: string[];
  selectedPriceRanges: string[];
  selectedTechniques: string[];
}

