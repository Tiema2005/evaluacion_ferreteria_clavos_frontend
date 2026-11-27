import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { obtenerSesion, cerrarSesion } from "../services/authService";

const AuthContext = createContext(null);
const CLAVE_SESION = "ferreteria_sesion";

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => obtenerSesion());
  const [comprobandoSesion, setComprobandoSesion] = useState(() => Boolean(obtenerSesion()));
  const [errorSesion, setErrorSesion] = useState(false);
  const solicitudActual = useRef(0);

  const revalidarSesion = useCallback(async () => {
    const guardada = obtenerSesion();
    const solicitud = ++solicitudActual.current;

    if (!guardada) {
      setSesion(null);
      setComprobandoSesion(false);
      setErrorSesion(false);
      return;
    }

    setComprobandoSesion(true);
    setErrorSesion(false);
    try {
      // El interceptor de api.js adjunta Authorization: Bearer <token>.
      const respuesta = await api.get("/auth/me");
      // Ignorar solicitudes antiguas si el usuario cerró sesión o inició otra.
      if (solicitudActual.current !== solicitud || obtenerSesion()?.token !== guardada.token) return;

      const actualizada = { ...guardada, usuario: respuesta.data };
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(actualizada));
      setSesion(actualizada);
    } catch (error) {
      if (solicitudActual.current !== solicitud) return;
      if (error.response?.status === 401 || error.response?.status === 403) {
        cerrarSesion();
        setSesion(null);
      } else {
        // No mostrar páginas privadas si no conseguimos verificar con el servidor.
        // Un corte de red NO elimina por sí solo la sesión: permitimos reintentar.
        setErrorSesion(true);
      }
    } finally {
      if (solicitudActual.current === solicitud) setComprobandoSesion(false);
    }
  }, []);

  useEffect(() => {
    const revisar = () => { void revalidarSesion(); };
    const revisarAlVolver = () => {
      if (document.visibilityState === "visible") void revalidarSesion();
    };
    window.addEventListener("ferreteria:sesion", revisar);
    window.addEventListener("focus", revisar);
    window.addEventListener("pageshow", revisar);
    document.addEventListener("visibilitychange", revisarAlVolver);
    revisar();
    return () => {
      window.removeEventListener("ferreteria:sesion", revisar);
      window.removeEventListener("focus", revisar);
      window.removeEventListener("pageshow", revisar);
      document.removeEventListener("visibilitychange", revisarAlVolver);
    };
  }, [revalidarSesion]);

  useEffect(() => {
    if (!sesion) return;
    const restante = Math.max(0, sesion.expiraEn - Date.now());
    const temporizador = setTimeout(() => cerrarSesion(), restante);
    return () => clearTimeout(temporizador);
  }, [sesion]);

  const autenticado = Boolean(sesion) && !comprobandoSesion && !errorSesion;
  return (
    <AuthContext.Provider value={{
      sesion: autenticado ? sesion : null,
      usuario: autenticado ? sesion.usuario : null,
      autenticado,
      esAdmin: autenticado && sesion.usuario.rol === "ADMINISTRADOR",
      comprobandoSesion,
      errorSesion,
      revalidarSesion,
      cerrarSesion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return contexto;
}
