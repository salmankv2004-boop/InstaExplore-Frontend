// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://instaexpolre-backend.onrender.com/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // ✅ MUST return config
  },
  (error) => Promise.reject(error)
);

export default api;
