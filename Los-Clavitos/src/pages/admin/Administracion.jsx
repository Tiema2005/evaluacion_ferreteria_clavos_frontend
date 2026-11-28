import { useState } from "react";
import { Container, Table } from "react-bootstrap";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import FormularioProducto from "../../components/organisms/FormularioProducto";
import Precio from "../../components/atoms/Precio";
import Boton from "../../components/atoms/Boton";
import { useProductos } from "../../context/ProductosContext";
import { useAuth } from "../../context/AuthContext";
import { mensajeErrorApi } from "../../services/productoApi";
import { useTituloPagina } from "../../hooks/useTituloPagina";

const VACIO = { codigo: "", nombre: "", categoria: "", descripcion: "", precioVenta: "", stock: "", stockMinimo: "" };

function validar(p) {
  if (!p.codigo.trim() || !p.nombre.trim() || !p.categoria) return "Completa código, nombre y categoría.";
  if (!Number.isFinite(Number(p.precioVenta)) || Number(p.precioVenta) <= 0) return "Ingresa un precio válido.";
  if (![p.stock, p.stockMinimo].every(v => v !== "" && Number.isInteger(Number(v)) && Number(v) >= 0)) return "El stock y el mínimo deben ser enteros no negativos.";
  if (p.codigo.length > 40 || p.nombre.length > 150 || p.descripcion.length > 500) return "Revisa el largo del código, nombre o descripción.";
  return "";
}

export default function Administracion() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";
  const { productosGestion, categorias, cargando, errorCarga, crear, actualizar, eliminar, ajustarStock } = useProductos();
  const [formulario, setFormulario] = useState(null);
  const [editando, setEditando] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const [ajuste, setAjuste] = useState(null);
  const [nuevoStock, setNuevoStock] = useState("");
  const [motivo, setMotivo] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useTituloPagina("Inventario");

  function empezarCrear() {
    setFormulario({ ...VACIO }); setEditando(null); setConfirmar(null); setAjuste(null); setError(""); setMensaje("");
  }
  function empezarEditar(p) {
    setFormulario({ ...p, precioVenta: String(p.precioVenta), stock: String(p.stock), stockMinimo: String(p.stockMinimo) });
    setEditando(p.codigo); setConfirmar(null); setAjuste(null); setError(""); setMensaje("");
  }
  function cambiar(e) { setFormulario(p => ({ ...p, [e.target.name]: e.target.value })); }

  async function guardar(e) {
    e.preventDefault();
    const fallo = validar(formulario);
    if (fallo) { setError(fallo); return; }
    setProcesando(true); setError(""); setMensaje("");
    try {
      if (editando) {
        const resultado = await actualizar(editando, formulario);
        if (!resultado) throw new Error("El producto ya no está disponible para editar.");
        setMensaje("Producto actualizado en PostgreSQL.");
      } else {
        await crear(formulario);
        setMensaje("Producto creado en PostgreSQL.");
      }
      setFormulario(null); setEditando(null);
    } catch (err) { setError(mensajeErrorApi(err)); }
    finally { setProcesando(false); }
  }
  async function desactivar() {
    if (!confirmar) return;
    setProcesando(true); setError(""); setMensaje("");
    try {
      await eliminar(confirmar);
      setMensaje("Producto desactivado correctamente.");
      setConfirmar(null);
    } catch (err) { setError(mensajeErrorApi(err)); }
    finally { setProcesando(false); }
  }
  function empezarAjuste(p) {
    setAjuste(p.codigo); setNuevoStock(String(p.stock)); setMotivo("");
    setFormulario(null); setError(""); setMensaje("");
  }
  async function guardarAjuste(e) {
    e.preventDefault();
    if (nuevoStock === "" || !Number.isInteger(Number(nuevoStock)) || Number(nuevoStock) < 0 || !motivo.trim()) {
      setError("Ingresa un stock entero no negativo y el motivo del ajuste."); return;
    }
    setProcesando(true); setError(""); setMensaje("");
    try {
      await ajustarStock(ajuste, Number(nuevoStock), motivo);
      setMensaje("Stock actualizado y movimiento registrado en PostgreSQL.");
      setAjuste(null);
    } catch (err) { setError(mensajeErrorApi(err)); }
    finally { setProcesando(false); }
  }

  return (
    <Container className="py-4">
      <EncabezadoPagina titulo="Inventario de productos" descripcion="Gestión del catálogo y stock conectada con Spring Boot y PostgreSQL." />
      {cargando && <p role="status">Actualizando productos desde el servidor...</p>}
      {errorCarga && <p className="alert alert-danger" role="alert">No fue posible cargar los productos: {errorCarga}</p>}
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      {mensaje && <p className="alert alert-success" role="status">{mensaje}</p>}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <span><strong>{productosGestion.length}</strong> productos (incluye desactivados)</span>
        {esAdmin && <Boton texto="Nuevo producto" variante="primary" onClick={empezarCrear} deshabilitado={cargando || procesando} />}
      </div>
      {esAdmin && formulario && (
        <div className="card mb-4"><div className="card-body">
          <FormularioProducto producto={formulario} editando={Boolean(editando)} categorias={categorias.map(c => c.nombre)}
            procesando={procesando} onCambiar={cambiar} onGuardar={guardar} onCancelar={() => setFormulario(null)} />
        </div></div>
      )}
      {ajuste && (
        <form onSubmit={guardarAjuste} className="card p-3 mb-4">
          <h2 className="h5">Ajustar stock: {ajuste}</h2>
          <label className="form-label" htmlFor="stockAjuste">Nuevo stock</label>
          <input id="stockAjuste" className="form-control mb-2" type="number" min="0" step="1" value={nuevoStock} onChange={e => setNuevoStock(e.target.value)} required />
          <label className="form-label" htmlFor="motivoAjuste">Motivo</label>
          <input id="motivoAjuste" className="form-control mb-3" value={motivo} onChange={e => setMotivo(e.target.value)} maxLength="200" required />
          <div className="d-flex gap-2"><Boton texto="Guardar ajuste" variante="success" tipo="submit" deshabilitado={procesando} />
            <Boton texto="Cancelar" variante="secondary" onClick={() => setAjuste(null)} deshabilitado={procesando} /></div>
        </form>
      )}
      {confirmar && esAdmin && (
        <div className="alert alert-warning">
          ¿Desactivar el producto <strong>{confirmar}</strong>? Desaparecerá del catálogo público.
          <div className="d-flex gap-2 mt-2"><Boton texto="Confirmar" variante="danger" onClick={desactivar} deshabilitado={procesando} />
            <Boton texto="Cancelar" variante="secondary" onClick={() => setConfirmar(null)} /></div>
        </div>
      )}
      <Table striped bordered responsive hover>
        <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {productosGestion.map(p => (
            <tr key={p.id}>
              <td>{p.codigo}</td><td>{p.nombre}</td><td>{p.categoria}</td><td><Precio precio={p.precioVenta} /></td>
              <td>{p.stock}</td><td>{p.activo ? "Activo" : "Desactivado"}</td>
              <td><div className="d-flex gap-2 flex-wrap">
                {p.activo && <Boton texto="Ajustar stock" variante="outline-primary" onClick={() => empezarAjuste(p)} deshabilitado={procesando} />}
                {esAdmin && p.activo && <><Boton texto="Editar" variante="outline-secondary" onClick={() => empezarEditar(p)} deshabilitado={procesando} />
                  <Boton texto="Desactivar" variante="outline-danger" onClick={() => setConfirmar(p.codigo)} deshabilitado={procesando} /></>}
              </div></td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!cargando && !errorCarga && productosGestion.length === 0 && <p>No hay productos registrados en la base de datos.</p>}
    </Container>
  );
}
