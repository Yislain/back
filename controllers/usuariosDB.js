import User from "../models/usuarioModelo.js";
import { encriptarPassword, validarPassword } from "../middlewares/funcionesPassword.js";
import { mensajes } from "../libs/mensajes.js";
import { crearCookie } from "../libs/jwt.js";
import mongoose from "mongoose";

export const register = async (username, email, password) => {
    try {
        const usuarioDuplicado = await User.findOne({ username });
        const emailDuplicado = await User.findOne({ email });
        
        if (usuarioDuplicado || emailDuplicado) {
            return mensajes(400, "El usuario ya existe");
        }
        
        const { salt, hash } = await encriptarPassword(password);
        const dataUser = new User({ username, email, password: hash, salt });
        const respuestaMongo = await dataUser.save();
        const token = await crearCookie({ id: respuestaMongo._id });
        
        return mensajes(200, "Usuario registrado correctamente", { token });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return mensajes(500, "Error al registrar al usuario");
    }
};

export const login = async (username, password) => {
    try {
        const usuario = await User.findOne({ username });
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }
        
        const passwordValido = validarPassword(password, usuario.salt, usuario.password);
        if (!passwordValido) {
            return mensajes(401, "Contraseña incorrecta");
        }
        
        const token = await crearCookie({ id: usuario._id });
        return mensajes(200, "Inicio de sesión exitoso", { token });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return mensajes(500, "Error al iniciar sesión");
    }
};

export const mostrarUsuarios = async () => {
    try {
        console.log("Iniciando búsqueda de usuarios");
        const usuarios = await User.find().select('-password -salt');
        console.log("Usuarios encontrados en DB:", usuarios);
        
        return mensajes(200, "Usuarios obtenidos correctamente", { usuarios });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return mensajes(500, "Error al obtener usuarios");
    }
};

export const buscarUsuarioPorId = async (id) => {
    try {
        console.log("🔍 Buscando usuario con ID:", id);
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("ID inválido:", id);
            return mensajes(400, "ID de usuario inválido");
        }
        
        const usuario = await User.findById(id).select('-password -salt');
        console.log("Usuario encontrado:", usuario);
        
        if (!usuario) {
            console.log("No se encontró usuario con ID:", id);
            return mensajes(404, "Usuario no encontrado");
        }
        
        return mensajes(200, "Usuario encontrado", { usuario });
    } catch (error) {
        console.error("Error al buscar usuario por id:", error);
        return mensajes(500, "Error al buscar usuario");
    }
};

export const borrarUsuarioPorId = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return mensajes(400, "ID de usuario inválido");
        }
        
        const usuarioBorrado = await User.findByIdAndDelete(id);
        if (!usuarioBorrado) {
            return mensajes(404, "Usuario no encontrado");
        }
        
        return mensajes(200, "Usuario borrado correctamente", { usuarioBorrado });
    } catch (error) {
        console.error("Error al borrar usuario:", error);
        return mensajes(500, "Error al borrar usuario");
    }
};

export const actualizarUsuarioPorId = async (id, updatedData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return mensajes(400, "ID de usuario inválido");
        }
        
        const { password, salt, ...datosActualizar } = updatedData;
        
        const usuarioActualizado = await User.findByIdAndUpdate(
            id,
            datosActualizar,
            { new: true }
        ).select('-password -salt');
        
        if (!usuarioActualizado) {
            return mensajes(404, "Usuario no encontrado");
        }
        
        return mensajes(200, "Usuario actualizado correctamente", { usuario: usuarioActualizado });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return mensajes(500, "Error al actualizar usuario");
    }
};
