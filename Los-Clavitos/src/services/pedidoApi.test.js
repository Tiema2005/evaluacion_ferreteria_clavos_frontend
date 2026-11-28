import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./api", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));
import { api } from "./api";
import {
  prepararSolicitud, adaptarPedido, crearPedidoApi,
  listarPedidosApi, obtenerPedidoApi, cambiarEstadoPedidoApi,
} from "./pedidoApi";

const dto = { id_pedido: 12, fecha_pedido: "2026-11-27T00:00:00", estado: "PENDIENTE",
  tipo_entrega: "RETIRO", metodo_pago: "EFECTIVO", nombre: "Cliente", apellido: "Demo",
  correo: "prueba@example.com", total: 19980,
  productos: [{ codigo: "TEST-001", nombre: "Martillo", cantidad: 2, precio_unitario: 9990, subtotal: 19980 }] };

describe("pedidoApi (integración REST)", () => {
  beforeEach(() => vi.resetAllMocks());
  it("transforma el carrito al JSON que exige Spring Boot", () => {
    expect(prepararSolicitud([{ id: 4, cantidad: 2 }], { tipoEntrega: "RETIRO", metodoPago: "EFECTIVO" }))
      .toEqual({ tipoEntrega: "RETIRO", metodoPago: "EFECTIVO", direccion: "", productos: [{ idProducto: 4, cantidad: 2 }] });
  });
  it("rechaza carritos inválidos antes de llamar a la API", () => {
    expect(() => prepararSolicitud([], { tipoEntrega: "RETIRO", metodoPago: "EFECTIVO" })).toThrow();
    expect(() => prepararSolicitud([{ id: 1, cantidad: 0 }], { tipoEntrega: "RETIRO", metodoPago: "EFECTIVO" })).toThrow();
    expect(() => prepararSolicitud([{ id: 1, cantidad: 1 }, { id: 1, cantidad: 2 }], { tipoEntrega: "RETIRO", metodoPago: "EFECTIVO" })).toThrow();
    expect(() => prepararSolicitud([{ id: 2, cantidad: 1 }], { tipoEntrega: "DESPACHO", metodoPago: "EFECTIVO", direccion: "" })).toThrow();
  });
  it("crea pedido vía POST sin guardar pedidos locales", async () => {
    api.post.mockResolvedValue({ data: dto });
    const resultado = await crearPedidoApi([{ id: 4, cantidad: 2 }], { tipoEntrega: "RETIRO", metodoPago: "EFECTIVO" });
    expect(api.post).toHaveBeenCalledWith("/pedidos", { tipoEntrega: "RETIRO", metodoPago: "EFECTIVO", direccion: "", productos: [{ idProducto: 4, cantidad: 2 }] });
    expect(resultado.numero).toBe("12");
    expect(resultado.productos[0].subtotal).toBe(19980);
  });
  it("lista únicamente los pedidos que retorna el backend", async () => {
    api.get.mockResolvedValue({ data: [dto] });
    expect((await listarPedidosApi())[0].total).toBe(19980);
    expect(api.get).toHaveBeenCalledWith("/pedidos");
  });
  it("consulta un comprobante por número", async () => {
    api.get.mockResolvedValue({ data: dto });
    expect((await obtenerPedidoApi(12)).id).toBe(12);
    expect(api.get).toHaveBeenCalledWith("/pedidos/12");
  });
  it("actualiza estado a través del endpoint protegido", async () => {
    api.put.mockResolvedValue({ data: { ...dto, estado: "CONFIRMADO" } });
    expect((await cambiarEstadoPedidoApi(12, "CONFIRMADO")).estado).toBe("CONFIRMADO");
    expect(api.put).toHaveBeenCalledWith("/pedidos/12/estado", { estado: "CONFIRMADO" });
  });
  it("adapta los campos snake_case sin confundir el rol del cliente", () => {
    const p = adaptarPedido(dto);
    expect(p.cliente.apellido).toBe("Demo");
    expect(p.tipoEntrega).toBe("RETIRO");
    expect(p.productos).toHaveLength(1);
  });
});
