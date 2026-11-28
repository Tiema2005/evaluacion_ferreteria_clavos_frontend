# Ferretería Los Maestros — Frontend React · Evaluación Parcial 3

**Asignatura:** DSY1104 · Desarrollo Fullstack II · 2026
**Caso:** Ferretería Los Maestros
**Repositorio:** [Frontend](https://github.com/Tiema2005/evaluacion_ferreteria_clavos_frontend) · [Backend](https://github.com/Tiema2005/evaluacion_ferreteria_clavos_backend)
**Estado de fuente:** rama `feature/integracion-catalogo-pedidos`, ZIP revisado el 27/11/2026.

## Qué hace la versión EP3

Frontend React/Vite con rutas y protección por rol, integrado con **API Spring Boot y PostgreSQL RDS**. A diferencia de la evaluación anterior, el catálogo y los pedidos ya **no son exclusivamente simulados**: Axios consulta y actualiza el backend. El carrito mantiene estado local en el navegador, pero el servidor crea los pedidos y descuenta stock en la base relacional.

| Rol | Flujo principal |
| --- | --- |
| CLIENTE | Registro, login, catálogo, carrito, compra e historial personal |
| CONTRATISTA | Compra, historial y consulta de cuenta corriente (última pendiente de prueba integral) |
| VENDEDOR | Inventario (ajustes de stock) y gestión de estados de pedidos |
| ADMINISTRADOR | CRUD usuarios, catálogo, inventario, pedidos y panel de cuenta corriente adicional |

## Rutas principales

| Dirección | Acceso |
| --- | --- |
| `/login`, `/registro` | Público |
| `/catalogo`, `/producto/:codigo` | Público |
| `/carrito` | Público |
| `/confirmar-pedido` | CLIENTE / CONTRATISTA |
| `/historial`, `/pedido/:numero` | Autenticado; filtrado por servidor |
| `/inventario`, `/pedidos` | VENDEDOR / ADMINISTRADOR |
| `/admin/usuarios`, `/administracion`, `/admin/pedidos` | ADMINISTRADOR |
| `/mi-cuenta` | CONTRATISTA; ampliación en pruebas |
| `/admin/cuentas-corrientes` | ADMINISTRADOR; ampliación en pruebas |

## Cómo funciona la sesión

- `src/services/authService.js` usa `sessionStorage` con clave **`ferreteria_sesion`**, guardando `token`, `usuario` y `expiraEn`.
- El JWT dura **3600 segundos (una hora)**; recarga de la misma pestaña conserva sesión si no expiró.
- `src/context/AuthContext.jsx` llama a **GET `/api/v1/auth/me`** al iniciar/recuperar foco para revalidar estado activo y rol en PostgreSQL.
- `src/services/api.js` añade `Authorization: Bearer ...` con Axios. La respuesta 401 de una petición autenticada elimina la sesión local.
- `src/components/guards/RutaProtegida.jsx` protege pantallas; el backend vuelve a verificar permisos. Las contraseñas no se guardan como borrador.

**Justificación:** `sessionStorage` preserva la sesión ante recarga en la misma pestaña, pero el token puede ser leído por JavaScript si existe XSS; HTTPS y controles adicionales serían necesarios para un sitio productivo real.

## Desarrollo local

```powershell
cd Los-Clavitos
npm ci
$env:VITE_API_URL='/api/v1'
npm run dev -- --host localhost --port 5173
```

`Los-Clavitos/vite.config.js` redirige `/api` hacia `http://127.0.0.1:8081` por defecto. Para trabajar contra RDS de pruebas, mantener activo el túnel SSH **y** el servicio backend aislado. No usar la base principal para pruebas de compras.

```powershell
npm run build
npm run test:run
npm run lint
```

El equipo reportó compilación Vite y **46 pruebas Vitest aprobadas** después de integrar cuenta corriente; `npm run lint` debe ejecutarse y revisarse antes de entregar.

## Arquitectura y datos

React Router → AuthContext / ProductosProvider → servicios Axios → `/api/v1/...` → Spring Boot → PostgreSQL RDS. Se utilizan Bootstrap/React Bootstrap, servicios de aplicación y componentes organizados por Atomic Design.

La importación a `ferreteria_catalogo_test` dejó **87 productos**, de los cuales **86 activos**, incluyendo 85 referencias del catálogo académico y un producto ficticio activo. Los pedidos #4 y #5 se comprobaron con descuento real de stock y comprobante desde React.

## Entregables

- [Manual de usuario EP3](docs/Manual_Usuario_EP3.docx)
- [Backend y documento de integración](https://github.com/Tiema2005/evaluacion_ferreteria_clavos_backend)

## Estado / no confundir

- **Probado:** sesiones, roles, productos, pedidos, control 409, acceso 403, stock, historial y gestión de estados.
- **Compilado, pendiente de prueba integrada:** saldo, cargos y abonos de cuenta corriente.
- **Pendiente:** integración definitiva de ramas a `main`, despliegue de la versión final y verificación pública de Swagger y React.
- Funciones como mapa interactivo y reportes avanzados **no son obligatorias en la EP3** según la pauta de evaluación compartida; se reservan para el examen transversal.

No incluir `.env`, contraseñas, JWT, secretos, archivos `.pem`, `node_modules`, `dist` ni `target` en la entrega.
