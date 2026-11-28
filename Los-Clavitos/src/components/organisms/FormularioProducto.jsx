import Selector from "../atoms/Selector";
import CampoInput from "../atoms/CampoInput";
import Boton from "../atoms/Boton";

// Muestra únicamente campos soportados por la tabla producto en PostgreSQL.
function FormularioProducto({ producto, categorias, editando, procesando, onCambiar, onGuardar, onCancelar }) {
  return (
    <form onSubmit={onGuardar}>
      <h4 className="mb-3">{editando ? "Editar producto" : "Nuevo producto"}</h4>
      <div className="row">
        <div className="col-md-6">
          <CampoInput id="codigoInventario" name="codigo" label="Código" value={producto.codigo} onChange={onCambiar} deshabilitado={editando} />
        </div>
        <div className="col-md-6">
          <CampoInput id="nombreInventario" name="nombre" label="Nombre" value={producto.nombre} onChange={onCambiar} />
        </div>
        <div className="col-md-6">
          <Selector id="categoriaInventario" name="categoria" label="Categoría" opciones={categorias} value={producto.categoria} onChange={onCambiar} />
        </div>
        <div className="col-md-6">
          <CampoInput id="precioInventario" name="precioVenta" label="Precio de venta" tipo="number" value={producto.precioVenta} onChange={onCambiar} />
        </div>
        <div className="col-md-6">
          <CampoInput id="stockInventario" name="stock" label="Stock inicial" tipo="number" value={producto.stock} onChange={onCambiar} deshabilitado={editando} />
        </div>
        <div className="col-md-6">
          <CampoInput id="stockMinimoInventario" name="stockMinimo" label="Stock mínimo" tipo="number" value={producto.stockMinimo} onChange={onCambiar} />
        </div>
        <div className="col-12">
          <CampoInput id="descripcionInventario" name="descripcion" label="Descripción" value={producto.descripcion} onChange={onCambiar} />
        </div>
      </div>
      {editando && <p className="small text-secondary">Para modificar existencias usa «Ajustar stock»; así queda registrado el movimiento en PostgreSQL.</p>}
      <div className="d-flex gap-2 flex-wrap">
        <Boton texto={procesando ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"} variante="success" tipo="submit" deshabilitado={procesando} />
        <Boton texto="Cancelar" variante="secondary" onClick={onCancelar} deshabilitado={procesando} />
      </div>
    </form>
  );
}
export default FormularioProducto;
