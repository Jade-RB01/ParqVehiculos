import { Router } from "express";
const rutas = Router();

//API TARIFA
import { obtenerTarifario, ObtenerTarifaId, InsertarTarifa, deleteTarifa } from "../controllers/TarifaController.js";

//api para mostrar el tarfario de parqueo
rutas.get('/tarifario', obtenerTarifario);

//Api para mostrar el tarifario por id
rutas.get('/tarifarioID/:IdTarifa', ObtenerTarifaId);

//Api para insertar nuevo Tarifario
rutas.post('/insertarTarifario', InsertarTarifa);

//Api para Eliminar Tarifario
rutas.get('/eliminarTarifario/:IdTarifa', deleteTarifa);


//API REGISTRO

//api para mostrar los Registros Vehiculares de parqueo
import {obtenerRegistro} from "../controllers/RegistroTarifaController.js";
rutas.get('/Registros', obtenerRegistro);

//Api para mostrar el Registro Vehiculares por id
import {ObtenerRegVehId} from "../controllers/RegistroTarifaController.js";
rutas.get('/registrosID/:IdRegistro', ObtenerRegVehId);

//Api para insertar nuevo Registros Vehiculares
import {InsertarRegistro} from "../controllers/RegistroTarifaController.js";
rutas.post('/insertarRegistros', InsertarRegistro);

//Api para Eliminar Registros Vehiculares
import {deleteRegistro } from "../controllers/RegistroTarifaController.js";
rutas.delete('/eliminarRegistros/:IdRegistro', deleteRegistro);

export default rutas;