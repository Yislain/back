import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function conectarDB() {
    try {
        const conexionDB = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log("Conexión a la base de datos establecida correctamente");
        
        // Verificar la conexión
        const connection = mongoose.connection;
        connection.on('error', console.error.bind(console, 'Error de conexión MongoDB:'));
        connection.once('open', () => {
            console.log('Base de datos conectada:', connection.name);
        });
        
        return conexionDB;
    } catch (error) {
        console.error("Error al conectarse a la base de datos:", error.message);
        throw new Error("Error al conectarse a la base de datos");
    }
}
