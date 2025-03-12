import { Router } from "express";
import User from "../models/usuarioModelo.js";
import { usuarioAutorizado } from "../middlewares/funcionesPassword.js";
import { encriptarPassword } from "../middlewares/funcionesPassword.js";

const router = Router();

// Obtener todos los usuarios
router.get("/usuarios", async (req, res) => {
    try {
        console.log("🔍 Verificando autorización...");
        const respuesta = usuarioAutorizado(req.cookies.token, req);
        console.log("✅ Respuesta de autorización:", respuesta);

        if (respuesta.status !== 200) {
            return res.status(400).json({ mensaje: "No autorizado" });
        }

        console.log("📦 Obteniendo usuarios de la base de datos...");
        const usuarios = await User.find({}, "username email tipoUsuario");
        console.log("✅ Usuarios obtenidos:", usuarios);

        return res.status(200).json(usuarios);
    } catch (error) {
        console.error("❌ Error en la ruta /usuarios:", error);
        return res.status(500).json({ mensaje: "Error al obtener usuarios", error: error.message });
    }
});

// Eliminar usuario
router.delete("/borrar/:id", async (req, res) => {
    try {
        console.log("🗑 Eliminando usuario con ID:", req.params.id);
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
    }
});

// Editar usuario
router.put("/editar/:id", async (req, res) => {
    try {
        console.log("✏ Editando usuario con ID:", req.params.id);
        const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        console.error("❌ Error al editar usuario:", error);
        res.status(500).json({ mensaje: "Error al editar usuario", error: error.message });
    }
});

// Crear usuario
router.post("/registro", async (req, res) => {
    try {
        console.log("➕ Registrando nuevo usuario:", req.body);
        const { username, email, password, tipoUsuario } = req.body;
        const { hash, salt } = encriptarPassword(password);
        const nuevoUsuario = new User({ username, email, password: hash, tipoUsuario, salt });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: "Usuario creado correctamente" });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
    }
});

export default router;
