import { Outlet } from "react-router-dom";
import Navbar from "../organisms/Navbar";
import Footer from "../organisms/Footer";
import { useAuth } from "../../context/AuthContext";

function PlantillaPublica() {
    const { autenticado, esAdmin } = useAuth();

    const enlaces = [
        { texto: "Inicio", ruta: "/" },
        { texto: "Catálogo", ruta: "/catalogo" },
        { texto: "Categorías", ruta: "/categorias" },
        { texto: "Ofertas", ruta: "/ofertas" },
        { texto: "Carrito", ruta: "/carrito" },
        ...(autenticado ? [{ texto: "Mis compras", ruta: "/historial" }] : []),
        ...(esAdmin ? [{ texto: "Administración", ruta: "/admin" }] : []),
        { texto: "Nosotros", ruta: "/nosotros" },
        { texto: "Blog", ruta: "/blog" },
        { texto: "Contacto", ruta: "/contacto" },
        ...(!autenticado ? [
          { texto: "Registrarse", ruta: "/registro" },
          { texto: "Iniciar Sesión", ruta: "/login" }
        ] : [])
    ];

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar nombre="Ferretería Los Maestros" enlaces={enlaces} />
            <main className="flex-grow-1 app-main">
                <Outlet />
            </main>
            <Footer
                nombre="Ferretería Los Maestros"
                descripcion="Materiales y herramientas para tus proyectos"
            />
        </div>
    );
}

export default PlantillaPublica;
