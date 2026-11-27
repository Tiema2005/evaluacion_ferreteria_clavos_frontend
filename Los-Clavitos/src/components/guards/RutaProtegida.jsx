import { Alert, Button, Container, Spinner } from "react-bootstrap";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RutaProtegida({ rolesPermitidos }) {
  const { autenticado, usuario, comprobandoSesion, errorSesion, revalidarSesion } = useAuth();
  const location = useLocation();

  if (comprobandoSesion) {
    return (
      <Container className="py-5 text-center" role="status">
        <Spinner animation="border" size="sm" className="me-2" />
        Verificando tu sesión con el servidor...
      </Container>
    );
  }

  if (errorSesion) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          No pudimos verificar la sesión con el servidor. Revisa tu conexión e inténtalo nuevamente.
          <div className="mt-3">
            <Button variant="primary" onClick={() => { void revalidarSesion(); }}>Reintentar</Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h1 className="h5">Acceso denegado</h1>
          Esta cuenta no tiene el rol necesario para entrar a esta sección.
          <div className="mt-3"><Link to="/catalogo">Volver al catálogo</Link></div>
        </Alert>
      </Container>
    );
  }

  return <Outlet />;
}
