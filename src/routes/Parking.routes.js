import { Router } from "express";
const rutas = Router();

//APIS
import { obtenerTarifario, ObtenerTarifaId, InsertarTarifa, deleteTarifa } from "../controllers/TarifaController.js";
//api para mostrar el tarfario de parqueo
rutas.get('/Tarifario', obtenerTarifario);

//Api para mostrar el tarifario por id
rutas.get('/TarifarioID/:IdTarifa', ObtenerTarifaId);

//Api para insertar nuevo Tarifario
rutas.post('/InsertarTarifario', InsertarTarifa);

//Api para Eliminar Tarifario
rutas.delete('/EliminarTarifario/:IdTarifa', deleteTarifa);

export default rutas;