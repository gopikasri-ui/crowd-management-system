import { useState } from "react";

const severityStyles = {
  critical: "bg-red-500/20 border-red-500 text-red-300",
  high: "bg-orange-500/20 border-orange-500 text-orange-300",
  medium: "bg-yellow-500/20 border-yellow-500 text-yellow-300",
  low: "bg-blue-500/20 border-blue-500 text-blue-300",
};

const severityIcons = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🔵",
};

export default function AlertBanner({ alert }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className={`border rounded-xl p-4 mb-3 flex justify-between items-center ${
        severityStyles[alert.severity]
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">
          {severityIcons[alert.severity]}
        </span>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest opacity-70">
            {alert.zone}
          </span>
          <p className="text-sm mt-1">
            ⚠ {alert.message}
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="text-xs opacity-60 hover:opacity-100 ml-4 text-white"
      >
        ✕
      </button>
    </div>
  );
}