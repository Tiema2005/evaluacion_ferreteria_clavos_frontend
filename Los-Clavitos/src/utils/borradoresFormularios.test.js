import { beforeEach, describe, expect, it } from "vitest";
import { borrarBorrador, guardarBorrador, leerBorrador } from "./borradoresFormularios";

describe("Borradores de formularios", () => {
  beforeEach(() => sessionStorage.clear());

  it("recupera nombre y correo tras volver a montar la pantalla", () => {
    guardarBorrador("prueba", { nombre: "Ana", apellidos: "Prueba", correo: "ana@ejemplo.cl" });
    expect(leerBorrador("prueba")).toEqual({
      nombre: "Ana", apellidos: "Prueba", correo: "ana@ejemplo.cl"
    });
  });

  it("jamás persiste las contraseñas ni tokens", () => {
    guardarBorrador("prueba", {
      correo: "ana@ejemplo.cl", contrasena: "secreto", confirmarContrasena: "secreto",
      password: "secreto", token: "jwt-falso"
    });
    expect(sessionStorage.getItem("prueba")).toBe('{"correo":"ana@ejemplo.cl"}');
    expect(leerBorrador("prueba")).toEqual({ correo: "ana@ejemplo.cl" });
  });

  it("elimina el borrador después de confirmar la operación", () => {
    guardarBorrador("prueba", { correo: "ana@ejemplo.cl" });
    borrarBorrador("prueba");
    expect(leerBorrador("prueba")).toEqual({});
  });
});
