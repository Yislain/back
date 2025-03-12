import { Router } from "express";
import User from "../models/usuarioModelo.js";
import { encriptarPassword, validarPassword } from "../middlewares/funcionesPassword.js";
import { crearToken } from "../libs/jwt.js";

const router = Router();

// 🔹 OBTENER TODOS LOS USUARIOS
router.get("/usuarios", async (req, res) => {
    try {
        console.log("📦 Obteniendo usuarios de la base de datos...");
        const usuarios = await User.find({}, "username email tipoUsuario");
        console.log("✅ Usuarios obtenidos:", usuarios);
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error("❌ Error en la ruta /usuarios:", error);
        return res.status(500).json({ mensaje: "Error al obtener usuarios", error: error.message });
    }
});

// 🔹 REGISTRO DE USUARIO
router.post("/registro", async (req, res) => {
    try {
        console.log("📤 Intentando registrar usuario:", req.body);

        const { username, email, password, tipoUsuario } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        // Verificar si el usuario o email ya existen
        const usuarioExistente = await User.findOne({ username });
        const emailExistente = await User.findOne({ email });

        if (usuarioExistente || emailExistente) {
            return res.status(400).json({ mensaje: "El usuario o el email ya están en uso" });
        }

        // Encriptar contraseña
        const { hash, salt } = encriptarPassword(password);
        const nuevoUsuario = new User({ username, email, password: hash, salt, tipoUsuario: tipoUsuario || "usuario" });

        // Guardar usuario en la base de datos
        const usuarioGuardado = await nuevoUsuario.save();

        // Generar token
        const token = await crearToken({
            id: usuarioGuardado._id,
            username: usuarioGuardado.username,
            email: usuarioGuardado.email,
            tipoUsuario: usuarioGuardado.tipoUsuario
        });

        console.log("✅ Usuario registrado correctamente:", usuarioGuardado);

        res.status(201).json({ 
            estado: true, 
            mensaje: "Usuario registrado correctamente",
            usuario: usuarioGuardado,
            token
        });

    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
    }
});

// 🔹 INICIO DE SESIÓN (LOGIN)
router.post("/ingresar", async (req, res) => {
    try {
        console.log("🔐 Iniciando sesión con datos:", req.body);
        const { username, password } = req.body;

        // Buscar usuario en la base de datos
        const usuario = await User.findOne({ username });
        if (!usuario) {
            return res.status(400).json({ estado: false, mensaje: "Usuario no encontrado" });
        }

        // Verificar contraseña
        const passwordCorrecto = validarPassword(password, usuario.salt, usuario.password);
        if (!passwordCorrecto) {
            return res.status(400).json({ estado: false, mensaje: "Contraseña incorrecta" });
        }

        // Generar token
        const token = await crearToken({
            id: usuario._id,
            username: usuario.username,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        });

        console.log("✅ Usuario autenticado correctamente");
        return res.status(200).json({ 
            estado: true, 
            mensaje: "Inicio de sesión correcto",
            usuario: {
                id: usuario._id,
                username: usuario.username,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario
            },
            token
        });
    } catch (error) {
        console.error("❌ Error en el inicio de sesión:", error);
        return res.status(500).json({ estado: false, mensaje: "Error en el inicio de sesión", error: error.message });
    }
});

// 🔹 BUSCAR USUARIO POR ID
router.get("/buscarPorId/:id", async (req, res) => {
    const { id } = req.params;

    if (!id || id === "undefined") {
        return res.status(400).json({ mensaje: "❌ Error: ID de usuario inválido" });
    }

    try {
        console.log("📤 Buscando usuario en la BD con ID:", id);
        const usuario = await User.findById(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        console.log("✅ Usuario encontrado:", usuario);
        return res.status(200).json(usuario);
    } catch (error) {
        console.error("❌ Error al buscar usuario:", error);
        return res.status(500).json({ mensaje: "Error al buscar usuario", error: error.message });
    }
});

// 🔹 EDITAR USUARIO
router.put("/editar/:id", async (req, res) => {
    try {
        console.log("✏ Editando usuario con ID:", req.params.id);
        const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json({ estado: true, mensaje: "Usuario actualizado correctamente", usuario: usuarioActualizado });
    } catch (error) {
        console.error("❌ Error al editar usuario:", error);
        return res.status(500).json({ estado: false, mensaje: "Error al editar usuario", error: error.message });
    }
});

// 🔹 ELIMINAR USUARIO
router.delete("/borrar/:id", async (req, res) => {
    try {
        console.log("🗑 Eliminando usuario con ID:", req.params.id);
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ estado: true, mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        return res.status(500).json({ estado: false, mensaje: "Error al eliminar usuario", error: error.message });
    }
});

// 🔹 CERRAR SESIÓN
router.post("/cerrarSesion", async (req, res) => {
    try {
        console.log("🚪 Cerrando sesión...");
        res.clearCookie("token").status(200).json({ estado: true, mensaje: "Sesión cerrada correctamente" });
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
        return res.status(500).json({ estado: false, mensaje: "Error al cerrar sesión", error: error.message });
    }
});

// RUTA LIBRE (Prueba)
router.get("/libre", (req, res) => {
    res.status(200).json({ mensaje: "Ruta de acceso libre" });
});

// Obtener usuarios logueados
router.get("/usuariosLogueados", async (req, res) => {
    try {
        console.log("📤 Obteniendo usuarios logueados...");
        const usuariosLogueados = await User.find({}, "username email tipoUsuario");

        if (!usuariosLogueados || usuariosLogueados.length === 0) {
            return res.status(200).json({ mensaje: "No hay usuarios logueados." });
        }

        console.log("✅ Usuarios logueados obtenidos:", usuariosLogueados);
        return res.status(200).json(usuariosLogueados);
    } catch (error) {
        console.error("❌ Error al obtener usuarios logueados:", error);
        return res.status(500).json({ mensaje: "Error al obtener usuarios logueados", error: error.message });
    }
});


export default router;
