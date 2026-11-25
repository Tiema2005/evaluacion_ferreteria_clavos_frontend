import { Alert, Container } from "react-bootstrap";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RutaProtegida({ rolesPermitidos }) {
  const { autenticado, usuario } = useAuth();
  const location = useLocation();

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
