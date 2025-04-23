import app from './app.js'

//Configurar puerto de escucha HTTP
app.listen(app.get('port'));

console.log("Servidor IBM 2025 Server proliant iniciado en el puerto", app.get('port'));