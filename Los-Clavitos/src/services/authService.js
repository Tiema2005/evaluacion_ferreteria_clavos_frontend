import { api } from "./api";

const CLAVE_SESION = "ferreteria_sesion";

export function obtenerSesion() {
  try {
    const raw = sessionStorage.getItem(CLAVE_SESION);
    if (!raw) return null;
    const sesion = JSON.parse(raw);
    if (!sesion.token || !sesion.expiraEn || Date.now() >= sesion.expiraEn) {
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }
    return sesion;
  } catch {
    sessionStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

export async function iniciarSesion(correo, contrasena) {
  const respuesta = await api.post("/auth/login", {
    correo: correo.trim(),
    password: contrasena,
  });

  const datos = respuesta.data;
  if (!datos.token || !datos.usuario) {
    throw new Error("La API no devolvió una sesión válida.");
  }

  const sesion = {
    token: datos.token,
    usuario: datos.usuario,
    expiraEn: Date.now() + Number(datos.expiraEnSegundos) * 1000,
  };
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  window.dispatchEvent(new Event("ferreteria:sesion"));
  return sesion;
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  window.dispatchEvent(new Event("ferreteria:sesion"));
}
