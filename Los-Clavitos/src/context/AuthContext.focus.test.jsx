import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../services/api";

vi.mock("../services/api", () => ({ api: { get: vi.fn() } }));

function FormularioProtegido() {
  const { autenticado, comprobandoSesion } = useAuth();
  if (comprobandoSesion) return <p>Verificando</p>;
  if (!autenticado) return <p>Acceso restringido</p>;
  return <input aria-label="Nombre pendiente" defaultValue="" />;
}

describe("Revalidación de sesión al volver a la pestaña", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem("ferreteria_sesion", JSON.stringify({
      token: "jwt-prueba", usuario: { id: 1, rol: "ADMINISTRADOR" },
      expiraEn: Date.now() + 3_600_000
    }));
    vi.mocked(api.get).mockReset();
    vi.mocked(api.get).mockResolvedValue({ data: { id: 1, rol: "ADMINISTRADOR" } });
  });

  afterEach(() => vi.restoreAllMocks());

  it("no desmonta un formulario mientras valida el mismo JWT en segundo plano", async () => {
    render(<AuthProvider><FormularioProtegido /></AuthProvider>);
    const input = await screen.findByRole("textbox", { name: "Nombre pendiente" });
    fireEvent.change(input, { target: { value: "Trabajo sin guardar" } });

    let completar;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise((resolve) => { completar = resolve; }));
    act(() => { window.dispatchEvent(new Event("focus")); });

    expect(screen.getByRole("textbox", { name: "Nombre pendiente" })).toBe(input);
    expect(input).toHaveValue("Trabajo sin guardar");

    await act(async () => { completar({ data: { id: 1, rol: "ADMINISTRADOR" } }); });
    await waitFor(() => expect(input).toHaveValue("Trabajo sin guardar"));
  });
});
