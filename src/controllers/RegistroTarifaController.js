// Importa la conexión a la base de datos desde un archivo externo
import { obtenerConexion, sql } from '../database/conexion';

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

// Función para calcular IGV y Subtotal
const calcularIGV = (costoTotal) => {
    const IGV_RATE = 0.18;
    const subtotal = parseFloat((costoTotal / (1 + IGV_RATE)).toFixed(2));
    const igv = parseFloat((costoTotal - subtotal).toFixed(2));
    return { subtotal, igv };
};

// Función para obtener todos los registros de vehículos registrados
export const obtenerRegistro = async (req, res) => {
    try {
        const conexion = await obtenerConexion();
        const resultado = await conexion.query('SELECT * FROM RegistroVehicular');
        
        // Formatear fecha, hora y calcular IGV/Subtotal
        const formattedResult = resultado.recordset.map(record => {
            const { subtotal, igv } = calcularIGV(record.CostoTotal);
            return {
                ...record,
                FechaRegistro: formatDate(record.FechaRegistro),
                HoraRegistro: formatTime(record.HoraRegistro),
                CostoTotal: record.CostoTotal,
                IGV: igv,
                Subtotal: subtotal
            };
        });
        
        console.log(formattedResult);
        res.json(formattedResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los registros de vehículos' });
    }
};

// Función para obtener un Registro Vehicular Específico por su ID
export const ObtenerRegVehId = async (req, res) => {
    try {
        const { IdRegistro } = req.params;
        const conexion = await obtenerConexion();
        const resultado = await conexion.request()
            .input('IdRegistro', sql.Int, IdRegistro)
            .query('SELECT * FROM RegistroVehicular WHERE IdRegistro = @IdRegistro');
        
        // Formatear fecha, hora y calcular IGV/Subtotal
        const formattedResult = resultado.recordset.map(record => {
            const { subtotal, igv } = calcularIGV(record.CostoTotal);
            return {
                ...record,
                FechaRegistro: formatDate(record.FechaRegistro),
                HoraRegistro: formatTime(record.HoraRegistro),
                CostoTotal: record.CostoTotal,
                IGV: igv,
                Subtotal: subtotal
            };
        });
    
        console.log(formattedResult);
        res.json(formattedResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Registro de Vehículo por ID' });
    }
};

// Función para insertar un nuevo Registro Vehicular en la base de datos
export const InsertarRegistro = async (req, res) => {
    const { Vehiculo, HorasParqueo, IdTarifa } = req.body;
    
    // Validar que los campos no sean nulos
    if (Vehiculo == null || HorasParqueo == null || IdTarifa == null) {
        return res.status(400).json({ message: 'Error, todos los campos (Vehiculo, HorasParqueo, IdTarifa) son requeridos' });
    }
    
    try {
        // Obtener la fecha y hora actuales, ajustadas a UTC-5
        const now = new Date();
        const localTime = new Date(now.getTime() - 5 * 60 * 60 * 1000); // Restar 5 horas
        const parsedFechaRegistro = localTime;
        const parsedHoraRegistro = localTime;

        const conexion = await obtenerConexion();
        
        // Obtener el CostoTarifa desde TblTarifa usando IdTarifa
        const tarifaResult = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .query('SELECT CostoTarifa FROM TblTarifa WHERE IdTarifa = @IdTarifa');
        
        if (tarifaResult.recordset.length === 0) {
            return res.status(400).json({ message: 'Error, tarifa no encontrada para el IdTarifa proporcionado' });
        }
        
        const CostoTarifa = tarifaResult.recordset[0].CostoTarifa;
        
        // Calcular CostoTotal = HorasParqueo * CostoTarifa (incluye IGV)
        const CostoTotal = HorasParqueo * CostoTarifa;
        
        // Calcular IGV y Subtotal para la respuesta
        const { subtotal, igv } = calcularIGV(CostoTotal);
        
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
        res.json({
            FechaRegistro: formatDate(parsedFechaRegistro),
            HoraRegistro: formatTime(parsedHoraRegistro),
            Vehiculo,
            HorasParqueo,
            CostoTotal,
            IGV: igv,
            Subtotal: subtotal,
            IdTarifa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar el registro vehicular' });
    }
};

// Función para editar un Registro Vehicular existente en la base de datos
export const editarRegistro = async (req, res) => {
    const { IdRegistro } = req.params;
    const { Vehiculo, HorasParqueo, IdTarifa } = req.body;

    // Validar que los campos no sean nulos
    if (Vehiculo == null || HorasParqueo == null || IdTarifa == null) {
        return res.status(400).json({ message: 'Error, todos los campos (Vehiculo, HorasParqueo, IdTarifa) son requeridos' });
    }

    try {
        // Obtener la fecha y hora actuales, ajustadas a UTC-5
        const now = new Date();
        const localTime = new Date(now.getTime() - 5 * 60 * 60 * 1000); // Restar 5 horas
        const parsedFechaRegistro = localTime;
        const parsedHoraRegistro = localTime;

        const conexion = await obtenerConexion();

        // Verificar si el registro existe
        const registroExistente = await conexion.request()
            .input('IdRegistro', sql.Int, IdRegistro)
            .query('SELECT * FROM RegistroVehicular WHERE IdRegistro = @IdRegistro');
        
        if (registroExistente.recordset.length === 0) {
            return res.status(404).json({ message: 'Error, registro no encontrado para el IdRegistro proporcionado' });
        }

        // Obtener el CostoTarifa desde TblTarifa usando IdTarifa
        const tarifaResult = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .query('SELECT CostoTarifa FROM TblTarifa WHERE IdTarifa = @IdTarifa');
        
        if (tarifaResult.recordset.length === 0) {
            return res.status(400).json({ message: 'Error, tarifa no encontrada para el IdTarifa proporcionado' });
        }
        
        const CostoTarifa = tarifaResult.recordset[0].CostoTarifa;

        // Calcular CostoTotal = HorasParqueo * CostoTarifa (incluye IGV)
        const CostoTotal = HorasParqueo * CostoTarifa;

        // Calcular IGV y Subtotal para la respuesta
        const { subtotal, igv } = calcularIGV(CostoTotal);

        // Actualizar el registro
        const resultado = await conexion.request()
            .input('IdRegistro', sql.Int, IdRegistro)
            .input('FechaRegistro', sql.Date, parsedFechaRegistro)
            .input('HoraRegistro', sql.Time, parsedHoraRegistro)
            .input('Vehiculo', sql.VarChar(100), Vehiculo)
            .input('HorasParqueo', sql.Int, HorasParqueo)
            .input('CostoTotal', sql.Float, CostoTotal)
            .input('IdTarifa', sql.Int, IdTarifa)
            .query(`
                UPDATE RegistroVehicular 
                SET FechaRegistro = @FechaRegistro,
                    HoraRegistro = @HoraRegistro,
                    Vehiculo = @Vehiculo,
                    HorasParqueo = @HorasParqueo,
                    CostoTotal = @CostoTotal,
                    IdTarifa = @IdTarifa
                WHERE IdRegistro = @IdRegistro
            `);

        console.log(resultado);
        res.json({
            IdRegistro,
            FechaRegistro: formatDate(parsedFechaRegistro),
            HoraRegistro: formatTime(parsedHoraRegistro),
            Vehiculo,
            HorasParqueo,
            CostoTotal,
            IGV: igv,
            Subtotal: subtotal,
            IdTarifa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al editar el registro vehicular' });
    }
};

// Función para borrar un Registro Vehicular en la base de datos
export const deleteRegistro = async (req, res) => {
    try {
        const { IdRegistro } = req.params;
        const conexion = await obtenerConexion();
        const resultado = await conexion.request()
            .input('IdRegistro', sql.Int, IdRegistro)
            .query('DELETE FROM RegistroVehicular WHERE IdRegistro = @IdRegistro');
        console.log(resultado);
        res.json({ message: `Registro con IdRegistro ${IdRegistro} eliminado correctamente` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el registro vehicular' });
    }
};