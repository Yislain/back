// routes/usuarioRutas.js
import { Router } from "express";
import { 
    register, 
    login, 
    mostrarUsuarios, 
    buscarUsuarioPorId, 
    borrarUsuarioPorId, 
    actualizarUsuarioPorId 
} from "../controllers/usuariosDB.js";

const router = Router();

// Ruta para registrar usuario
router.post("/registro", async (req, res) => {
    try {
        console.log("Body recibido en /registro:", req.body);
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }
        
        const respuesta = await register(username, email, password);
        console.log("Registro:", respuesta.mensajeOriginal);
        
        res.status(respuesta.status)
           .cookie("token", respuesta.data?.token || "", { 
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict'
           })
           .json({ 
               mensaje: respuesta.mensajeUsuario,
               token: respuesta.data?.token
           });
    } catch (error) {
        console.error("Error en /registro:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// Ruta para inicio de sesión
router.post("/inicioSesion", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ mensaje: "Usuario y contraseña son obligatorios" });
        }
        
        const respuesta = await login(username, password);
        console.log("Inicio de sesión:", respuesta.mensajeOriginal);
        
        res.status(respuesta.status)
           .cookie("token", respuesta.data?.token || "", { 
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict'
           })
           .json({ 
               mensaje: respuesta.mensajeUsuario,
               token: respuesta.data?.token
           });
    } catch (error) {
        console.error("Error en /inicioSesion:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// Ruta para mostrar todos los usuarios
router.get("/usuarios", async (req, res) => {
    try {
        console.log("Iniciando petición GET /usuarios");
        const respuesta = await mostrarUsuarios();
        
        res.status(respuesta.status).json({
            mensaje: respuesta.mensajeUsuario,
        });
    } catch (error) {
        console.error("Error en /usuarios:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// Ruta para buscar usuario por id
router.get("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Petición GET /usuarios/:id recibida. ID:", id);

        const respuesta = await buscarUsuarioPorId(id);
        console.log("Respuesta búsqueda:", {
            status: respuesta.status,
            mensaje: respuesta.mensajeUsuario,
            usuario: respuesta.data?.usuario 
        });

        res.status(respuesta.status).json({
            mensaje: respuesta.mensajeUsuario,
            usuario: respuesta.data?.usuario 
        });
    } catch (error) {
        console.error("Error en /usuarios/:id:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// Ruta para borrar usuario por id
router.delete("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const respuesta = await borrarUsuarioPorId(id);
        
        res.status(respuesta.status).json({ 
            mensaje: respuesta.mensajeUsuario 
        });
    } catch (error) {
        console.error("Error en /usuarios/:id:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// Ruta para actualizar usuario por id
router.put("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const respuesta = await actualizarUsuarioPorId(id, updatedData);
        
        res.status(respuesta.status).json({
            mensaje: respuesta.mensajeUsuario,
            usuario: respuesta.data?.usuario 
        });
    } catch (error) {
        console.error("Error en /usuarios/:id:", error.message);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

export default router;
