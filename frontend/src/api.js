import axios from "axios";

const configuredBaseUrl =
  process.env.REACT_APP_API_URL?.trim();

const API = axios.create({
  baseURL:
    configuredBaseUrl ||
    "http://127.0.0.1:8000",
  timeout: 15000,
});

export default API;
