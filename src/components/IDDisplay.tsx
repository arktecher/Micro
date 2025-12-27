import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EntityType, ID_CONFIGS, formatID } from "@/utils/idSystem";

interface IDDisplayProps {
  type: EntityType;
  numericId: number | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  copyable?: boolean;
  className?: string;
}

export function IDDisplay({ 
  type, 
  numericId, 
  size = 'md',
  showLabel = false,
  copyable = true,
  className = ''
}: IDDisplayProps) {
  const [copied, setCopied] = useState(false);
  const config = ID_CONFIGS[type];
  const formattedId = formatID(type, numericId);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedId);
      setCopied(true);
      toast.success('IDをコピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-xs text-gray-500">{config.label}ID:</span>
      )}
      <Badge 
        className={`${config.color} font-mono ${sizeClasses[size]} border border-gray-200`}
        variant="outline"
      >
        {formattedId}
      </Badge>
      {copyable && (
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="IDをコピー"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

interface IDSearchInputProps {
  value?: string;
  onChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function IDSearchInput({ 
  value = '',
  onChange, 
  placeholder = "ID検索 (例: AR-00001, AW-00123)",
  className = ''
}: IDSearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const handleQuickFill = (prefix: string) => {
    const newValue = prefix + '-';
    onChange(newValue);
  };

  return (
    <div className={className}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-32 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {Object.entries(ID_CONFIGS).map(([type, config]) => (
            <button
              key={type}
              type="button"
              onClick={() => handleQuickFill(config.prefix)}
              className="px-1.5 py-0.5 rounded text-xs font-mono border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title={`${config.label}IDを検索`}
            >
              {config.prefix}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

