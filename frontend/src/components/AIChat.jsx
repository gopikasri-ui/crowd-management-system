import { useState, useRef, useEffect } from "react";
import axios from "axios";

const QUICK_REPLIES = [
  "Is this area safe?",
  "How to use webcam?",
  "What is crowd density?",
  "Emergency help!",
  "How to search a place?",
  "What do alerts mean?",
];

const LOCAL_RESPONSES = {
  hello: "Hello! I am Flix 🤖 Your AI crowd safety assistant. How can I help you stay safe today?",
  hi: "Hi there! I am Flix. Ask me anything about crowd safety, map, detection or alerts!",
  help: "I can help you with: \n• Crowd density levels\n• Live map navigation\n• AI detection (webcam/upload)\n• Alert meanings\n• Emergency guidance\n\nWhat do you need?",
  safe: "To check if an area is safe: Go to Live Map → Search the location → Green circles mean safe, Red means critical crowd density.",
  crowd: "Crowd density levels:\n🟢 Low — Under 10 people\n🟡 Medium — 10-29 people\n🟠 High — 30-59 people\n🔴 Critical — 60+ people\n\nCheck Live Map for real-time density!",
  webcam: "To use webcam detection:\n1. Go to AI Detection page\n2. Click USB Webcam tab\n3. Click Start Camera\n4. Allow camera permission\n5. Click Detect Now or wait 4 seconds for auto-detection!",
  upload: "To upload a photo/video:\n1. Go to AI Detection page\n2. Click Upload Photo/Video tab\n3. Click the upload box\n4. Select your image or video\n5. AI will count people automatically!",
  alert: "Alerts are triggered when:\n🚨 Critical density detected from camera\n⚠️ High crowd in searched location\n\nGo to Alerts page to see all notifications with recommendations!",
  map: "To use Live Map:\n1. Go to Live Map page\n2. Type any place name in search box\n3. Press Search or Enter\n4. See colored circles showing crowd density\n5. Red = avoid, Green = safe!",
  emergency: "🚨 EMERGENCY PROTOCOL:\n1. Call 112 immediately\n2. Move away from crowd\n3. Find open space\n4. Follow security personnel\n5. Use alternate exits\n\nStay calm and move quickly!",
  density: "Crowd density is measured by number of people in an area:\n• Low: Safe to enter\n• Medium: Stay alert\n• High: Consider alternate route\n• Critical: Evacuate immediately!",
  detection: "AI Detection uses OpenCV to count people in:\n📸 Photos — Upload any image\n🎬 Videos — Upload video file\n🎥 Webcam — Live camera feed\n📡 IP Camera — CCTV connection\n\nGo to AI Detection page to try it!",
  analytics: "Analytics shows:\n📊 Crowd density by location\n📈 Alert frequency\n🔮 AI predictions\n🗺️ Recent map searches\n\nAll data is based on your real searches!",
  feedback: "To submit feedback:\n1. Go to Feedback page\n2. Enter your name and email\n3. Rate with stars (1-5)\n4. Write your message\n5. Click Submit!\n\nAll feedback is saved permanently.",
  settings: "In Settings you can:\n🌙 Switch Dark/Light theme\n🌐 Change language (7 languages)\n🔔 Toggle notifications\n📊 Adjust alert sensitivity",
  ip: "To connect IP Camera/CCTV:\n1. Go to AI Detection page\n2. Click IP Camera tab\n3. Enter camera URL like:\nhttp://192.168.1.64:8080/video\n4. Click Connect!",
  language: "Supported languages:\n🇮🇳 Tamil, Hindi, Telugu, Malayalam\n🌍 English, French, Arabic\n\nChange in Settings page!",
  otp: "OTP for demo is: 123456\nEnter this on the OTP screen after login or signup!",
  login: "To login:\n1. Enter your email\n2. Enter your password\n3. Click Login\n4. Enter OTP: 123456\n5. You are in!",
  signup: "To sign up:\n1. Click Sign Up tab\n2. Enter name, email, password, phone\n3. Click Sign Up\n4. Enter OTP: 123456\n5. Account created!",
};

function getLocalReply(message) {
  const msg = message.toLowerCase();
  for (const [key, response] of Object.entries(LOCAL_RESPONSES)) {
    if (msg.includes(key)) return response;
  }
  return null;
}

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I am Flix 🤖 Your AI crowd safety assistant!\n\nI can help you with crowd density, map navigation, AI detection, alerts and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    const userMsg = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const localReply = getLocalReply(messageText);
    if (localReply) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: localReply },
        ]);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const res = await axios.post(
        "https://crowd-backend-0m8x.onrender.com/api/chat/message",
        { message: messageText }
      );
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I could not connect to backend. Try asking about: crowd, map, detection, alerts, emergency, webcam, upload!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {open && (
        <div className="w-80 bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden" style={{ height: "480px" }}>

          <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <p className="font-bold text-white text-sm">Flix</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-cyan-100">Always online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-cyan-200 text-lg font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start items-start gap-2"}>
                {msg.role === "bot" && (
                  <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div className={msg.role === "user"
                  ? "max-w-xs px-3 py-2 rounded-2xl rounded-tr-sm text-sm bg-cyan-500 text-gray-950 font-medium"
                  : "max-w-xs px-3 py-2 rounded-2xl rounded-tl-sm text-sm bg-gray-800 text-gray-200 whitespace-pre-line"
                }>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start items-start gap-2">
                <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  🤖
                </div>
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-2 flex-shrink-0 border-t border-gray-800">
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_REPLIES.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(qr)}
                  className="text-xs bg-gray-800 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full whitespace-nowrap transition flex-shrink-0"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 p-3 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Flix anything..."
              className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 border border-gray-700"
            />
            <button
              onClick={() => sendMessage()}
              className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-4 py-2 rounded-xl transition text-sm"
            >
              Send
            </button>
          </div>

        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-16 h-16 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-full flex items-center justify-center shadow-xl transition text-3xl"
      >
        {open ? "✕" : "🤖"}
      </button>

    </div>
  );
}