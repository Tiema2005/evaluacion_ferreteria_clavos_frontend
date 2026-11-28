import { api } from "./api";

export function adaptarCuenta(datos = {}) {
  const movimientos = Array.isArray(datos.movimientos) ? datos.movimientos : [];
  return {
    existe: Boolean(datos.existe),
    activa: Boolean(datos.activa),
    estado: String(datos.estado ?? "SIN_CUENTA"),
    idCuenta: datos.idCuenta ?? null,
    fechaApertura: datos.fechaApertura ?? null,
    saldo: Number(datos.saldo ?? 0),
    movimientos: movimientos.map(m => ({
      id: Number(m.id),
      idPedido: m.idPedido == null ? null : Number(m.idPedido),
      fecha: m.fecha,
      tipo: String(m.tipo),
      monto: Number(m.monto),
      descripcion: m.descripcion ?? "",
    })),
  };
}

export async function consultarMiCuenta() {
  const { data } = await api.get("/cuenta-corriente/mi-cuenta");
  return adaptarCuenta(data);
}

export async function listarCuentasContratistas() {
  const { data } = await api.get("/cuenta-corriente/admin");
  if (!Array.isArray(data)) throw new Error("Respuesta de cuentas corrientes inválida.");
  return data.map(c => ({
    ...c,
    idUsuario: Number(c.idUsuario),
    saldo: Number(c.saldo ?? 0),
  }));
}

export async function habilitarCuentaContratista(idUsuario) {
  const { data } = await api.post(`/cuenta-corriente/admin/usuarios/${idUsuario}/habilitar`);
  return adaptarCuenta(data);
}

export async function registrarAbonoCuenta(idUsuario, monto, descripcion) {
  if (!Number.isFinite(Number(monto)) || Number(monto) <= 0 ||
      Math.round(Number(monto) * 100) !== Number(monto) * 100) {
    throw new Error("Ingresa un monto positivo de hasta dos decimales.");
  }
  const { data } = await api.post(`/cuenta-corriente/admin/usuarios/${idUsuario}/abonos`, {
    monto: Number(monto), descripcion: String(descripcion || "Pago registrado por administrador").trim(),
  });
  return adaptarCuenta(data);
}
