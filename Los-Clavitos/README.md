# Ferretería Los Maestros — Aplicación React

Esta carpeta contiene la aplicación React/Vite de la **Evaluación Parcial 3**. No es el proyecto Vite de plantilla.

```bash
npm ci
npm run dev
npm run build
npm run test:run
npm run lint
```

La API se configura con `VITE_API_URL` (por defecto `/api/v1`). El proxy de desarrollo en `vite.config.js` envía `/api` a `http://127.0.0.1:8081`, hacia el servidor aislado mediante túnel SSH.

- Login JWT y persistencia por pestaña: `src/services/authService.js`, `src/context/AuthContext.jsx`.
- Seguridad de rutas: `src/components/guards/RutaProtegida.jsx`.
- HTTP centralizado: `src/services/api.js`.
- Catálogo y stock: `src/services/productoApi.js`, `src/context/ProductosProvider.jsx`.
- Pedidos reales: `src/services/pedidoApi.js`.
- Cuenta corriente adicional: `src/services/cuentaCorrienteApi.js` (aún pendiente de prueba de cargo/abono).

Consulta el [README principal del repositorio](../README.md) y el [Manual de usuario](../docs/Manual_Usuario_EP3.docx).
