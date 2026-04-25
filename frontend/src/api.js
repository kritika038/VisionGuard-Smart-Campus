import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://visionguard-smart-campus-production.up.railway.app",
  timeout: 15000,
});

export default api;