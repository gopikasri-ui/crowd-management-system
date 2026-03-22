import { useState } from "react";
import axios from "axios";

export default function UploadDetect() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [fileType, setFileType] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setResult(null);
    setFileName(file.name);
    setFileType(file.type);
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      let fileToSend = file;

      if (file.type.startsWith("video/")) {
        fileToSend = await extractFrameFromVideo(file);
        if (!fileToSend) {
          setError("Could not extract frame from video. Try a shorter video.");
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("file", fileToSend, "upload.jpg");

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
            source: file.type.startsWith("video/") ? "Video Upload" : "Photo Upload"
          }
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Detection failed. Make sure backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
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
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.9);
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
                src={preview}
                alt="Preview"
                className="w-full rounded-xl border border-gray-700 max-h-64 object-cover"
              />
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Detection Results
        </h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4 animate-bounce">🤖</p>
            <p className="text-cyan-400 animate-pulse font-bold text-lg">
              Analyzing with OpenCV...
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {fileType.startsWith("video/")
                ? "Extracting frame from video then detecting..."
                : "Counting people in your image..."}
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