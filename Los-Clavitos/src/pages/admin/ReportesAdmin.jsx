import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import Boton from "../../components/atoms/Boton";
import Precio from "../../components/atoms/Precio";
import { useProductos } from "../../context/ProductosContext";
import { listarPedidosApi, errorPedido } from "../../services/pedidoApi";
import { api } from "../../services/api";
import { useTituloPagina } from "../../hooks/useTituloPagina";
import { validarCorreo } from "../../utils/validaciones";

function cargarPerfil() {
    try {
        const datos = JSON.parse(localStorage.getItem("perfilAdministracion") || "null");
        if (datos && typeof datos.nombre === "string" && typeof datos.correo === "string") {
            return datos;
        }
    } catch {
        // Datos anteriores inválidos: mostrar formulario vacío.
    }
    return { nombre: "", correo: "" };
}

function ReportesAdmin() {
    const navigate = useNavigate();
    const { productos } = useProductos();
    const [perfil, setPerfil] = useState(cargarPerfil);
    const [mensajePerfil, setMensajePerfil] = useState("");
    const [errorPerfil, setErrorPerfil] = useState("");

    function guardarPerfil(evento) {
        evento.preventDefault();
        if (!perfil.nombre.trim() || validarCorreo(perfil.correo)) {
            setErrorPerfil("Ingrese un nombre y correo electrónico válidos.");
            setMensajePerfil("");
            return;
        }
        const datos = { nombre: perfil.nombre.trim(), correo: perfil.correo.trim() };
        localStorage.setItem("perfilAdministracion", JSON.stringify(datos));
        setPerfil(datos);
        setErrorPerfil("");
        setMensajePerfil("Perfil de demostración guardado correctamente.");
    }
    const [pedidos, setPedidos] = useState([]);
    const [totalUsuarios, setTotalUsuarios] = useState(null);
    const [errorCarga, setErrorCarga] = useState("");
    useEffect(() => {
        let activo = true;
        Promise.all([listarPedidosApi(), api.get("/usuarios")]).then(([p, u]) => {
            if (!activo) return;
            setPedidos(p);
            setTotalUsuarios(Array.isArray(u.data) ? u.data.length : null);
            setErrorCarga("");
        }).catch(e => { if (activo) setErrorCarga(errorPedido(e)); });
        return () => { activo = false; };
    }, []);
    const totalSolicitado = pedidos.reduce((suma, pedido) => suma + pedido.total, 0);
    const pendientesCuenta = pedidos.filter((pedido) => pedido.metodoPago === "CUENTA_CORRIENTE" && pedido.estado !== "CANCELADO");
    const stockCritico = productos.filter((producto) => producto.stock <= 0 || producto.stock < producto.stockMinimo);
    useTituloPagina("Reportes y perfil");

    return (
        <Container className="py-4">
            <EncabezadoPagina
                titulo="Reportes y perfil"
                descripcion="Indicadores de pedidos y usuarios consultados en PostgreSQL. El perfil al final es demostrativo."
            />
            <div className="mb-4"><Boton texto="Volver al panel" variante="secondary" onClick={() => navigate("/admin")} /></div>
            {errorCarga && <Alert variant="danger">No se pudieron cargar los indicadores: {errorCarga}</Alert>}
            <Row className="g-3 mb-4">
                <Col xs={12} md={6} lg={3}>
                    <div className="card h-100"><div className="card-body">
                        <h2 className="h6">Pedidos</h2><p className="h3 mb-0">{pedidos.length}</p>
                    </div></div>
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <div className="card h-100"><div className="card-body">
                        <h2 className="h6">Monto solicitado</h2><p className="h4 mb-0"><Precio precio={totalSolicitado} /></p>
                    </div></div>
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <div className="card h-100"><div className="card-body">
                        <h2 className="h6">Usuarios registrados</h2><p className="h3 mb-0">{totalUsuarios ?? "No disponible"}</p>
                    </div></div>
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <div className="card h-100"><div className="card-body">
                        <h2 className="h6">Stock crítico</h2><p className="h3 mb-0">{stockCritico.length}</p>
                    </div></div>
                </Col>
            </Row>
            <h2 className="h5 fw-bold mt-4 mb-3">Pedidos con cuenta corriente</h2>
            {pendientesCuenta.length === 0 ? <p>No hay pedidos con pago pendiente a fin de mes.</p> : (
                <Table bordered striped responsive>
                    <thead><tr><th>Pedido</th><th>Cliente</th><th>Estado de pago</th><th>Total</th></tr></thead>
                    <tbody>{pendientesCuenta.map((pedido) => (
                        <tr key={pedido.numero}>
                            <td>{pedido.numero}</td>
                            <td>{pedido.cliente.nombre} {pedido.cliente.apellido}</td>
                            <td>Pendiente de gestión</td>
                            <td><Precio precio={pedido.total} /></td>
                        </tr>
                    ))}</tbody>
                </Table>
            )}
            <div className="card mt-4"><div className="card-body">
                <h2 className="h5 fw-bold mb-3">Perfil administrativo</h2>
                <p className="text-secondary small">Datos de referencia del administrador del proyecto (sin autenticación real).</p>
                {errorPerfil && <Alert variant="danger">{errorPerfil}</Alert>}
                {mensajePerfil && <Alert variant="success">{mensajePerfil}</Alert>}
                <Form onSubmit={guardarPerfil}>
                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <Form.Label htmlFor="perfilNombre">Nombre</Form.Label>
                            <Form.Control
                                id="perfilNombre"
                                value={perfil.nombre}
                                onChange={(evento) => setPerfil((anterior) => ({ ...anterior, nombre: evento.target.value }))}
                                required
                            />
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label htmlFor="perfilCorreo">Correo electrónico</Form.Label>
                            <Form.Control
                                id="perfilCorreo"
                                type="email"
                                value={perfil.correo}
                                onChange={(evento) => setPerfil((anterior) => ({ ...anterior, correo: evento.target.value }))}
                                required
                            />
                        </Col>
                    </Row>
                    <div className="mt-3"><Boton tipo="submit" texto="Guardar perfil" /></div>
                </Form>
                <p className="text-secondary small mt-3 mb-0">Rol: Administrador (simulación). No se conceden permisos reales.</p>
            </div></div>
            <p className="text-secondary small mt-4">El monto solicitado no equivale a ingresos cobrados.</p>
        </Container>
    );
}

export default ReportesAdmin;
