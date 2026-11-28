import { Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import Boton from "../../components/atoms/Boton";
import { useProductos } from "../../context/ProductosContext";
import { useTituloPagina } from "../../hooks/useTituloPagina";

export default function CategoriasAdmin() {
  const navigate = useNavigate();
  const { categorias, productosGestion, cargando, errorCarga } = useProductos();
  useTituloPagina("Categorías");
  return (
    <Container className="py-4">
      <EncabezadoPagina titulo="Categorías" descripcion="Categorías reales consultadas desde PostgreSQL." />
      <Boton texto="Volver al panel" variante="secondary" onClick={() => navigate("/admin")} />
      <p className="alert alert-info mt-3">La API disponible permite consultar categorías. Para crear, editar o eliminar categorías es necesario desarrollar primero los endpoints correspondientes en Spring Boot.</p>
      {cargando && <p>Cargando categorías...</p>}
      {errorCarga && <p role="alert" className="alert alert-danger">{errorCarga}</p>}
      <Table bordered striped responsive className="mt-3">
        <thead><tr><th>Categoría</th><th>Descripción</th><th>Productos asociados</th></tr></thead>
        <tbody>{categorias.map(c => (
          <tr key={c.id}><td>{c.nombre}</td><td>{c.descripcion || "—"}</td>
            <td>{productosGestion.filter(p => p.idCategoria === c.id).length}</td></tr>
        ))}</tbody>
      </Table>
    </Container>
  );
}
