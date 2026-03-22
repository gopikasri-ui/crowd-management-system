import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DensityChart({ data }) {
  if (!data) return null;

  const chartData = data.labels.map((label, i) => ({
    time: label,
    "Main Gate": data.datasets.main_gate[i],
    Stage: data.datasets.stage[i],
    "Food Court": data.datasets.food_court[i],
  }));

  return (
    <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-bold text-cyan-400 mb-6">
        Live Crowd Density Trends
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="time"
            stroke="#4b5563"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis
            stroke="#4b5563"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid #06b6d4",
              borderRadius: 8,
              color: "#fff",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Main Gate"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Stage"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Food Court"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}