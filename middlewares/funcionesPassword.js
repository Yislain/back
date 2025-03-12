import { log } from "console";
import crypto from "crypto";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { buscaUsuarioPorID } from "../db/usuariosBD.js";
import { mensajes } from "../libs/manejoErrores.js";


export function encriptarPassword(password){
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");
    return{
        salt,
        hash
    }
}

export function validarPassword(password, salt, hash){
    const hashEvaluar = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");    
    return hashEvaluar == hash;
}

export function usuarioAutorizado(token, req) {
    if(!token){
        return mensajes(400, "Usuario no autorizado - token");
    }
    jwt.verify(token,process.env.SECRET_TOKEN,(error, usuario)=>{
        if(error){
            return mensajes(400, "Usuario no autorizado - token no válido")
        }
        req.usuario=usuario;
    });
    return mensajes(200,"Usuario autorizado");
}

export async function adminAutorizado(req) {
    const respuesta = await usuarioAutorizado(req.cookies.token, req)
    if(respuesta.status != 200){
        return mensajes(400,"Admin no autorizado")
    }
    const usuario =  await buscaUsuarioPorID(req.usuario.id);
    if(usuario.tipoUsuario!="admin"){
        return mensajes(400,"Admin no autorizado");
    }
    return mensajes(200,"Admin autorizado");
}
