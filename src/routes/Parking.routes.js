import { Router } from 'express';
//importaciones para manejar las rutas de Tarifas
import {obtenerTarifario, ObtenerTarifaId, InsertarTarifa, editarTarifa, deleteTarifa} from '../controllers/TarifaController.js';
//importaciones para manejar los registros vehiculares
import {obtenerRegistro, ObtenerRegVehId, InsertarRegistro, editarRegistro, deleteRegistro} from '../controllers/RegistroTarifaController.js';

const rutas = Router();

// API TARIFA
// Llamar todas las tarifas
rutas.get('/tarifas', obtenerTarifario);

// Llamar tarifas por el ID
rutas.get('/tarifaID/:IdTarifa', ObtenerTarifaId);

// Insertar Tarifas
rutas.post('/insertarTarifa', InsertarTarifa);

// Editar Tarifas
rutas.put('/editarTarifa/:IdTarifa', editarTarifa);

// Borrar tarifas segun ID
rutas.delete('/eliminarTarifa/:IdTarifa', deleteTarifa);

// API REGISTRO VEHICULAR
// Llamar todos los registros
rutas.get('/registros', obtenerRegistro);

// Llamar registro por el ID
rutas.get('/registroID/:IdRegistro', ObtenerRegVehId);

// Insertar Registro
rutas.post('/insertarRegistro', InsertarRegistro);

// Editar Registros
rutas.put('/editarRegistro/:IdRegistro', editarRegistro);

// Borrar registros segun ID
rutas.delete('/eliminarRegistro/:IdRegistro', deleteRegistro);

export default rutas;

