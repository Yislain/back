import User from "../models/usuarioModelo.js";
import { mensajes } from "../libs/manejoErrores.js";
import { crearToken } from "../libs/jwt.js";
import { encriptarPassword, validarPassword } from "../middlewares/funcionesPassword.js";

export async function register({ username, email, password, tipoUsuario }) {
    try {
        const usuarioExistente = await User.findOne({ username });
        const emailExistente = await User.findOne({ email });

        if (usuarioExistente || emailExistente) {
            return mensajes(400, "Usuario duplicado");
        }

        const { hash, salt } = encriptarPassword(password);
        const data = new User({ username, email, password: hash, salt, tipoUsuario });

        const respuesta = await data.save();

        const token = await crearToken({
            id: respuesta._id,
            username: respuesta.username,
            email: respuesta.email,
            tipoUsuario: respuesta.tipoUsuario
        });

        return { estado: true, mensaje: "Registro exitoso", tipoUsuario: respuesta.tipoUsuario, token };
    } catch (error) {
        return mensajes(400, "Error al registrar al usuario", error);
    }
}

export const login = async ({ username, password }) => {
    try {
        console.log("📢 Buscando usuario en la base de datos:", username);

        const usuarioCorrecto = await User.findOne({ username });

        if (!usuarioCorrecto) {
            console.error("❌ Usuario no encontrado.");
            return mensajes(400, "Datos incorrectos, usuario");
        }

        console.log("✅ Usuario encontrado:", usuarioCorrecto);

        const passwordCorrecto = validarPassword(password, usuarioCorrecto.salt, usuarioCorrecto.password);
        if (!passwordCorrecto) {
            console.error("❌ Contraseña incorrecta.");
            return mensajes(400, "Datos incorrectos, contraseña");
        }

        console.log("🔹 Generando token para:", usuarioCorrecto.username);
        const token = await crearToken({
            id: usuarioCorrecto._id,
            username: usuarioCorrecto.username,
            email: usuarioCorrecto.email,
            tipoUsuario: usuarioCorrecto.tipoUsuario
        });

        console.log("✅ Login exitoso. Tipo de usuario:", usuarioCorrecto.tipoUsuario);

        return {
            estado: true,
            mensaje: "Login exitoso",
            tipoUsuario: usuarioCorrecto.tipoUsuario,
            token
        };
    } catch (error) {
        console.error("❌ Error en login:", error);
        return mensajes(400, "Error en login", error);
    }
};

export const buscaUsuarioPorID = async (id) => {
    return await User.findById(id);
};
