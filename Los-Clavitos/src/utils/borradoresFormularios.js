// Conserva únicamente información NO sensible mientras está abierta esta pestaña.
// Nunca guardar contraseñas, confirmaciones ni tokens en borradores de formularios.
const CAMPOS_PERMITIDOS = ["nombre", "apellidos", "correo"];

export function leerBorrador(clave) {
  try {
    const datos = JSON.parse(sessionStorage.getItem(clave) || "{}");
    if (!datos || typeof datos !== "object") return {};
    return Object.fromEntries(
      CAMPOS_PERMITIDOS.filter((campo) => typeof datos[campo] === "string")
        .map((campo) => [campo, datos[campo]])
    );
  } catch {
    return {};
  }
}

export function guardarBorrador(clave, datos) {
  try {
    const permitido = Object.fromEntries(
      CAMPOS_PERMITIDOS.filter((campo) => typeof datos[campo] === "string")
        .map((campo) => [campo, datos[campo]])
    );
    sessionStorage.setItem(clave, JSON.stringify(permitido));
  } catch {
    // El formulario debe seguir funcionando si el navegador bloquea storage.
  }
}

export function borrarBorrador(clave) {
  try {
    sessionStorage.removeItem(clave);
  } catch {
    // Ignorar bloqueo de almacenamiento: el servidor sigue controlando el acceso.
  }
}
