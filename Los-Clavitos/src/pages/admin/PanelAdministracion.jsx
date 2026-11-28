import EncabezadoPagina from "../../components/molecules/EncabezadoPagina";
import { useEffect, useState } from "react";
import { listarPedidosApi } from "../../services/pedidoApi";

import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { useProductos } from "../../context/ProductosContext";

import Boton from "../../components/atoms/Boton";
import { useTituloPagina } from "../../hooks/useTituloPagina";

function PanelAdministracion() {
    const navigate = useNavigate();
    const { productos, categorias } = useProductos();
    const [cantidadPedidos, setCantidadPedidos] = useState(null);
    useEffect(() => {
        let activo = true;
        listarPedidosApi().then(p => { if (activo) setCantidadPedidos(p.length); })
          .catch(() => { if (activo) setCantidadPedidos(null); });
        return () => { activo = false; };
    }, []);

    useTituloPagina("Panel de administración");


    const productosCriticos = productos.filter(
        (producto) =>
            producto.stock <= 0 ||
            producto.stock < producto.stockMinimo
    );

    return (
        <Container className="py-4">
            <EncabezadoPagina
                titulo="Panel de administración"
                descripcion="Resumen general de los productos, pedidos e inventario de Ferretería Los Maestros."
            />

            <Row className="g-4 mt-2">
                <Col xs={12} md={6} lg={4}>
                    <div className="card h-100">
                        <div className="card-body">
                            <h2 className="h5">
                                Productos registrados
                            </h2>

                            <p className="display-6">
                                {productos.length}
                            </p>

                            <p>
                                Total de productos en el catálogo.
                            </p>
                        </div>
                    </div>
                </Col>

                <Col xs={12} md={6} lg={4}>
                    <div className="card h-100">
                        <div className="card-body">
                            <h2 className="h5">
                                Pedidos registrados
                            </h2>

                            <p className="display-6">
                                {cantidadPedidos ?? "No disponible"}
                            </p>

                            <p>
                                Solicitudes registradas
                                por los clientes.
                            </p>
                        </div>
                    </div>
                </Col>

                <Col xs={12} md={6} lg={4}>
                    <div className="card h-100 d-flex">
                        <div className="card-body d-flex flex-column">
                            <h2 className="h5">
                                Productos con stock crítico
                            </h2>

                            <p className="display-6">
                                {productosCriticos.length}
                            </p>

                            <p>
                                Productos agotados o bajo
                                el stock mínimo.
                            </p>

                            <div className="mt-auto">
                                <Boton
                                    texto="Ver stock crítico"
                                    variante="outline-primary"
                                    onClick={() =>
                                        navigate("/admin/stock-critico")
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <h2 className="h4 mt-5 mb-3">
                Gestión administrativa
            </h2>

            <Row className="g-4">
                <Col xs={12} md={6}>
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <h3 className="h5">
                                Inventario
                            </h3>

                            <p>
                                Consulta, crea, edita y elimina
                                productos del catálogo.
                            </p>

                            <div className="mt-auto">
                                <Boton
                                    texto="Gestionar productos"
                                    variante="primary"
                                    onClick={() =>
                                        navigate("/administracion")
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={12} md={6}>
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <h3 className="h5">
                                Pedidos
                            </h3>

                            <p>
                                Revisa las solicitudes registradas
                                y sus comprobantes.
                            </p>

                            <div className="mt-auto">
                                <Boton
                                    texto="Ver pedidos"
                                    variante="primary"
                                    onClick={() =>
                                        navigate("/admin/pedidos")
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={12} md={6}>
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <h3 className="h5">
                                Categorías
                            </h3>

                            <p>
                                Categorías registradas:{" "}
                                <strong>{categorias.length}</strong>.
                                Las categorías provienen de PostgreSQL;
                                su administración requiere endpoints adicionales.
                            </p>

                            <div className="mt-auto">
                                <Boton
                                    texto="Gestionar categorías"
                                    variante="primary"
                                    onClick={() =>
                                        navigate("/admin/categorias")
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={12} md={6}>
                    <div className="card h-100"><div className="card-body d-flex flex-column">
                        <h3 className="h5">Usuarios</h3>
                        <p>Gestiona usuarios reales, permisos y desactivaciones en PostgreSQL.</p>
                        <div className="mt-auto"><Boton texto="Gestionar usuarios" onClick={() => navigate("/admin/usuarios")} /></div>
                    </div></div>
                </Col>

                <Col xs={12} md={6}>
                    <div className="card h-100"><div className="card-body d-flex flex-column">
                        <h3 className="h5">Reportes y perfil</h3>
                        <p>Consulta pedidos, montos solicitados y la información del panel.</p>
                        <div className="mt-auto"><Boton texto="Ver reportes" onClick={() => navigate("/admin/reportes")} /></div>
                    </div></div>
                </Col>
            </Row>
        </Container>
    );
}

export default PanelAdministracion;
