import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("crowd_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "https://crowd-backend-0m8x.onrender.com/api/auth/login",
        { email, password }
      );
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("crowd_user", JSON.stringify(userData));
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const loginDirect = (userData) => {
    setUser(userData);
    localStorage.setItem("crowd_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crowd_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginDirect,
        logout,
        language,
        changeLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);