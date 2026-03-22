import Navbar from "../components/Navbar";
import AIChat from "../components/AIchat";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            Crowd Control Center
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered real-time crowd management system
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-10 mb-8">
          <div className="text-9xl animate-bounce">🚨</div>
          <p className="text-red-400 font-bold text-lg mt-6 uppercase tracking-widest animate-pulse">
            System Monitoring Active
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Use AI Detection or Live Map to analyze crowd density
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-green-500/20 rounded-xl p-4 text-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-gray-400 uppercase">System</p>
            <p className="text-lg font-bold text-green-400 mt-1">Active</p>
          </div>
          <div className="bg-gray-900 border border-cyan-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">📹</p>
            <p className="text-xs text-gray-400 uppercase">Cameras</p>
            <p className="text-lg font-bold text-cyan-400 mt-1">8 Online</p>
          </div>
          <div className="bg-gray-900 border border-cyan-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">🤖</p>
            <p className="text-xs text-gray-400 uppercase">AI Engine</p>
            <p className="text-lg font-bold text-cyan-400 mt-1">Ready</p>
          </div>
          <div className="bg-gray-900 border border-cyan-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">🗺️</p>
            <p className="text-xs text-gray-400 uppercase">Map</p>
            <p className="text-lg font-bold text-cyan-400 mt-1">Live</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a href="/detection" className="bg-gray-900 border border-purple-500/30 rounded-xl p-5 hover:bg-gray-800 transition block">
            <span className="text-3xl">🤖</span>
            <p className="font-bold text-white mt-3">AI Detection</p>
            <p className="text-xs text-gray-400 mt-1">Upload photo or use webcam to count people</p>
          </a>
          <a href="/map" className="bg-gray-900 border border-cyan-500/30 rounded-xl p-5 hover:bg-gray-800 transition block">
            <span className="text-3xl">🗺️</span>
            <p className="font-bold text-white mt-3">Live Map</p>
            <p className="text-xs text-gray-400 mt-1">Search location and see crowd density heatmap</p>
          </a>
          <a href="/alerts" className="bg-gray-900 border border-red-500/30 rounded-xl p-5 hover:bg-gray-800 transition block">
            <span className="text-3xl animate-pulse">🚨</span>
            <p className="font-bold text-white mt-3">Live Alerts</p>
            <p className="text-xs text-gray-400 mt-1">Real-time crowd danger notifications</p>
          </a>
          <a href="/analytics" className="bg-gray-900 border border-green-500/30 rounded-xl p-5 hover:bg-gray-800 transition block">
            <span className="text-3xl">📊</span>
            <p className="font-bold text-white mt-3">Analytics</p>
            <p className="text-xs text-gray-400 mt-1">Crowd trends and peak hour charts</p>
          </a>
        </div>

        <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">
            AI Monitoring Pipeline
          </h2>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-3 text-center w-24">
              <div className="text-xl">📹</div>
              <p className="text-xs text-cyan-400 mt-1 font-bold">Camera</p>
            </div>
            <span className="text-cyan-500 font-bold">→</span>
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-3 text-center w-24">
              <div className="text-xl">🧠</div>
              <p className="text-xs text-cyan-400 mt-1 font-bold">OpenCV</p>
            </div>
            <span className="text-cyan-500 font-bold">→</span>
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-3 text-center w-24">
              <div className="text-xl">📊</div>
              <p className="text-xs text-cyan-400 mt-1 font-bold">Count</p>
            </div>
            <span className="text-cyan-500 font-bold">→</span>
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-3 text-center w-24">
              <div className="text-xl">🗺️</div>
              <p className="text-xs text-cyan-400 mt-1 font-bold">Heatmap</p>
            </div>
            <span className="text-cyan-500 font-bold">→</span>
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-3 text-center w-24">
              <div className="text-xl">🚨</div>
              <p className="text-xs text-cyan-400 mt-1 font-bold">Alert</p>
            </div>
            <span className="text-cyan-500 font-bold">→</span>
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-3 text-center w-24">
              <div className="text-xl">🛡️</div>
              <p className="text-xs text-cyan-400 mt-1 font-bold">Action</p>
            </div>
          </div>
        </div>

      </div>
      <AIChat />
    </div>
  );
}