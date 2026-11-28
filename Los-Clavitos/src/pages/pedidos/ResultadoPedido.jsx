import { useEffect, useState } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import ResumenPedido from "../../components/molecules/ResumenPedido";
import Boton from "../../components/atoms/Boton";
import { obtenerPedidoApi, errorPedido } from "../../services/pedidoApi";
import { useTituloPagina } from "../../hooks/useTituloPagina";

export default function ResultadoPedido() {
  const { numero } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(state?.pedidoCreado?.numero === numero ? state.pedidoCreado : null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  useTituloPagina("Detalle de pedido");

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError("");
    obtenerPedidoApi(numero)
      .then(d => { if (activo) setPedido(d); })
      .catch(e => { if (activo) { setPedido(null); setError(errorPedido(e)); } })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [numero]);

  return <Container className="py-4">
    <EncabezadoPagina titulo={`Pedido ${numero}`} descripcion="Información consultada en el servidor." />
    {cargando && <p role="status"><Spinner animation="border" size="sm" /> Consultando pedido...</p>}
    {error && <Alert variant="danger">{error}</Alert>}
    {pedido && <div className="card card-body p-4">
      <Alert variant="success">Pedido registrado en PostgreSQL. Estado actual: <strong>{pedido.estado}</strong>.</Alert>
      <p><strong>Cliente:</strong> {pedido.cliente.nombre} {pedido.cliente.apellido}</p>
      <p><strong>Fecha:</strong> {pedido.fecha ? new Date(pedido.fecha).toLocaleString("es-CL") : "Sin fecha"}</p>
      <p><strong>Entrega:</strong> {pedido.tipoEntrega}</p>
      <p><strong>Pago:</strong> {pedido.metodoPago} (sin cobro electrónico)</p>
      {pedido.despacho?.[0]?.direccion_entrega && <p><strong>Dirección:</strong> {pedido.despacho[0].direccion_entrega}</p>}
      {pedido.productos.length > 0 && <ResumenPedido items={pedido.productos} total={pedido.total} titulo="Productos solicitados" />}
      <div className="mt-4"><Boton texto="Ver historial" onClick={() => navigate("/historial")} /></div>
    </div>}
    {!pedido && !cargando && !error && <Alert variant="warning">No existe el pedido.</Alert>}
  </Container>;
}
