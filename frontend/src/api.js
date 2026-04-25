import axios from "axios";

const baseURL = (
  process.env.REACT_APP_API_URL ||
  "https://visionguard-smart-campus-production.up.railway.app"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiBaseURL = baseURL;

export default api;
