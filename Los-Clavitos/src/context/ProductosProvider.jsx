import { useCallback, useEffect, useRef, useState } from "react";
import { ProductosContext } from "./ProductosContext";
import { obtenerSesion } from "../services/authService";
import {
  cargarCatalogoApi, cargarGestionApi, cargarCategoriasApi,
  crearProductoApi, editarProductoApi, desactivarProductoApi, ajustarStockApi,
  mensajeErrorApi,
} from "../services/productoApi";

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [productosGestion, setProductosGestion] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const solicitud = useRef(0);

  const recargar = useCallback(async () => {
    const actual = ++solicitud.current;
    setCargando(true);
    setErrorCarga("");
    try {
      const rol = obtenerSesion()?.usuario?.rol;
      const puedeGestionar = rol === "ADMINISTRADOR" || rol === "VENDEDOR";
      const [catalogo, categoriasApi, gestion] = await Promise.all([
        cargarCatalogoApi(),
        cargarCategoriasApi(),
        puedeGestionar ? cargarGestionApi() : Promise.resolve([]),
      ]);
      if (solicitud.current === actual) {
        setProductos(catalogo.filter(p => p.activo));
        setProductosGestion(gestion);
        setCategorias(categoriasApi);
      }
    } catch (error) {
      if (solicitud.current === actual) {
        setErrorCarga(mensajeErrorApi(error));
        setProductos([]);
        setProductosGestion([]);
        setCategorias([]);
      }
    } finally {
      if (solicitud.current === actual) setCargando(false);
    }
  }, []);

  // Actualiza los permisos y el inventario al cambiar de cuenta o volver a la pestaña.
  useEffect(() => {
    const actualizar = () => { void recargar(); };
    window.addEventListener("ferreteria:sesion", actualizar);
    window.addEventListener("focus", actualizar);
    actualizar();
    return () => {
      ++solicitud.current;
      window.removeEventListener("ferreteria:sesion", actualizar);
      window.removeEventListener("focus", actualizar);
    };
  }, [recargar]);

  async function crear(datos) {
    const nuevo = await crearProductoApi(datos, categorias);
    await recargar();
    return nuevo;
  }
  async function actualizar(codigo, cambios) {
    const producto = productosGestion.find(p => p.codigo === codigo);
    if (!producto) return null;
    const actualizado = await editarProductoApi({ ...producto, ...cambios, id: producto.id }, categorias);
    await recargar();
    return actualizado;
  }
  async function eliminar(codigo) {
    const producto = productosGestion.find(p => p.codigo === codigo && p.activo);
    if (!producto) return false;
    await desactivarProductoApi(producto.id);
    await recargar();
    return true;
  }
  async function ajustarStock(codigo, nuevoStock, motivo) {
    const producto = productosGestion.find(p => p.codigo === codigo && p.activo);
    if (!producto) throw new Error("Producto no encontrado o desactivado.");
    const actualizado = await ajustarStockApi(producto.id, nuevoStock, motivo);
    await recargar();
    return actualizado;
  }

  return (
    <ProductosContext.Provider value={{
      productos, productosGestion, categorias, cargando, errorCarga,
      crear, actualizar, eliminar, ajustarStock, recargar,
    }}>
      {children}
    </ProductosContext.Provider>
  );
}
