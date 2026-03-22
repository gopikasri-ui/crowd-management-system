import { useState } from "react";
import Navbar from "../components/Navbar";
import WebcamDetect from "../components/WebcamDetect";
import UploadDetect from "../components/UploadDetect";
import IPCameraDetect from "../components/IPCameraDetect";

export default function Detection() {
  const [mode, setMode] = useState("upload");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">
            AI Detection Center
          </h1>
          <p className="text-gray-400 mt-1">
            Connect camera or upload media to detect crowd density
          </p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setMode("upload")}
            className={mode === "upload" ? "px-6 py-3 rounded-xl font-bold transition bg-cyan-500 text-gray-950" : "px-6 py-3 rounded-xl font-bold transition bg-gray-800 text-gray-400 hover:text-white"}
          >
            Upload Photo / Video
          </button>
          <button
            onClick={() => setMode("webcam")}
            className={mode === "webcam" ? "px-6 py-3 rounded-xl font-bold transition bg-cyan-500 text-gray-950" : "px-6 py-3 rounded-xl font-bold transition bg-gray-800 text-gray-400 hover:text-white"}
          >
            USB Webcam
          </button>
          <button
            onClick={() => setMode("ipcam")}
            className={mode === "ipcam" ? "px-6 py-3 rounded-xl font-bold transition bg-cyan-500 text-gray-950" : "px-6 py-3 rounded-xl font-bold transition bg-gray-800 text-gray-400 hover:text-white"}
          >
            IP Camera / CCTV
          </button>
        </div>

        {mode === "upload" && <UploadDetect />}
        {mode === "webcam" && <WebcamDetect />}
        {mode === "ipcam" && <IPCameraDetect />}

      </div>
    </div>
  );
}