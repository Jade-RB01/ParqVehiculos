import {obtenerConexion, sql} from '../database/conexion';

// Formateo de tiempo para JSON en solo Horas
const formatTime = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[1].split('.')[0];
};

// Formateo de fecha para JSON en solo Fecha (YYYY-MM-DD)
const formatDate = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
};

// Función para obtener todos los registros de vehiculos registrados
export const obtenerRegistro = async (req, res) => {
    const conexion = await obtenerConexion();
    const resultado = await conexion.query('SELECT * FROM RegistroVehicular');
    
    // Formatear fecha y hora al llamar a los registros
    const formattedResult = resultado.recordset.map(record => ({
        ...record,
        FechaRegistro: formatDate(record.FechaRegistro), // Convert to "YYYY-MM-DD"
        HoraRegistro: formatTime(record.HoraRegistro)   // Convert to "HH:mm:ss"
    }));
    
    console.log(formattedResult);
    res.json(formattedResult);
};

// Función para obtener un Registro Vehicular Específico por su ID
export const ObtenerRegVehId = async (req, res) => {
    try {
        const {IdRegistro} = req.params;
        const conexion = await obtenerConexion();
        const resultado = await conexion.request()
            .input('IdRegistro', sql.Int, IdRegistro)
            .query('SELECT * FROM RegistroVehicular WHERE IdRegistro = @IdRegistro'); 
        
        // Formatear fecha y hora al llamar registro por ID
        const formattedResult = resultado.recordset.map(record => ({
            ...record,
            FechaRegistro: formatDate(record.FechaRegistro), // Convert to "YYYY-MM-DD"
            HoraRegistro: formatTime(record.HoraRegistro)   // Convert to "HH:mm:ss"
        }));
    
        console.log(formattedResult);
        res.json(formattedResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Registro de Vehiculo por ID' });
    }
};

// Función para insertar un nuevo Registro Vehicular en la base de datos
export const InsertarRegistro = async (req, res) => {
    const { FechaRegistro, HoraRegistro, Vehiculo, HorasParqueo, IdTarifa } = req.body;
    
    // Validar que los campos no sean nulos
    if (FechaRegistro == null || HoraRegistro == null || Vehiculo == null || HorasParqueo == null || IdTarifa == null) {
        return res.status(500).json({message: 'Error, no se puede insertar el registro'});
    }
    
    try {
        // Parsear FechaRegistro a un objeto Date
        const parsedFechaRegistro = new Date(FechaRegistro);
        if (isNaN(parsedFechaRegistro.getTime())) {
            return res.status(400).json({message: 'Error, FechaRegistro no tiene un formato válido (YYYY-MM-DD)'});
        }

        // Parsear HoraRegistro (formato "HH:mm:ss") a un objeto Date
        const [hours, minutes, seconds] = HoraRegistro.split(':').map(Number);
        const parsedHoraRegistro = new Date();
        parsedHoraRegistro.setHours(hours, minutes, seconds, 0); // Establecer hora, minutos, segundos, milisegundos
        if (isNaN(parsedHoraRegistro.getTime())) {
            return res.status(400).json({message: 'Error, HoraRegistro no tiene un formato válido (HH:mm:ss)'});
        }

        const conexion = await obtenerConexion();
        
        // Obtener el CostoTarifa desde TblTarifa usando IdTarifa
        const tarifaResult = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .query('SELECT CostoTarifa FROM TblTarifa WHERE IdTarifa = @IdTarifa');
        
        if (tarifaResult.recordset.length === 0) {
            return res.status(400).json({message: 'Error, tarifa no encontrada para el IdTarifa proporcionado'});
        }
        
        const CostoTarifa = tarifaResult.recordset[0].CostoTarifa;
        
        // Calcular CostoTotal = HorasParqueo * CostoTarifa
        const CostoTotal = HorasParqueo * CostoTarifa;
        
        // Insertar el registro con el CostoTotal calculado
        const resultado = await conexion.request()
            .input("FechaRegistro", sql.Date, parsedFechaRegistro)
            .input("HoraRegistro", sql.Time, parsedHoraRegistro)
            .input("Vehiculo", sql.VarChar(100), Vehiculo)
            .input("HorasParqueo", sql.Int, HorasParqueo)
            .input("CostoTotal", sql.Float, CostoTotal)
            .input("IdTarifa", sql.Int, IdTarifa)
            .query("INSERT INTO RegistroVehicular (FechaRegistro, HoraRegistro, Vehiculo, HorasParqueo, CostoTotal, IdTarifa) VALUES (@FechaRegistro, @HoraRegistro, @Vehiculo, @HorasParqueo, @CostoTotal, @IdTarifa)");
        
        console.log(resultado);
        res.json({FechaRegistro, HoraRegistro, Vehiculo, HorasParqueo, CostoTotal, IdTarifa});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar el registro vehicular' });
    }
};

// Función para borrar un Registro Vehicular en la base de datos
export const deleteRegistro = async (req, res) => {
    const {IdRegistro} = req.params;
    const conexion = await obtenerConexion();
    const resultado = await conexion.request()
        .input('IdRegistro', sql.Int, IdRegistro)
        .query('DELETE FROM RegistroVehicular WHERE IdRegistro = @IdRegistro');
    // Imprimir consola (DEV)
    console.log(resultado);
    // Resultado al navegador
    res.json(resultado.recordset);
};