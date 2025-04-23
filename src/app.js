import express from 'express';
const app = express();

import config from './config.js';
app.set('port', config.port);

// Configurar cliente Postman para recibir parámetros por body en formato JSON
app.use(express.json()); // Middleware para parsear JSON
app.use(express.urlencoded({ extended: false })); // Middleware para formularios

// Importar las rutas creadas para nuestras APIs
import TarifaRuta from './routes/Parking.routes.js';

// Aplicar configuración de la ruta
app.use(TarifaRuta); 

export default app;