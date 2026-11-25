import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import FormularioRegistro from "../../components/organisms/FormularioRegistro";
import Boton from "../../components/atoms/Boton";
import { useTituloPagina } from "../../hooks/useTituloPagina";
import { api } from "../../services/api";
import { datosTienda } from "../../data/tienda";

function Registro() {
    const navigate = useNavigate();
    const [registrado, setRegistrado] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    useTituloPagina("Registro de usuarios");

    async function completarRegistro(datos) {
        setError("");
        setCargando(true);
        try {
            await api.post("/auth/registro", {
                nombre: datos.nombre,
                apellido: datos.apellidos,
                correo: datos.correo,
                password: datos.contrasena
            });
            setRegistrado(true);
        } catch (fallo) {
            const codigo = fallo.response?.status;
            setError(fallo.response?.data?.mensaje ||
                (codigo === 409 ? "Este correo ya se encuentra registrado." :
                codigo === 400 ? "Revisa los datos. La contraseña debe tener al menos 8 caracteres." :
                "No fue posible completar el registro. Revisa la conexión con AWS."));
        } finally {
            setCargando(false);
        }
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col xl={10}>
                    <div className="card border-0 shadow-sm overflow-hidden login-layout">
                        <Row className="g-0 align-items-stretch">
                            <Col lg={5} className="login-panel-info">
                                <div className="p-4 p-lg-5 text-white h-100 d-flex flex-column justify-content-center">
                                    <p className="mb-2 small text-uppercase fw-semibold">Clientes nuevos</p>
                                    <h1 className="h2 mb-3">Crea tu cuenta</h1>
                                    <p className="mb-0 text-white-50">Registra tus datos para organizar tus pedidos en {datosTienda.nombre}.</p>
                                </div>
                            </Col>
                            <Col lg={7}>
                                <div className="p-4 p-lg-5">
                                    <EncabezadoPagina titulo="Registro de usuarios" descripcion="Crea tu cuenta de cliente con datos guardados en PostgreSQL." />
                                    {registrado ? (
                                        <>
                                            <p className="alert alert-success" role="status">
                                                Cuenta creada en el servidor. Ahora puedes iniciar sesión.
                                            </p>
                                            <Boton texto="Ir al inicio de sesión" onClick={() => navigate("/login")} />
                                        </>
                                    ) : (
                                        <>
                                            {error && <p className="alert alert-danger" role="alert">{error}</p>}
                                            <FormularioRegistro onEnviar={completarRegistro} cargando={cargando} />
                                        </>
                                    )}
                                    <p className="mt-4 mb-0 text-secondary">¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>.</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Registro;
