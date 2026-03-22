import { useRef, useState, useCallback, useEffect } from "react";
import axios from "axios";

export default function WebcamDetect() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startWebcam = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
      setStreaming(true);
    } catch (err) {
      setError("Camera access denied. Please allow camera permission in browser settings.");
      console.error(err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStreaming(false);
    setResult(null);
    setError("");
  };

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (videoRef.current.readyState !== 4) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", blob, "webcam.jpg");
        const res = await axios.post(
          "https://crowd-backend-0m8x.onrender.com/api/crowd/detect/image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setResult(res.data);
        if (
          res.data.density === "High" ||
          res.data.density === "Critical"
        ) {
          await axios.post(
            "https://crowd-backend-0m8x.onrender.com/api/alerts/add",
            {
              people_count: res.data.people_count,
              density: res.data.density,
              source: "Webcam"
            }
          );
        }
      } catch (err) {
        console.error("Detection failed:", err);
        setError("Detection failed. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg", 0.9);
  }, []);

  useEffect(() => {
    if (streaming) {
      intervalRef.current = setInterval(captureAndDetect, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [streaming, captureAndDetect]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Live Camera Feed
        </h2>

        <div className="relative bg-gray-800 rounded-xl overflow-hidden" style={{ minHeight: "240px" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-xl"
          />
          {streaming && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white font-bold">LIVE</span>
            </div>
          )}
          {!streaming && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Camera not started</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <p className="text-red-400 text-xs mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-4">
          {!streaming ? (
            <button
              onClick={startWebcam}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition"
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={stopWebcam}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl transition"
              >
                Stop Camera
              </button>
              <button
                onClick={captureAndDetect}
                disabled={loading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
              >
                {loading ? "Detecting..." : "Detect Now"}
              </button>
            </>
          )}
        </div>

        {streaming && (
          <p className="text-xs text-cyan-400 mt-3 text-center animate-pulse">
            Auto-detecting every 4 seconds
          </p>
        )}
      </div>

      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Detection Results
        </h2>

        {loading && (
          <div className="text-center py-8">
            <p className="text-cyan-400 animate-pulse font-bold text-lg">
              Analyzing frame...
            </p>
            <p className="text-gray-500 text-xs mt-2">
              OpenCV is counting people
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  People Count
                </p>
                <p className="text-5xl font-bold text-cyan-400 mt-2">
                  {result.people_count}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Density
                </p>
                <p className={"text-2xl font-bold mt-2 " + (
                  result.density === "Critical" ? "text-red-400" :
                  result.density === "High" ? "text-orange-400" :
                  result.density === "Medium" ? "text-yellow-400" :
                  "text-green-400"
                )}>
                  {result.density}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                Recommendation
              </p>
              <p className="text-white text-sm">{result.recommendation}</p>
            </div>

            {result.annotated_image && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Detected Frame
                </p>
                <img
                  src={"data:image/jpeg;base64," + result.annotated_image}
                  alt="Detection result"
                  className="w-full rounded-xl border border-cyan-500/30"
                />
              </div>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🎥</p>
            <p className="font-medium">Start camera to begin detection</p>
            <p className="text-xs mt-2">
              AI counts people automatically every 4 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
}