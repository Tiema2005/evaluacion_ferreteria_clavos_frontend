import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Table, Alert, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Boton from "../../components/atoms/Boton";
import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import { useTituloPagina } from "../../hooks/useTituloPagina";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const ROLES = ["ADMINISTRADOR", "VENDEDOR", "CONTRATISTA", "CLIENTE"];
const VACIO = { nombre: "", apellido: "", correo: "", password: "", rol: "CLIENTE" };

function mensajeError(fallo) {
    const codigo = fallo.response?.status;
    if (codigo === 401) return "La sesión ha vencido o el token no es válido. Inicia sesión otra vez.";
    if (codigo === 403) return "No tienes permiso para ejecutar esta operación.";
    if (codigo === 409) return "Ese correo ya está registrado.";
    return fallo.response?.data?.mensaje ||
        (codigo === 400 ? "Revisa los datos enviados al servidor." :
         "No se pudo conectar o completar la solicitud en AWS.");
}

export default function UsuariosAdmin() {
    const navigate = useNavigate();
    const { usuario: actual } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [datos, setDatos] = useState({ ...VACIO });
    const [editando, setEditando] = useState(null);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [pendienteEliminar, setPendienteEliminar] = useState(null);
    useTituloPagina("Administración de usuarios");

    const cargarUsuarios = useCallback(async () => {
        setCargando(true);
        try {
            const respuesta = await api.get("/usuarios");
            setUsuarios(Array.isArray(respuesta.data) ? respuesta.data : []);
            setError("");
        } catch (fallo) {
            setError(mensajeError(fallo));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

    function cambiar(evento) {
        const { name, value } = evento.target;
        setDatos((anterior) => ({ ...anterior, [name]: value }));
    }

    function cancelar() {
        setEditando(null);
        setDatos({ ...VACIO });
        setError("");
    }

    function editar(usuario) {
        setEditando(usuario.id);
        setDatos({ nombre: usuario.nombre, apellido: usuario.apellido,
            correo: usuario.correo, password: "", rol: usuario.rol });
        setError("");
        setMensaje("");
    }

    async function guardar(evento) {
        evento.preventDefault();
        setError("");
        setMensaje("");
        if (!editando && datos.password.length < 8) {
            setError("Para crear un usuario se requiere una contraseña de al menos 8 caracteres.");
            return;
        }
        if (datos.password && datos.password.length < 8) {
            setError("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                nombre: datos.nombre.trim(), apellido: datos.apellido.trim(),
                correo: datos.correo.trim(), rol: datos.rol,
                ...(datos.password ? { password: datos.password } : {})
            };
            if (editando !== null) {
                await api.put(`/usuarios/${editando}`, payload);
                setMensaje("Usuario actualizado en PostgreSQL.");
            } else {
                await api.post("/usuarios", payload);
                setMensaje("Usuario creado en PostgreSQL.");
            }
            setEditando(null);
            setDatos({ ...VACIO });
            await cargarUsuarios();
        } catch (fallo) {
            setError(mensajeError(fallo));
        } finally {
            setGuardando(false);
        }
    }

    async function desactivar() {
        if (!pendienteEliminar) return;
        setGuardando(true);
        setError("");
        setMensaje("");
        try {
            await api.delete(`/usuarios/${pendienteEliminar.id}`);
            setPendienteEliminar(null);
            setMensaje("Cuenta desactivada correctamente en PostgreSQL (HTTP 204).");
            await cargarUsuarios();
        } catch (fallo) {
            setError(mensajeError(fallo));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <Container className="py-4">
            <EncabezadoPagina
                titulo="Administración de usuarios"
                descripcion="CRUD real en AWS PostgreSQL. Solo ADMINISTRADOR puede listar, crear, cambiar roles y desactivar cuentas."
            />
            <div className="d-flex gap-2 flex-wrap mb-4">
                <Boton texto="Volver al panel" variante="secondary" onClick={() => navigate("/admin")} />
                <Boton texto="Actualizar lista" variante="outline-primary" onClick={cargarUsuarios} deshabilitado={cargando} />
            </div>
            {error && <Alert variant="danger" role="alert">{error}</Alert>}
            {mensaje && <Alert variant="success" role="status">{mensaje}</Alert>}
            {pendienteEliminar && (
                <Alert variant="warning">
                    ¿Desactivar la cuenta <strong>{pendienteEliminar.correo}</strong>? No se borrará físicamente de la base de datos.
                    <div className="d-flex gap-2 mt-3">
                        <Boton texto="Confirmar desactivación" variante="danger" onClick={desactivar} deshabilitado={guardando} />
                        <Boton texto="Cancelar" variante="secondary" onClick={() => setPendienteEliminar(null)} deshabilitado={guardando} />
                    </div>
                </Alert>
            )}
            <section className="card mb-4">
                <div className="card-body p-4">
                    <h2 className="h5 fw-bold mb-3">{editando !== null ? "Editar usuario" : "Crear usuario"}</h2>
                    <Form onSubmit={guardar}>
                        <Row className="g-3">
                            <Col xs={12} md={6}>
                                <Form.Label htmlFor="usuarioNombre">Nombre</Form.Label>
                                <Form.Control id="usuarioNombre" name="nombre" value={datos.nombre} onChange={cambiar} required />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label htmlFor="usuarioApellido">Apellido</Form.Label>
                                <Form.Control id="usuarioApellido" name="apellido" value={datos.apellido} onChange={cambiar} required />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label htmlFor="usuarioCorreo">Correo electrónico</Form.Label>
                                <Form.Control id="usuarioCorreo" name="correo" type="email" value={datos.correo} onChange={cambiar} required />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label htmlFor="usuarioRol">Rol</Form.Label>
                                <Form.Select id="usuarioRol" name="rol" value={datos.rol} onChange={cambiar}>
                                    {ROLES.map((rol) => <option key={rol} value={rol}>{rol}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={12}>
                                <Form.Label htmlFor="usuarioPassword">
                                    {editando !== null ? "Nueva contraseña (opcional; dejar vacía para conservar)" : "Contraseña inicial (mínimo 8 caracteres)"}
                                </Form.Label>
                                <Form.Control id="usuarioPassword" name="password" type="password" value={datos.password}
                                    autoComplete="new-password" onChange={cambiar} minLength={8} required={editando === null} />
                            </Col>
                        </Row>
                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <Boton tipo="submit" texto={guardando ? "Guardando..." : editando !== null ? "Guardar cambios" : "Crear usuario"} deshabilitado={guardando} />
                            {editando !== null && <Boton texto="Cancelar edición" variante="secondary" onClick={cancelar} deshabilitado={guardando} />}
                        </div>
                    </Form>
                </div>
            </section>
            <h2 className="h5 fw-bold mb-3">Usuarios de PostgreSQL ({usuarios.length})</h2>
            {cargando ? (
                <p><Spinner size="sm" animation="border" className="me-2" />Cargando desde AWS...</p>
            ) : usuarios.length === 0 ? (
                <p>No hay usuarios registrados o no se ha podido cargar la lista.</p>
            ) : (
                <Table responsive striped bordered hover>
                    <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                <td>{usuario.id}</td>
                                <td>{usuario.nombre} {usuario.apellido}</td>
                                <td>{usuario.correo}</td>
                                <td>{usuario.rol}</td>
                                <td><Badge bg={usuario.activo ? "success" : "secondary"}>{usuario.activo ? "Activo" : "Inactivo"}</Badge></td>
                                <td>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <Boton texto="Editar" variante="outline-primary" onClick={() => editar(usuario)} deshabilitado={!usuario.activo} />
                                        <Boton texto="Desactivar" variante="outline-danger" onClick={() => setPendienteEliminar(usuario)}
                                            deshabilitado={!usuario.activo || usuario.id === actual?.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <p className="small text-secondary">Las cuentas se guardan en AWS RDS. Las contraseñas nunca se muestran y las bajas son lógicas.</p>
        </Container>
    );
}
