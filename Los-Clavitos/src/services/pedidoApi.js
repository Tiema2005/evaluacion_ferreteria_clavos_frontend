import { api } from "./api";
import { mensajeErrorApi } from "./productoApi";

// El servidor identifica al comprador a partir del JWT, nunca del correo del formulario.
export function prepararSolicitud(items, { tipoEntrega, metodoPago, direccion = "" }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Agrega al menos un producto al carrito.");
  }
  if (!["RETIRO", "DESPACHO"].includes(tipoEntrega)) {
    throw new Error("Selecciona un tipo de entrega válido.");
  }
  if (!["EFECTIVO", "TARJETA", "CUENTA_CORRIENTE"].includes(metodoPago)) {
    throw new Error("Selecciona un medio de pago válido.");
  }
  const direccionLimpia = String(direccion).trim();
  if (tipoEntrega === "DESPACHO" && (!direccionLimpia || direccionLimpia.length > 250)) {
    throw new Error("Ingresa una dirección de despacho (máximo 250 caracteres).");
  }
  const vistos = new Set();
  const productos = items.map(item => {
    const idProducto = Number(item.id);
    const cantidad = Number(item.cantidad);
    if (!Number.isSafeInteger(idProducto) || idProducto < 1 ||
        !Number.isSafeInteger(cantidad) || cantidad < 1) {
      throw new Error("El carrito contiene productos o cantidades inválidas.");
    }
    if (vistos.has(idProducto)) throw new Error("El carrito contiene productos duplicados.");
    vistos.add(idProducto);
    return { idProducto, cantidad };
  });
  return { tipoEntrega, metodoPago, direccion: tipoEntrega === "DESPACHO" ? direccionLimpia : "", productos };
}

export function adaptarPedido(p) {
  if (!p || typeof p !== "object") throw new Error("La API devolvió un pedido inválido.");
  const id = Number(p.id_pedido ?? p.id);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("El pedido no tiene identificador válido.");
  const lineas = Array.isArray(p.productos) ? p.productos : [];
  return {
    id, numero: String(id),
    fecha: p.fecha_pedido ?? p.fecha ?? null,
    estado: p.estado || "PENDIENTE",
    tipoEntrega: p.tipo_entrega || "",
    metodoPago: p.metodo_pago || "",
    total: Number(p.total ?? 0),
    cliente: { nombre: p.nombre || "", apellido: p.apellido || "", correo: p.correo || "" },
    productos: lineas.map(d => ({
      codigo: d.codigo || String(d.id_producto ?? ""),
      nombre: d.nombre || "Producto",
      cantidad: Number(d.cantidad),
      precioVenta: Number(d.precio_unitario || 0),
      subtotal: Number(d.subtotal ?? Number(d.cantidad) * Number(d.precio_unitario || 0)),
    })),
    despacho: Array.isArray(p.despacho) ? p.despacho : [],
  };
}

export async function crearPedidoApi(items, datos) {
  const solicitud = prepararSolicitud(items, datos);
  const { data } = await api.post("/pedidos", solicitud);
  return adaptarPedido(data);
}

export async function listarPedidosApi() {
  const { data } = await api.get("/pedidos");
  if (!Array.isArray(data)) throw new Error("El servidor no devolvió una lista de pedidos.");
  return data.map(adaptarPedido);
}

export async function obtenerPedidoApi(id) {
  if (!/^[1-9]\d*$/.test(String(id))) throw new Error("Número de pedido inválido.");
  const { data } = await api.get(`/pedidos/${id}`);
  return adaptarPedido(data);
}

export async function cambiarEstadoPedidoApi(id, estado) {
  if (!/^[1-9]\d*$/.test(String(id))) throw new Error("Número de pedido inválido.");
  const { data } = await api.put(`/pedidos/${id}/estado`, { estado });
  return adaptarPedido(data);
}

export function errorPedido(error) {
  if (!error?.response) return "No se pudo confirmar la respuesta del servidor. Antes de reintentar, consulta Mis pedidos: la compra podría haberse registrado.";
  const codigo = error.response.status;
  if (codigo === 404) return "El pedido o producto solicitado no existe o está inactivo.";
  if (codigo === 400) return error.response?.data?.detail || "Revisa los datos del pedido.";
  return mensajeErrorApi(error);
}
