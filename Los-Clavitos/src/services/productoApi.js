import { api } from "./api";

// Este servicio es el único que escribe productos en PostgreSQL mediante Spring Boot.
// Los campos opcionales que aún no existen en la BD se representan vacíos en React.
export function adaptarProducto(p) {
  return {
    id: Number(p.id),
    idCategoria: Number(p.idCategoria),
    codigo: String(p.codigo),
    nombre: String(p.nombre),
    descripcion: p.descripcion || "",
    categoria: p.categoria || "",
    subcategoria: "",
    marca: "",
    unidad: "Unidad",
    precioCompra: "",
    precioVenta: Number(p.precio),
    stock: Number(p.stockActual),
    stockMinimo: Number(p.stockMinimo),
    imagen: "",
    activo: Boolean(p.activo),
  };
}

export function mensajeErrorApi(error) {
  const detalle = error.response?.data;
  if (error.response?.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (error.response?.status === 403) return "No tienes permisos para realizar esta operación.";
  if (error.response?.status === 409) return detalle?.detail || "Conflicto: código duplicado o stock insuficiente.";
  return detalle?.detail || detalle?.message || error.message || "No se pudo conectar al backend.";
}

function verificarRespuestaLista(datos) {
  if (!Array.isArray(datos)) throw new Error("La API no devolvió una lista válida.");
  return datos;
}

export async function cargarCatalogoApi() {
  const { data } = await api.get("/productos");
  return verificarRespuestaLista(data).map(adaptarProducto);
}

export async function cargarGestionApi() {
  const { data } = await api.get("/productos/gestion");
  return verificarRespuestaLista(data).map(adaptarProducto);
}

export async function cargarCategoriasApi() {
  const { data } = await api.get("/categorias");
  return verificarRespuestaLista(data).map(c => ({
    id: Number(c.id), nombre: String(c.nombre), descripcion: c.descripcion || "",
  }));
}

function cuerpo(datos, categorias, nuevo) {
  const categoria = categorias.find(c => c.nombre === datos.categoria);
  if (!categoria) throw new Error("Selecciona una categoría registrada en PostgreSQL.");
  const base = {
    idCategoria: categoria.id,
    codigo: String(datos.codigo || "").trim(),
    nombre: String(datos.nombre || "").trim(),
    descripcion: String(datos.descripcion || "").trim(),
    precio: Number(datos.precioVenta),
    stockMinimo: Number(datos.stockMinimo),
  };
  if (nuevo) base.stockActual = Number(datos.stock);
  return base;
}

export async function crearProductoApi(datos, categorias) {
  const { data } = await api.post("/productos", cuerpo(datos, categorias, true));
  return adaptarProducto(data);
}

export async function editarProductoApi(producto, categorias) {
  const { data } = await api.put(`/productos/${producto.id}`, cuerpo(producto, categorias, false));
  return adaptarProducto(data);
}

export async function desactivarProductoApi(id) {
  await api.delete(`/productos/${id}`);
  return true;
}

export async function ajustarStockApi(id, stockActual, motivo) {
  const { data } = await api.put(`/productos/${id}/stock`, {
    stockActual: Number(stockActual),
    motivo: String(motivo || "").trim(),
  });
  return adaptarProducto(data);
}
