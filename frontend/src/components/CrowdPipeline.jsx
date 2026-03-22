const steps = [
  { icon: "📹", label: "CCTV Cameras", desc: "Live video feed captured" },
  { icon: "🤖", label: "AI Processing", desc: "OpenCV analyzes frames" },
  { icon: "📊", label: "Density Analysis", desc: "Crowd count estimated" },
  { icon: "🗺️", label: "Heatmap", desc: "Hot zones identified" },
  { icon: "🚨", label: "Alert System", desc: "Alerts dispatched" },
  { icon: "🛡️", label: "Security Action", desc: "Teams deployed" },
];

export default function CrowdPipeline() {
  return (
    <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-bold text-cyan-400 mb-6">
        AI Monitoring Pipeline
      </h2>

      <div className="flex flex-wrap gap-3 items-center justify-center">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-4 text-center w-28">
              <div className="text-2xl">{step.icon}</div>
              <p className="text-xs font-bold text-cyan-400 mt-2">
                {step.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {step.desc}
              </p>
            </div>
            {i < steps.length - 1 && (
              <span className="text-cyan-500 text-xl font-bold">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}