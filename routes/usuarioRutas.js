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

router.post("/registro", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ 
                mensaje: "Todos los campos son obligatorios" 
            });
        }
        
        const respuesta = await register(username, email, password);
        
        res.status(respuesta.status)
           .cookie("token", respuesta.data?.token || "", {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict'
           })
           .json({
               mensaje: respuesta.mensajeUsuario,
               ...respuesta.data
           });
    } catch (error) {
        console.error("Error en /registro:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

router.post("/inicioSesion", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                mensaje: "Usuario y contraseña son obligatorios" 
            });
        }
        
        const respuesta = await login(username, password);
        
        res.status(respuesta.status)
           .cookie("token", respuesta.data?.token || "", {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict'
           })
           .json({
               mensaje: respuesta.mensajeUsuario,
               ...respuesta.data
           });
    } catch (error) {
        console.error("Error en /inicioSesion:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

router.get("/usuarios", async (req, res) => {
    try {
        const respuesta = await mostrarUsuarios();
        res.status(respuesta.status).json({
            mensaje: respuesta.mensajeUsuario,
            ...respuesta.data
        });
    } catch (error) {
        console.error("Error en /usuarios:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

router.get("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const respuesta = await buscarUsuarioPorId(id);
        
        res.status(respuesta.status).json({
            mensaje: respuesta.mensajeUsuario,
            ...respuesta.data
        });
    } catch (error) {
        console.error("Error en /usuarios/:id:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

router.delete("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const respuesta = await borrarUsuarioPorId(id);
        
        res.status(respuesta.status).json({
            mensaje: respuesta.mensajeUsuario,
            ...respuesta.data
        });
    } catch (error) {
        console.error("Error en /usuarios/:id:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

router.put("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const respuesta = await actualizarUsuarioPorId(id, updatedData);
        
        res.status(respuesta.status).json({
            mensaje: respuesta.mensajeUsuario,
            ...respuesta.data
        });
    } catch (error) {
        console.error("Error en /usuarios/:id:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

export default router;
