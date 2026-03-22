import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LABELS = {
  English: {
    dashboard: "Dashboard",
    map: "Live Map",
    detection: "AI Detection",
    alerts: "Alerts",
    analytics: "Analytics",
    feedback: "Feedback",
    settings: "Settings",
    logout: "Logout",
    role: "",
  },
  Tamil: {
    dashboard: "டாஷ்போர்டு",
    map: "நேரடி வரைபடம்",
    detection: "AI கண்டறிதல்",
    alerts: "எச்சரிக்கைகள்",
    analytics: "பகுப்பாய்வு",
    feedback: "கருத்து",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    role: "",
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    map: "लाइव मानचित्र",
    detection: "AI पहचान",
    alerts: "अलर्ट",
    analytics: "विश्लेषण",
    feedback: "प्रतिक्रिया",
    settings: "सेटिंग्स",
    logout: "लॉग आउट",
    role: "",
  },
  Telugu: {
    dashboard: "డాష్‌బోర్డ్",
    map: "లైవ్ మ్యాప్",
    detection: "AI డిటెక్షన్",
    alerts: "అలర్ట్స్",
    analytics: "అనలిటిక్స్",
    feedback: "అభిప్రాయం",
    settings: "సెట్టింగులు",
    logout: "లాగ్అవుట్",
    role: "",
  },
  Malayalam: {
    dashboard: "ഡാഷ്‌ബോർഡ്",
    map: "തത്സമയ മാപ്പ്",
    detection: "AI കണ്ടെത്തൽ",
    alerts: "അലർട്ടുകൾ",
    analytics: "വിശകലനം",
    feedback: "അഭിപ്രായം",
    settings: "ക്രമീകരണങ്ങൾ",
    logout: "ലോഗൗട്ട്",
    role: "",
  },
  French: {
    dashboard: "Tableau de bord",
    map: "Carte en direct",
    detection: "Détection IA",
    alerts: "Alertes",
    analytics: "Analytique",
    feedback: "Commentaires",
    settings: "Paramètres",
    logout: "Déconnexion",
    role: "",
  },
  Arabic: {
    dashboard: "لوحة التحكم",
    map: "الخريطة المباشرة",
    detection: "كشف الذكاء",
    alerts: "التنبيهات",
    analytics: "التحليلات",
    feedback: "ملاحظات",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    role: "",
  },
};

export default function Navbar() {
  const { user, logout, language } = useAuth();
  const location = useLocation();
  const labels = NAV_LABELS[language] || NAV_LABELS.English;

  const links = [
    { path: "/", label: "🏠 " + labels.dashboard },
    { path: "/map", label: "🗺️ " + labels.map },
    { path: "/detection", label: "🤖 " + labels.detection },
    { path: "/alerts", label: "🚨 " + labels.alerts },
    { path: "/analytics", label: "📊 " + labels.analytics },
    { path: "/feedback", label: "💬 " + labels.feedback },
    { path: "/settings", label: "⚙️ " + labels.settings },
  ];

  return (
    <nav className="bg-gray-900 border-b border-cyan-500/20 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <div className="flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-cyan-400 text-sm leading-none">
              CrowdAI
            </p>
            <p className="text-xs text-gray-500 leading-none">
              Emergency System
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-1 flex-wrap justify-center">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={
                "px-3 py-2 rounded-lg text-xs transition " +
                (location.pathname === l.path
                  ? "bg-cyan-500/20 text-cyan-400 font-bold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800")
              }
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-400">{user?.email}</p>
            <p className="text-xs text-cyan-400 font-bold uppercase">
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-red-400 border border-red-400/30 px-3 py-2 rounded-lg hover:bg-red-400/10 transition"
          >
            {labels.logout}
          </button>
        </div>

      </div>
    </nav>
  );
}