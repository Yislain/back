import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import usuariosRutas from "./routes/usuarioRutas.js";
import { conectarDB } from "./db/db.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

conectarDB()
    .then(() => console.log(""))
    .catch((err) => console.error("Error en la conexión a la BD:", err));

app.use("/api", usuariosRutas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
