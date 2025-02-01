import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { mensajes } from "../libs/mensajes.js";

dotenv.config();

// 🔹 Encripta la contraseña con un salt aleatorio
export function encriptarPassword(password) {
    if (!password || typeof password !== "string") {
        throw new Error("La contraseña proporcionada no es válida");
    }
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");

    return { salt, hash };
}

// 🔹 Valida una contraseña comparándola con el hash almacenado
export function validarPassword(password, salt, hash) {
    const hashEvaluar = crypto.scryptSync(password, salt, 64).toString("hex");
    return hashEvaluar === hash;
}

// 🔹 Middleware para verificar si el usuario está autorizado (Token válido)
export function usuarioAutorizado(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json(mensajes(401, "Acceso denegado. Token no proporcionado."));
    }

    jwt.verify(token.split(" ")[1], process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).json(mensajes(403, "Token inválido o expirado."));
        }
        req.user = decoded;
        next();
    });
}

// 🔹 Middleware para validar si el usuario es administrador
export function adminAutorizado(req, res, next) {
    usuarioAutorizado(req, res, () => {
        if (req.user && req.user.rol === "admin") {
            next();
        } else {
            return res.status(403).json(mensajes(403, "Acceso denegado. Se requiere rol de administrador."));
        }
    });
}
