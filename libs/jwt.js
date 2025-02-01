import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { mensajes } from "./mensajes.js"; 

dotenv.config(); // Cargar variables de entorno desde .env

export function crearCookie(dato) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            dato,
            process.env.SECRET_TOKEN,
            { expiresIn: "1d" },
            (err, token) => {
                if (err) {
                    return reject(mensajes(400, "Error al generar el token"));
                }
                resolve(mensajes(200, "Token generado correctamente", "", token));
            }
        );
    });
}
