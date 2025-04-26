import express from 'express';
const app = express();

import config from './config.js';
app.set('port', config.port);

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Importar las rutas
import ParkingRutas from './routes/Parking.routes.js';

// Aplicar configuración de las rutas
app.use(ParkingRutas);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;