import { Navbar, Nav, Container, NavDropdown, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { datosTienda } from "../../data/tienda";
import { useAuth } from "../../context/AuthContext";

function NavbarPrincipal({ nombre, enlaces }) {
    const { usuario, autenticado, cerrarSesion } = useAuth();
    const navigate = useNavigate();
    const accesosPrincipales = enlaces.filter((enlace) =>
        ["Inicio", "Catálogo", "Categorías", "Ofertas", "Carrito", "Administración"].includes(enlace.texto)
    );
    const accesosInformacion = enlaces.filter((enlace) =>
        ["Nosotros", "Blog", "Contacto", "Mis compras", "Registrarse", "Iniciar Sesión"].includes(enlace.texto)
    );

    function salir() {
        cerrarSesion();
        navigate("/login", { replace: true });
    }

    return (
        <>
            <div className="barra-superior py-2">
                <Container className="d-flex flex-column flex-md-row justify-content-between gap-2 small">
                    <span>{datosTienda.telefono} · {datosTienda.horarioAtencion}</span>
                    <span>{datosTienda.direccion}, {datosTienda.comuna}</span>
                </Container>
            </div>

            <Navbar expand="lg" bg="white" className="shadow-sm border-bottom barra-principal sticky-top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="d-flex flex-column">
                        <span>{nombre}</span>
                        <small className="text-secondary">Materiales y herramientas para tu obra</small>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="menu-principal" />
                    <Navbar.Collapse id="menu-principal">
                        <Nav className="ms-auto align-items-lg-center gap-lg-1">
                            {accesosPrincipales.map((enlace) => (
                                <Nav.Link key={enlace.texto} as={Link} to={enlace.ruta}>{enlace.texto}</Nav.Link>
                            ))}
                            {accesosInformacion.length > 0 && (
                                <NavDropdown title="Más" id="menu-secundario" align="end">
                                    {accesosInformacion.map((enlace) => (
                                        <NavDropdown.Item key={enlace.texto} as={Link} to={enlace.ruta}>
                                            {enlace.texto}
                                        </NavDropdown.Item>
                                    ))}
                                </NavDropdown>
                            )}
                            {autenticado && (
                                <div className="d-flex align-items-lg-center gap-2 mt-2 mt-lg-0 ms-lg-2 flex-wrap">
                                    <span className="small" aria-label="Sesión iniciada">
                                        Hola, <strong>{usuario?.nombre}</strong> <Badge bg="secondary">{usuario?.rol}</Badge>
                                    </span>
                                    <Button size="sm" variant="outline-danger" onClick={salir}>Cerrar sesión</Button>
                                </div>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default NavbarPrincipal;
