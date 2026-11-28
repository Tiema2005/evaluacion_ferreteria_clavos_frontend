import { useEffect, useState } from "react";
import CampoInput from "../atoms/CampoInput";
import Boton from "../atoms/Boton";
import { guardarBorrador, leerBorrador } from "../../utils/borradoresFormularios";

const CLAVE_BORRADOR_LOGIN = "ferreteria_borrador_login";
import { validarCorreo, validarContrasena } from "../../utils/validaciones";

function FormularioLogin({ onEnviar, cargando = false }) {
  const [correo, setCorreo] = useState(() => leerBorrador(CLAVE_BORRADOR_LOGIN).correo || "");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({});

  useEffect(() => {
    guardarBorrador(CLAVE_BORRADOR_LOGIN, { correo });
  }, [correo]);

  function enviarFormulario(evento) {
    evento.preventDefault();
    const nuevosErrores = {
      correo: validarCorreo(correo),
      contrasena: validarContrasena(contrasena),
    };
    setErrores(nuevosErrores);
    if (nuevosErrores.correo || nuevosErrores.contrasena) return;

    // El backend espera "correo" y "password": la página convierte los nombres.
    onEnviar({ correo: correo.trim(), contrasena });
  }

  return (
    <form onSubmit={enviarFormulario} noValidate>
      <CampoInput
        id="correoLogin"
        label="Correo electrónico"
        tipo="email"
        name="correo"
        placeholder="ejemplo@correo.cl"
        value={correo}
        onChange={(evento) => setCorreo(evento.target.value)}
        errorTexto={errores.correo}
      />

      <CampoInput
        id="contrasenaLogin"
        label="Contraseña"
        tipo="password"
        name="contrasena"
        placeholder="Ingrese su contraseña"
        value={contrasena}
        onChange={(evento) => setContrasena(evento.target.value)}
        errorTexto={errores.contrasena}
      />

      <Boton
        texto={cargando ? "Verificando..." : "Continuar"}
        variante="primary"
        tipo="submit"
        deshabilitado={cargando}
      />
    </form>
  );
}

export default FormularioLogin;
