import axios from "axios";

// Vite carga VITE_API_URL desde .env.local al iniciar el servidor de desarrollo.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  try {
    const raw = sessionStorage.getItem("ferreteria_sesion");
    if (raw) {
      const sesion = JSON.parse(raw);
      if (sesion.token && Date.now() < sesion.expiraEn) {
        config.headers.Authorization = `Bearer ${sesion.token}`;
      }
    }
  } catch {
    // Si no hay sesión válida, la solicitud se envía sin JWT.
  }
  return config;
});

// Si la API rechaza una petición autenticada por 401, limpiar la sesión local.
// El backend seguirá siendo quien decide los permisos reales (401/403).
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      sessionStorage.removeItem("ferreteria_sesion");
      window.dispatchEvent(new Event("ferreteria:sesion"));
    }
    return Promise.reject(error);
  }
);
