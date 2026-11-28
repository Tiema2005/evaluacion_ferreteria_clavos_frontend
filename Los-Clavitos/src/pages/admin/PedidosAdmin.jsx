import { useCallback, useEffect, useState } from "react";
import { Alert, Container, Spinner, Table, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import Boton from "../../components/atoms/Boton";
import Precio from "../../components/atoms/Precio";
import { listarPedidosApi, cambiarEstadoPedidoApi, errorPedido } from "../../services/pedidoApi";
import { useAuth } from "../../context/AuthContext";
import { useTituloPagina } from "../../hooks/useTituloPagina";

const TRANSICIONES = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["EN_CAMINO", "ENTREGADO", "CANCELADO"],
  EN_CAMINO: ["ENTREGADO"],
};

export function siguientesEstados(p) {
  const opciones = TRANSICIONES[p.estado] || [];
  return opciones.filter(e => e !== "EN_CAMINO" || p.tipoEntrega === "DESPACHO");
}

export default function PedidosAdmin() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useTituloPagina("Gestión de pedidos");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setPedidos(await listarPedidosApi()); }
    catch (e) { setError(errorPedido(e)); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  async function actualizar(id, estado) {
    if (!estado || procesando) return;
    if (!window.confirm(`¿Cambiar pedido #${id} a ${estado}?`)) return;
    setProcesando(id);
    setError("");
    setMensaje("");
    try {
      await cambiarEstadoPedidoApi(id, estado);
      setMensaje(`Pedido #${id} actualizado a ${estado}.`);
      await cargar();
    } catch (e) { setError(errorPedido(e)); }
    finally { setProcesando(null); }
  }

  return <Container className="py-4">
    <EncabezadoPagina titulo="Gestión de pedidos" descripcion="Pedidos y estados reales almacenados en PostgreSQL." />
    <div className="d-flex gap-2 flex-wrap mb-3">
      <Boton texto="Actualizar listado" onClick={cargar} variante="outline-primary" deshabilitado={cargando} />
      <Boton texto={usuario?.rol === "ADMINISTRADOR" ? "Volver al panel" : "Ir al inventario"} variante="outline-secondary" onClick={() => navigate(usuario?.rol === "ADMINISTRADOR" ? "/admin" : "/inventario")} />
    </div>
    {cargando && <p role="status"><Spinner size="sm" /> Cargando...</p>}
    {error && <Alert variant="danger">{error}</Alert>}
    {mensaje && <Alert variant="success">{mensaje}</Alert>}
    {!cargando && !error && pedidos.length === 0 && <Alert variant="info">Aún no hay pedidos.</Alert>}
    {!cargando && pedidos.length > 0 && <Table responsive striped bordered hover>
      <thead><tr><th>N.º</th><th>Cliente</th><th>Entrega</th><th>Estado</th><th>Pago</th><th>Total</th><th>Operaciones</th></tr></thead>
      <tbody>{pedidos.map(p => <tr key={p.id}>
        <td>#{p.numero}</td>
        <td>{p.cliente.nombre} {p.cliente.apellido}</td>
        <td>{p.tipoEntrega}</td>
        <td>{p.estado}</td>
        <td>{p.metodoPago}</td>
        <td><Precio precio={p.total}/></td>
        <td><div className="d-flex gap-2 flex-wrap">
          <Boton texto="Detalle" variante="outline-primary" onClick={() => navigate(`/pedido/${p.numero}`)} />
          {siguientesEstados(p).length > 0 && <Form.Select
            aria-label={`Cambiar estado del pedido ${p.numero}`}
            defaultValue=""
            key={`${p.id}-${p.estado}`}
            disabled={procesando === p.id}
            onChange={e => { void actualizar(p.id, e.target.value); e.target.value = ""; }}
          >
            <option value="">Cambiar estado...</option>
            {siguientesEstados(p).map(e => <option key={e} value={e}>{e}</option>)}
          </Form.Select>}
        </div></td>
      </tr>)}</tbody>
    </Table>}
    <p className="text-secondary small">Cancelar devuelve stock según la transacción del backend. No se permite cancelar pedidos entregados ni en camino.</p>
  </Container>;
}
