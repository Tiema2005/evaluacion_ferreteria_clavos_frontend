import { useEffect, useState } from "react";
import CampoInput from "../atoms/CampoInput";
import Boton from "../atoms/Boton";
import { guardarBorrador, leerBorrador } from "../../utils/borradoresFormularios";

const CLAVE_BORRADOR_REGISTRO = "ferreteria_borrador_registro";
import { validarDatosRegistro } from "../../utils/validacionesRegistro";

function FormularioRegistro({ onEnviar, cargando = false }) {
    const [datos, setDatos] = useState(() => ({
        nombre: "",
        apellidos: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        ...leerBorrador(CLAVE_BORRADOR_REGISTRO)
    }));

    const [errores, setErrores] = useState({});

    useEffect(() => {
        guardarBorrador(CLAVE_BORRADOR_REGISTRO, {
            nombre: datos.nombre, apellidos: datos.apellidos, correo: datos.correo
        });
    }, [datos.nombre, datos.apellidos, datos.correo]);

    function cambiarCampo(evento) {
        const { name, value } = evento.target;

        setDatos((anteriores) => ({
            ...anteriores,
            [name]: value
        }));
    }

    function enviarFormulario(evento) {
        evento.preventDefault();

        const nuevosErrores = validarDatosRegistro(datos);

        setErrores(nuevosErrores);

        if (datos.contrasena.length < 8) {
            setErrores({ ...nuevosErrores, contrasena: "La contraseña debe tener al menos 8 caracteres." });
            return;
        }

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        onEnviar({
            nombre: datos.nombre.trim(),
            apellidos: datos.apellidos.trim(),
            correo: datos.correo.trim(),
            contrasena: datos.contrasena
        });
    }

    return (
        <form onSubmit={enviarFormulario} noValidate>
            <CampoInput
                id="nombreRegistro"
                name="nombre"
                label="Nombre"
                placeholder="Ingrese su nombre"
                value={datos.nombre}
                onChange={cambiarCampo}
                errorTexto={errores.nombre}
            />

            <CampoInput
                id="apellidosRegistro"
                name="apellidos"
                label="Apellidos"
                placeholder="Ingrese sus apellidos"
                value={datos.apellidos}
                onChange={cambiarCampo}
                errorTexto={errores.apellidos}
            />

            <CampoInput
                id="correoRegistro"
                name="correo"
                label="Correo electrónico"
                tipo="email"
                placeholder="ejemplo@correo.cl"
                value={datos.correo}
                onChange={cambiarCampo}
                errorTexto={errores.correo}
            />

            <CampoInput
                id="contrasenaRegistro"
                name="contrasena"
                label="Contraseña"
                tipo="password"
                placeholder="Mínimo 8 caracteres"
                value={datos.contrasena}
                onChange={cambiarCampo}
                errorTexto={errores.contrasena}
            />

            <CampoInput
                id="confirmarContrasenaRegistro"
                name="confirmarContrasena"
                label="Confirmar contraseña"
                tipo="password"
                placeholder="Repita su contraseña"
                value={datos.confirmarContrasena}
                onChange={cambiarCampo}
                errorTexto={errores.confirmarContrasena}
            />

            <Boton
                texto={cargando ? "Registrando..." : "Registrarse"}
                deshabilitado={cargando}
                variante="primary"
                tipo="submit"
            />
        </form>
    );
}

export default FormularioRegistro;