import { describe, expect, it } from "vitest";
import { adaptarCuenta } from "./cuentaCorrienteApi";

describe("adaptación de cuenta corriente", () => {
  it("representa correctamente un contratista sin cuenta", () => {
    expect(adaptarCuenta({ existe: false, estado: "SIN_CUENTA", saldo: 0 })).toMatchObject({
      existe: false, activa: false, estado: "SIN_CUENTA", saldo: 0, movimientos: [],
    });
  });
  it("adapta cargos, abonos y saldos enviados por PostgreSQL", () => {
    const cuenta = adaptarCuenta({ existe: true, activa: true, estado: "ACTIVA", saldo: 3500.5,
      movimientos: [{ id: 3, idPedido: 5, monto: 5990, tipo: "CARGO", fecha: "2026-11-27", descripcion: "Compra" }] });
    expect(cuenta.saldo).toBe(3500.5);
    expect(cuenta.movimientos[0]).toMatchObject({ id: 3, idPedido: 5, monto: 5990, tipo: "CARGO" });
  });
});
