import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import usuariosRutas from "./routes/usuariosRutas.js";
import { conectarBD } from "./db/db.js";

const app = express();
conectarBD();

app.use(cookieParser());
app.use(express.json());  // 🔥 Asegúrate de que esta línea esté aquí
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}));

app.use("/api", usuariosRutas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor express en http://localhost:${PORT}`);
});
