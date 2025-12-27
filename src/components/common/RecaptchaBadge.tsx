import { Shield } from "lucide-react";

interface RecaptchaBadgeProps {
  className?: string;
}

export function RecaptchaBadge({ className = "" }: RecaptchaBadgeProps) {
  return (
    <div
      className={`flex items-center justify-end gap-3 text-xs text-gray-500 ${className}`}
    >
      {/* テキスト部分 */}
      <p className="leading-relaxed text-right text-xs">
        This site is protected by reCAPTCHA and the Google{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Privacy Policy
        </a>{" "}
        and{" "}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Terms of Service
        </a>{" "}
        apply.
      </p>

      {/* reCAPTCHA バッジ（ダミー） */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded shadow-sm">
        <Shield className="w-3.5 h-3.5 text-blue-600" />
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] text-gray-700 font-medium">
            reCAPTCHA
          </span>
          <span className="text-[8px] text-gray-500">Protected</span>
        </div>
      </div>
    </div>
  );
}
