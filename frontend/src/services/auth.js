import { setAuthToken } from "./api";

const KEY = "ny_token";
const USER_KEY = "ny_user";

export const saveSession = (token, user) => {
  localStorage.setItem(KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setAuthToken(token);
};

export const clearSession = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
  setAuthToken(null);
};

export const getToken = () => localStorage.getItem(KEY);

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
