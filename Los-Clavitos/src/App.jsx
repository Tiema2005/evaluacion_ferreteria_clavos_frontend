import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RutaProtegida from "./components/guards/RutaProtegida";

import PlantillaPublica from "./components/templates/PlantillaPublica";

import Inicio from "./pages/Inicio";
import Catalogo from "./pages/catalogo/Catalogo";
import Categorias from "./pages/catalogo/Categorias";
import DetalleProducto from "./pages/catalogo/DetalleProducto";
import Carrito from "./pages/pedidos/Carrito";
import ConfirmarPedido from "./pages/pedidos/ConfirmarPedido";
import ResultadoPedido from "./pages/pedidos/ResultadoPedido";

import Login from "./pages/auth/Login";
import Registro from "./pages/auth/Registro";

import Nosotros from "./pages/Nosotros";
import Ofertas from "./pages/catalogo/Ofertas";
import Blog from "./pages/blog/Blog";
import DetalleArticulo from "./pages/blog/DetalleArticulo";
import Contacto from "./pages/Contacto";

import Administracion from "./pages/admin/Administracion";
import PanelAdministracion from "./pages/admin/PanelAdministracion";
import PedidosAdmin from "./pages/admin/PedidosAdmin";
import StockCritico from "./pages/admin/StockCritico";
import CategoriasAdmin from "./pages/admin/CategoriasAdmin";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import HistorialPedidos from "./pages/pedidos/HistorialPedidos";
import ReportesAdmin from "./pages/admin/ReportesAdmin";
import MiCuentaCorriente from "./pages/cuenta/MiCuentaCorriente";
import CuentasCorrientesAdmin from "./pages/admin/CuentasCorrientesAdmin";

function EntradaPublica({ children }) {
    const { autenticado, esAdmin } = useAuth();
    if (autenticado) return <Navigate to={esAdmin ? "/admin/usuarios" : "/catalogo"} replace />;
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
            <Routes>
                <Route element={<PlantillaPublica />}>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route
                        path="/producto/:codigo"
                        element={<DetalleProducto />}
                    />

                    <Route path="/carrito" element={<Carrito />} />
                    <Route element={<RutaProtegida rolesPermitidos={["CLIENTE", "CONTRATISTA"]} />}>
                        <Route path="/confirmar-pedido" element={<ConfirmarPedido />} />
                    </Route>
                    <Route element={<RutaProtegida />}>
                        <Route path="/pedido/:numero" element={<ResultadoPedido />} />
                    </Route>

                    <Route path="/login" element={<EntradaPublica><Login /></EntradaPublica>} />
                    <Route path="/registro" element={<EntradaPublica><Registro /></EntradaPublica>} />
                    <Route element={<RutaProtegida />}><Route path="/historial" element={<HistorialPedidos />} /></Route>

                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/ofertas" element={<Ofertas />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route
                        path="/blog/:id"
                        element={<DetalleArticulo />}
                    />
                    <Route path="/contacto" element={<Contacto />} />

                    <Route element={<RutaProtegida rolesPermitidos={["CONTRATISTA"]} />}>
                        <Route path="/mi-cuenta" element={<MiCuentaCorriente />} />
                    </Route>
                    <Route element={<RutaProtegida rolesPermitidos={["ADMINISTRADOR", "VENDEDOR"]} />}>
                        <Route path="/inventario" element={<Administracion />} />
                        <Route path="/pedidos" element={<PedidosAdmin />} />
                    </Route>
                    <Route element={<RutaProtegida rolesPermitidos={["ADMINISTRADOR"]} />}>
                        <Route path="/admin" element={<PanelAdministracion />} />
                        <Route path="/admin/pedidos" element={<PedidosAdmin />} />
                        <Route path="/admin/stock-critico" element={<StockCritico />} />
                        <Route path="/admin/categorias" element={<CategoriasAdmin />} />
                        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
                        <Route path="/admin/reportes" element={<ReportesAdmin />} />
                        <Route path="/admin/cuentas-corrientes" element={<CuentasCorrientesAdmin />} />
                        <Route path="/administracion" element={<Administracion />} />
                    </Route>
                </Route>
            </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
