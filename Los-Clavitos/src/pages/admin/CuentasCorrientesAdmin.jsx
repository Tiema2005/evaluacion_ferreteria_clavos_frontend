import { useCallback, useEffect, useState } from "react";
import { Alert, Container, Form, Spinner, Table } from "react-bootstrap";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import Precio from "../../components/atoms/Precio";
import Boton from "../../components/atoms/Boton";
import { habilitarCuentaContratista, listarCuentasContratistas, registrarAbonoCuenta } from "../../services/cuentaCorrienteApi";
import { useTituloPagina } from "../../hooks/useTituloPagina";

export default function CuentasCorrientesAdmin() {
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [abonos, setAbonos] = useState({});
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useTituloPagina("Cuentas corrientes - Administración");

  const actualizar = useCallback(async () => {
    setCargando(true);
    setError("");
    try { setCuentas(await listarCuentasContratistas()); }
    catch (e) { setError(e?.response?.data?.detail || "No se pudo consultar a los contratistas."); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void actualizar(); }, [actualizar]);

  async function habilitar(idUsuario) {
    if (procesando || !window.confirm(`¿Habilitar cuenta corriente del contratista #${idUsuario}?`)) return;
    setProcesando(idUsuario); setError(""); setMensaje("");
    try {
      await habilitarCuentaContratista(idUsuario);
      setMensaje("Cuenta corriente habilitada correctamente.");
      await actualizar();
    } catch (e) { setError(e?.response?.data?.detail || "No se pudo habilitar la cuenta."); }
    finally { setProcesando(null); }
  }

  async function abonar(idUsuario) {
    const valor = abonos[idUsuario] || "";
    const monto = Number(valor);
    if (!Number.isFinite(monto) || monto <= 0 || !Number.isInteger(monto * 100)) {
      setError("Ingresa un monto válido y positivo."); return;
    }
    if (procesando || !window.confirm(`¿Confirmas haber recibido un pago de $${monto.toLocaleString("es-CL")} para este contratista?`)) return;
    setProcesando(idUsuario); setError(""); setMensaje("");
    try {
      await registrarAbonoCuenta(idUsuario, monto, "Abono recibido y verificado por administrador");
      setAbonos(actual => ({ ...actual, [idUsuario]: "" }));
      setMensaje("Abono registrado correctamente en PostgreSQL.");
      await actualizar();
    } catch (e) { setError(e?.response?.data?.detail || e.message || "No se pudo registrar el abono."); }
    finally { setProcesando(null); }
  }

  return <Container className="py-4">
    <EncabezadoPagina titulo="Cuentas corrientes" descripcion="Habilita crédito a contratistas y registra pagos recibidos. Solo ADMINISTRADOR." />
    <div className="mb-3"><Boton texto="Actualizar" variante="outline-primary" onClick={actualizar} deshabilitado={cargando} /></div>
    {error && <Alert variant="danger">{error}</Alert>}
    {mensaje && <Alert variant="success">{mensaje}</Alert>}
    {cargando ? <p role="status"><Spinner size="sm" /> Cargando...</p> :
      <Table striped bordered responsive>
        <thead><tr><th>Contratista</th><th>Cuenta</th><th>Saldo pendiente</th><th>Operación</th></tr></thead>
        <tbody>{cuentas.map(c => <tr key={c.idUsuario}>
          <td>{c.nombre} {c.apellido}<div className="small text-secondary">{c.correo}</div></td>
          <td>{c.estado}</td>
          <td><Precio precio={c.saldo} /></td>
          <td>{c.estado !== "ACTIVA" ?
            <Boton texto="Habilitar cuenta" onClick={() => habilitar(c.idUsuario)} deshabilitado={procesando !== null} /> :
            <Form onSubmit={e => { e.preventDefault(); void abonar(c.idUsuario); }}>
              <Form.Label className="small">Registrar pago recibido</Form.Label>
              <Form.Control aria-label={`Monto abono ${c.correo}`} type="number" min="0.01" step="0.01" max={Math.max(0, c.saldo)} required
                value={abonos[c.idUsuario] || ""} onChange={e => setAbonos(actual => ({ ...actual, [c.idUsuario]: e.target.value }))}
                disabled={procesando !== null || c.saldo <= 0} />
              <div className="mt-2"><Boton texto="Registrar abono" tipo="submit" deshabilitado={procesando !== null || c.saldo <= 0} /></div>
            </Form>}
          </td>
        </tr>)}</tbody>
      </Table>}
    {!cargando && cuentas.length === 0 && <Alert variant="info">No hay contratistas activos registrados.</Alert>}
  </Container>;
}
