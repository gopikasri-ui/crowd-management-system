import { useState, useRef } from "react";
import axios from "axios";

export default function IPCameraDetect() {
  const [ipUrl, setIpUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);
  const imgRef = useRef(null);

  const connect = () => {
    if (!ipUrl.trim()) {
      setError("Please enter IP camera URL");
      return;
    }
    setError("");
    setConnected(true);
    intervalRef.current = setInterval(captureFrame, 5000);
  };

  const disconnect = () => {
    setConnected(false);
    setResult(null);
    clearInterval(intervalRef.current);
  };

  const captureFrame = async () => {
    if (!imgRef.current) return;
    setLoading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = imgRef.current.naturalWidth || 640;
      canvas.height = imgRef.current.naturalHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");
        const res = await axios.post(
          "http://localhost:8000/api/crowd/detect/image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setResult(res.data);
        if (res.data.density === "High" || res.data.density === "Critical") {
          await axios.post("http://localhost:8000/api/alerts/add", {
            people_count: res.data.people_count,
            density: res.data.density,
            source: "IP Camera"
          });
        }
      }, "image/jpeg");
    } catch (err) {
      console.error("IP cam error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Connect IP Camera / CCTV
        </h2>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
          <p className="text-xs text-cyan-400 font-bold uppercase mb-2">
            How to connect your CCTV camera
          </p>
          <div className="space-y-1 text-xs text-gray-400">
            <p>1. Make sure your camera is on the same WiFi network</p>
            <p>2. Find your camera IP from its settings (e.g. 192.168.1.64)</p>
            <p>3. Enter the stream URL format below</p>
            <p>4. Click Connect</p>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500">Common URL formats:</p>
            <p className="text-xs text-green-400 font-mono">http://192.168.1.64:8080/video</p>
            <p className="text-xs text-green-400 font-mono">rtsp://username:password@192.168.1.64:554/stream</p>
            <p className="text-xs text-green-400 font-mono">http://192.168.1.64/mjpeg/snap.cgi</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={ipUrl}
            onChange={(e) => setIpUrl(e.target.value)}
            placeholder="Enter IP camera URL e.g. http://192.168.1.64:8080/video"
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 text-sm"
            disabled={connected}
          />
          {!connected ? (
            <button
              onClick={connect}
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-6 py-3 rounded-xl transition"
            >
              Connect
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Disconnect
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        {connected && (
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-green-400 text-sm font-bold">
              Connected — detecting every 5 seconds
            </p>
          </div>
        )}
      </div>

      {connected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-4">
            <h2 className="text-lg font-bold text-white mb-4">
              Camera Feed
            </h2>
            <img
              ref={imgRef}
              src={ipUrl}
              alt="IP Camera Feed"
              className="w-full rounded-xl bg-gray-800 border border-gray-700"
              crossOrigin="anonymous"
              onError={() => setError("Cannot load camera feed. Check URL or camera connection.")}
            />
            <button
              onClick={captureFrame}
              className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition"
            >
              Detect Now
            </button>
          </div>

          <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-4">
            <h2 className="text-lg font-bold text-white mb-4">
              Detection Results
            </h2>
            {loading && (
              <p className="text-cyan-400 animate-pulse">Analyzing frame...</p>
            )}
            {result && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 uppercase">People</p>
                    <p className="text-5xl font-bold text-cyan-400 mt-2">
                      {result.people_count}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 uppercase">Density</p>
                    <p className="text-2xl font-bold text-orange-400 mt-2">
                      {result.density}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase mb-2">Recommendation</p>
                  <p className="text-white text-sm">{result.recommendation}</p>
                </div>
                {result.annotated_image && (
                  <img
                    src={"data:image/jpeg;base64," + result.annotated_image}
                    alt="Detected"
                    className="w-full rounded-xl border border-cyan-500/30"
                  />
                )}
              </div>
            )}
            {!result && !loading && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📷</p>
                <p>Camera connected — waiting for detection</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}