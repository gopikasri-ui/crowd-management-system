import { useState, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function UploadDetect() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [fileType, setFileType] = useState("");
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const getDensityLevel = (count) => {
    if (count < 10) return "Low";
    if (count < 30) return "Medium";
    if (count < 60) return "High";
    return "Critical";
  };

  const getRecommendation = (density) => {
    if (density === "Critical") return "Danger! Evacuate immediately and call emergency services.";
    if (density === "High") return "High crowd detected. Avoid this area and use alternate routes.";
    if (density === "Medium") return "Moderate crowd. Stay alert and maintain safe distance.";
    return "Area is safe. Normal crowd levels detected.";
  };

  const detectPeople = async (imageElement) => {
    const model = await cocoSsd.load();
    const predictions = await model.detect(imageElement);
    const people = predictions.filter(p => p.class === "person" && p.score > 0.5);

    const canvas = canvasRef.current;
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0);

    people.forEach(person => {
      const [x, y, w, h] = person.bbox;
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 16px Arial";
      ctx.fillText(`${Math.round(person.score * 100)}%`, x, y - 8);
    });

    ctx.fillStyle = "#00ff00";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`People: ${people.length}`, 20, 45);

    const annotated = canvas.toDataURL("image/jpeg");
    const density = getDensityLevel(people.length);

    return {
      people_count: people.length,
      density,
      recommendation: getRecommendation(density),
      annotated_image: annotated.split(",")[1]
    };
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setResult(null);
    setFileName(file.name);
    setFileType(file.type);
    setLoading(true);

    try {
      let imageElement;

      if (file.type.startsWith("video/")) {
        imageElement = await extractFrameFromVideo(file);
        setPreview(URL.createObjectURL(file));
      } else {
        imageElement = await loadImage(file);
        setPreview(URL.createObjectURL(file));
      }

      const detectionResult = await detectPeople(imageElement);
      setResult(detectionResult);

    } catch (err) {
      console.error("Detection error:", err);
      setError("Detection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(file);
    });
  };

  const extractFrameFromVideo = (videoFile) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.currentTime = 1;
      video.onloadeddata = () => {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = canvas.toDataURL("image/jpeg");
      };
      video.onerror = () => resolve(null);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Upload Photo or Video
        </h2>

        <label className="block w-full border-2 border-dashed border-cyan-500/40 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500 transition">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-cyan-400 font-bold">Click to upload</p>
          <p className="text-gray-500 text-sm mt-1">
            JPG, PNG, MP4, MOV supported
          </p>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {fileName && (
          <div className="mt-3 bg-gray-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-sm">
              {fileType.startsWith("video/") ? "🎬" : "🖼️"}
            </span>
            <p className="text-xs text-gray-400 truncate">{fileName}</p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-xs mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {preview && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              Preview
            </p>
            {fileType.startsWith("video/") ? (
              <video
                src={preview}
                controls
                className="w-full rounded-xl border border-gray-700 max-h-48"
              />
            ) : (
              <img
                ref={imgRef}
                src={preview}
                alt="Preview"
                className="w-full rounded-xl border border-gray-700 max-h-64 object-cover"
              />
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Detection Results
        </h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4 animate-bounce">🤖</p>
            <p className="text-cyan-400 animate-pulse font-bold text-lg">
              AI Detecting People...
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Running on your browser — no backend needed!
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  People Found
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
                  AI Detection Output
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
            <p className="text-4xl mb-3">🖼️</p>
            <p className="font-medium">Upload an image or video</p>
            <p className="text-xs mt-2">
              AI will count all people and show density level
            </p>
          </div>
        )}
      </div>
    </div>
  );
}