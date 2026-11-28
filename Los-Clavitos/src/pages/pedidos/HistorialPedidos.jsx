import { useCallback, useEffect, useState } from "react";
import { Alert, Container, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import Boton from "../../components/atoms/Boton";
import Precio from "../../components/atoms/Precio";
import { useAuth } from "../../context/AuthContext";
import { listarPedidosApi, errorPedido } from "../../services/pedidoApi";
import { useTituloPagina } from "../../hooks/useTituloPagina";

export default function HistorialPedidos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  useTituloPagina("Mis pedidos");
  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setPedidos(await listarPedidosApi()); }
    catch (e) { setError(errorPedido(e)); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  return <Container className="py-4">
    <EncabezadoPagina titulo="Mis pedidos" descripcion="Historial asociado a tu cuenta de Ferretería Los Maestros." />
    <p className="text-secondary">Cuenta: {usuario?.correo}</p>
    <div className="mb-3"><Boton texto="Actualizar" variante="outline-primary" onClick={cargar} deshabilitado={cargando} /></div>
    {cargando && <p role="status"><Spinner size="sm" /> Cargando pedidos...</p>}
    {error && <Alert variant="danger">{error}</Alert>}
    {!cargando && !error && pedidos.length === 0 && <Alert variant="info">Aún no tienes pedidos registrados.</Alert>}
    {!cargando && !error && pedidos.length > 0 && <Table striped bordered responsive>
      <thead><tr><th>Pedido</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Detalle</th></tr></thead>
      <tbody>{pedidos.map(p => <tr key={p.id}>
        <td>#{p.numero}</td>
        <td>{p.fecha ? new Date(p.fecha).toLocaleDateString("es-CL") : "-"}</td>
        <td>{p.estado}</td>
        <td><Precio precio={p.total} /></td>
        <td><Boton texto="Ver detalle" variante="outline-primary" onClick={() => navigate(`/pedido/${p.numero}`)} /></td>
      </tr>)}</tbody>
    </Table>}
  </Container>;
}
