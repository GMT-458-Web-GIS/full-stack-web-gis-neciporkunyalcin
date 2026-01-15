import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Auto-load token
const token = localStorage.getItem("ny_token");
if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("ny_token");
      localStorage.removeItem("ny_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
