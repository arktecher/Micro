interface SortOption {
  id: string;
  label: string;
}

interface SortOptionsProps {
  options: SortOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export function SortOptions({ options, selected, onSelect }: SortOptionsProps) {
  return (
    <div>
      <h3 className="text-sm text-gray-600 mb-4">並べ替え</h3>
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`px-6 py-3 rounded-full whitespace-nowrap transition-all ${
              selected === option.id
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

