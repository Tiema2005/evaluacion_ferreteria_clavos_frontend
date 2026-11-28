import { useCallback, useEffect, useState } from "react";
import { Alert, Container, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import Precio from "../../components/atoms/Precio";
import Boton from "../../components/atoms/Boton";
import { consultarMiCuenta } from "../../services/cuentaCorrienteApi";
import { useTituloPagina } from "../../hooks/useTituloPagina";

export default function MiCuentaCorriente() {
  const navigate = useNavigate();
  const [cuenta, setCuenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  useTituloPagina("Mi cuenta corriente");

  const actualizar = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setCuenta(await consultarMiCuenta()); }
    catch (e) { setError(e?.response?.data?.detail || "No se pudo consultar la cuenta corriente."); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void actualizar(); }, [actualizar]);

  return <Container className="py-4">
    <EncabezadoPagina titulo="Mi cuenta corriente" descripcion="Saldo y movimientos reales registrados en PostgreSQL. Solo visibles para el titular." />
    <div className="d-flex gap-2 mb-3 flex-wrap">
      <Boton texto="Actualizar saldo" variante="outline-primary" onClick={actualizar} deshabilitado={cargando} />
      <Boton texto="Ir al catálogo" variante="outline-secondary" onClick={() => navigate("/catalogo")} />
    </div>
    {cargando && <p role="status"><Spinner size="sm" /> Consultando cuenta...</p>}
    {error && <Alert variant="danger">{error}</Alert>}
    {!cargando && cuenta && !cuenta.existe && <Alert variant="info">Todavía no tienes una cuenta corriente habilitada. El administrador puede activarla.</Alert>}
    {!cargando && cuenta?.existe && <>
      <div className="card card-body mb-4">
        <h2 className="h5">Estado: {cuenta.estado}</h2>
        <p className="mb-1 text-secondary">Saldo pendiente</p>
        <div className="h3"><Precio precio={cuenta.saldo} /></div>
        {!cuenta.activa && <Alert variant="warning">La cuenta está inactiva. No se permiten nuevas compras a crédito.</Alert>}
        <p className="small mb-0 text-secondary">Los pagos son registrados únicamente por un administrador, después de comprobar su recepción.</p>
      </div>
      <h2 className="h5">Últimos movimientos</h2>
      {cuenta.movimientos.length === 0 ? <Alert variant="info">Todavía no hay movimientos.</Alert> :
        <Table responsive striped bordered>
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Pedido</th><th>Concepto</th><th>Monto</th></tr></thead>
          <tbody>{cuenta.movimientos.map(m => <tr key={m.id}>
            <td>{m.fecha ? new Date(m.fecha).toLocaleString("es-CL") : "—"}</td>
            <td>{m.tipo}</td>
            <td>{m.idPedido ? `#${m.idPedido}` : "—"}</td>
            <td>{m.descripcion}</td>
            <td><Precio precio={m.monto} /></td>
          </tr>)}</tbody>
        </Table>}
    </>}
  </Container>;
}
