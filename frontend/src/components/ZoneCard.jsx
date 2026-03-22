export default function ZoneCard({ zone, colorClass }) {
  return (
    <div className={`border rounded-xl p-4 ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Zone {zone.id}
          </p>
          <p className="text-lg font-bold text-white mt-1">
            {zone.name}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-bold ${
            zone.density === "Critical"
              ? "bg-red-500 text-white"
              : zone.density === "High"
              ? "bg-orange-500 text-white"
              : zone.density === "Medium"
              ? "bg-yellow-500 text-black"
              : "bg-green-500 text-black"
          }`}
        >
          {zone.density}
        </span>
      </div>

      <p className="text-3xl font-bold text-white mt-4">
        {zone.crowd_count}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        people detected
      </p>

      <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${
            zone.density === "Critical"
              ? "bg-red-500"
              : zone.density === "High"
              ? "bg-orange-500"
              : zone.density === "Medium"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{ width: `${Math.min((zone.crowd_count / 700) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}