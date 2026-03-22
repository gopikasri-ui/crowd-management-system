import axios from "axios";

const api = axios.create({
  baseURL: "https://crowd-backend-0m8x.onrender.com",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(
    localStorage.getItem("crowd_user") || "{}"
  );
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});