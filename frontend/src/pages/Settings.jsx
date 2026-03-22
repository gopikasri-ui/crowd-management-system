import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { language, changeLanguage } = useAuth();
  const [notifs, setNotifs] = useState(true);
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);
  const [voice, setVoice] = useState(true);
  const [sensitivity, setSensitivity] = useState(70);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "Dark"
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "Dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme) => {
    const body = document.body;
    if (selectedTheme === "Light") {
      body.style.backgroundColor = "#f1f5f9";
      body.style.color = "#0f172a";
      body.classList.add("light-mode");
      body.classList.remove("dark-mode");
    } else {
      body.style.backgroundColor = "#030712";
      body.style.color = "#ffffff";
      body.classList.add("dark-mode");
      body.classList.remove("light-mode");
    }
    localStorage.setItem("theme", selectedTheme);
  };

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
  };

  const handleSave = () => {
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={
        "w-12 h-6 rounded-full transition-colors relative " +
        (value ? "bg-cyan-500" : "bg-gray-700")
      }
    >
      <span
        className={
          "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform " +
          (value ? "translate-x-6" : "translate-x-0.5")
        }
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">
            Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Customize your experience
          </p>
        </div>

        <div className="space-y-4">

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              {[
                { label: "Web Notifications", desc: "Show alerts in browser", value: notifs, set: setNotifs },
                { label: "SMS Alerts", desc: "Receive alerts via SMS", value: sms, set: setSms },
                { label: "Email Alerts", desc: "Get email notifications", value: email, set: setEmail },
                { label: "Voice Alerts", desc: "Speak alerts out loud", value: voice, set: setVoice },
              ].map(({ label, desc, value, set }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <Toggle value={value} onChange={set} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">
              Alert Sensitivity: {sensitivity}%
            </h2>
            <input
              type="range"
              min="10"
              max="100"
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">
              Language
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {["English", "Tamil", "Hindi", "Telugu", "Malayalam", "French", "Arabic"].map((l) => (
                <button
                  key={l}
                  onClick={() => changeLanguage(l)}
                  className={
                    "py-3 rounded-xl font-bold text-sm transition " +
                    (language === l
                      ? "bg-cyan-500 text-gray-950"
                      : "bg-gray-800 text-gray-400 hover:text-white")
                  }
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Selected: {language}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-2">
              Theme
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Current:{" "}
              <span className="text-cyan-400 font-bold">
                {theme} Mode
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange("Dark")}
                className={
                  "flex-1 py-4 rounded-xl font-bold text-sm transition flex flex-col items-center gap-2 " +
                  (theme === "Dark"
                    ? "bg-cyan-500 text-gray-950 border-2 border-cyan-300"
                    : "bg-gray-800 text-gray-400 hover:text-white border-2 border-transparent")
                }
              >
                <span className="text-2xl">🌙</span>
                <span>Dark Mode</span>
                <span className="text-xs opacity-70">Default</span>
              </button>
              <button
                onClick={() => handleThemeChange("Light")}
                className={
                  "flex-1 py-4 rounded-xl font-bold text-sm transition flex flex-col items-center gap-2 " +
                  (theme === "Light"
                    ? "bg-cyan-500 text-gray-950 border-2 border-cyan-300"
                    : "bg-gray-800 text-gray-400 hover:text-white border-2 border-transparent")
                }
              >
                <span className="text-2xl">☀️</span>
                <span>Light Mode</span>
                <span className="text-xs opacity-70">Bright theme</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={
              "w-full py-4 rounded-2xl font-bold text-lg transition " +
              (saved
                ? "bg-green-500 text-white"
                : "bg-cyan-500 hover:bg-cyan-400 text-gray-950")
            }
          >
            {saved ? "✅ Settings Saved!" : "Save Settings"}
          </button>

        </div>
      </div>
    </div>
  );
}