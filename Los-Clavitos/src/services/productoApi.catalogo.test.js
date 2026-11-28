import { describe, expect, it } from "vitest";
import { adaptarProducto } from "./productoApi";

const fuente = {
  id: 10, idCategoria: 2, categoria: "Mat. Construcción", codigo: "MC001",
  nombre: "Cemento de PostgreSQL", descripcion: "Dato del servidor", precio: 7200,
  stockActual: 13, stockMinimo: 3, activo: true,
};

describe("productoApi: datos reales y metadatos de catálogo", () => {
  it("conserva siempre precio, stock y nombre desde la API", () => {
    const p = adaptarProducto(fuente);
    expect(p.precioVenta).toBe(7200);
    expect(p.stock).toBe(13);
    expect(p.nombre).toBe("Cemento de PostgreSQL");
  });
  it("recupera marca, subcategoría e imagen del catálogo académico", () => {
    const p = adaptarProducto(fuente);
    expect(p.marca).toBe("Polpaico");
    expect(p.subcategoria).toBe("Cementos");
    expect(p.imagen).toBe("/productos/MC001.svg");
  });
  it("permite productos nuevos que no están en la muestra original", () => {
    const p = adaptarProducto({ ...fuente, codigo: "TEST-001" });
    expect(p.marca).toBe("");
    expect(p.imagen).toBe("");
    expect(p.unidad).toBe("Unidad");
  });
});
