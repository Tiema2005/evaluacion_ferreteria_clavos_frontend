import { createContext, useContext, useEffect, useState } from "react";
import { obtenerSesion, cerrarSesion } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => obtenerSesion());

  useEffect(() => {
    const actualizar = () => setSesion(obtenerSesion());
    window.addEventListener("ferreteria:sesion", actualizar);
    window.addEventListener("focus", actualizar);
    window.addEventListener("pageshow", actualizar);
    return () => {
      window.removeEventListener("ferreteria:sesion", actualizar);
      window.removeEventListener("focus", actualizar);
      window.removeEventListener("pageshow", actualizar);
    };
  }, []);

  useEffect(() => {
    if (!sesion) return;
    const restante = Math.max(0, sesion.expiraEn - Date.now());
    const temporizador = setTimeout(() => cerrarSesion(), restante);
    return () => clearTimeout(temporizador);
  }, [sesion]);

  return (
    <AuthContext.Provider value={{
      sesion,
      usuario: sesion?.usuario ?? null,
      autenticado: Boolean(sesion),
      esAdmin: sesion?.usuario?.rol === "ADMINISTRADOR",
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
