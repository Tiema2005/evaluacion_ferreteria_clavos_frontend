import { useEffect, useRef, useState } from "react";
import { Alert, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import Boton from "../../components/atoms/Boton";
import Precio from "../../components/atoms/Precio";
import { useCarrito } from "../../context/CarritoContext";
import { useProductos } from "../../context/ProductosContext";
import { useAuth } from "../../context/AuthContext";
import { crearPedidoApi, errorPedido } from "../../services/pedidoApi";
import { consultarMiCuenta } from "../../services/cuentaCorrienteApi";
import { useTituloPagina } from "../../hooks/useTituloPagina";

export default function ConfirmarPedido() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { items, total, vaciar } = useCarrito();
  const { recargar } = useProductos();
  const [tipoEntrega, setTipoEntrega] = useState("RETIRO");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const [creditoActivo, setCreditoActivo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const bloqueo = useRef(false);
  useTituloPagina("Confirmar pedido");
  useEffect(() => {
    let vigente = true;
    if (usuario?.rol === "CONTRATISTA") {
      consultarMiCuenta().then(c => { if (vigente) setCreditoActivo(c.activa); })
        .catch(() => { if (vigente) setCreditoActivo(false); });
    } else { setCreditoActivo(false); }
    return () => { vigente = false; };
  }, [usuario?.rol]);

  async function confirmar(evento) {
    evento.preventDefault();
    if (bloqueo.current) return;
    bloqueo.current = true;
    setEnviando(true);
    setError("");
    try {
      const pedido = await crearPedidoApi(items, { tipoEntrega, metodoPago, direccion });
      vaciar();
      // La venta ya está confirmada en el servidor: la recarga visual no debe repetirla.
      void recargar();
      navigate(`/pedido/${pedido.numero}`, { replace: true, state: { pedidoCreado: pedido } });
    } catch (fallo) {
      setError(errorPedido(fallo));
      bloqueo.current = false;
      setEnviando(false);
    }
  }

  return (
    <Container className="py-4">
      <EncabezadoPagina titulo="Confirmar pedido" descripcion="El pedido se guarda en PostgreSQL y descuenta stock en Spring Boot." />
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      {!items.length ? (
        <Alert variant="warning">Tu carrito está vacío. <Boton texto="Volver al catálogo" onClick={() => navigate("/catalogo")} /></Alert>
      ) : (
        <Row className="g-4">
          <Col lg={7}>
            <Form onSubmit={confirmar} className="card card-body p-4">
              <h2 className="h5">Datos de compra</h2>
              <p>Comprador: <strong>{usuario?.nombre} {usuario?.apellido}</strong></p>
              <p className="text-secondary small">El pedido quedará asociado a tu cuenta autenticada.</p>
              <Form.Group className="mb-3" controlId="pedidoEntrega">
                <Form.Label>Forma de entrega</Form.Label>
                <Form.Select value={tipoEntrega} onChange={e => setTipoEntrega(e.target.value)} disabled={enviando}>
                  <option value="RETIRO">Retiro en tienda</option>
                  <option value="DESPACHO">Despacho a domicilio</option>
                </Form.Select>
              </Form.Group>
              {tipoEntrega === "DESPACHO" && (
                <Form.Group className="mb-3" controlId="pedidoDireccion">
                  <Form.Label>Dirección de despacho</Form.Label>
                  <Form.Control required maxLength={250} value={direccion} onChange={e => setDireccion(e.target.value)} disabled={enviando} />
                  <Form.Text>La zona de cobertura se confirmará antes del despacho.</Form.Text>
                </Form.Group>
              )}
              <Form.Group className="mb-3" controlId="pedidoPago">
                <Form.Label>Medio de pago</Form.Label>
                <Form.Select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} disabled={enviando}>
                  <option value="EFECTIVO">Efectivo al retirar o recibir</option>
                  <option value="TARJETA">Tarjeta (pago pendiente de coordinación)</option>
                  {usuario?.rol === "CONTRATISTA" && creditoActivo && <option value="CUENTA_CORRIENTE">Cuenta corriente (saldo pendiente)</option>}
                </Form.Select>
                <Form.Text>Esta aplicación registra pedidos; no realiza cobros con tarjeta.</Form.Text>
              </Form.Group>
              <div className="d-flex gap-2 flex-wrap">
                <Boton texto={enviando ? "Registrando..." : "Confirmar pedido"} tipo="submit" variante="success" deshabilitado={enviando} />
                <Boton texto="Volver al carrito" variante="outline-secondary" onClick={() => navigate("/carrito")} deshabilitado={enviando} />
                {enviando && <Spinner size="sm" role="status" />}
              </div>
            </Form>
          </Col>
          <Col lg={5}>
            <div className="card card-body p-4">
              <h2 className="h5">Resumen</h2>
              {items.map(i => <div className="d-flex justify-content-between py-2 border-bottom" key={i.codigo}>
                <span>{i.nombre} × {i.cantidad}</span><Precio precio={i.subtotal} />
              </div>)}
              <div className="d-flex justify-content-between pt-3"><strong>Total</strong><Precio precio={total}/></div>
              <p className="small text-secondary mt-3">Stock y precios se validan nuevamente en el servidor al confirmar.</p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
