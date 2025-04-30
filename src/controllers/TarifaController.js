// Importa la conexión a la base de datos desde un archivo externo
import { obtenerConexion, sql } from '../database/conexion';

// Formateo de tiempo para JSON en solo Horas (no usado en este controlador, pero incluido por consistencia)
const formatTime = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[1].split('.')[0];
};

// Formateo de fecha para JSON en solo Fecha (YYYY-MM-DD)
const formatDate = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
};

// Función para obtener todas las tarifas registradas
export const obtenerTarifario = async (req, res) => {
    try {
        const conexion = await obtenerConexion();
        const resultado = await conexion.query('SELECT * FROM TblTarifa');
        
        // Formatear FechaModificacion
        const formattedResult = resultado.recordset.map(record => ({
            ...record,
            FechaModificacion: formatDate(record.FechaModificacion)
        }));
        
        console.log(formattedResult);
        res.json(formattedResult);
    } catch (error) {
        console.error('Error detallado al obtener el tarifario:', error);
        res.status(500).json({ 
            error: 'Error al obtener el tarifario',
            details: error.message 
        });
    }
};

// Función para obtener una tarifa específica por su ID
export const ObtenerTarifaId = async (req, res) => {
    try {
        const { IdTarifa } = req.params;
        const conexion = await obtenerConexion();
        const resultado = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .query('SELECT * FROM TblTarifa WHERE IdTarifa = @IdTarifa');
        
        // Formatear FechaModificacion
        const formattedResult = resultado.recordset.map(record => ({
            ...record,
            FechaModificacion: formatDate(record.FechaModificacion)
        }));
        
        console.log(formattedResult);
        res.json(formattedResult);
    } catch (error) {
        console.error('Error detallado al obtener la tarifa por ID:', error);
        res.status(500).json({ 
            error: 'Error al obtener la tarifa por ID',
            details: error.message 
        });
    }
};

// Función para insertar una nueva tarifa en la base de datos
export const InsertarTarifa = async (req, res) => {
    const { Nombre_tarifa, DescripTarifa, CostoTarifa } = req.body;
    if (Nombre_tarifa == null || DescripTarifa == null || CostoTarifa == null) {
        return res.status(400).json({ message: 'Error, todos los campos (Nombre_tarifa, DescripTarifa, CostoTarifa) son requeridos' });
    }
    try {
        const conexion = await obtenerConexion();
        
        // Obtener la fecha actual, ajustada a UTC-5
        const now = new Date();
        const localTime = new Date(now.getTime() - 5 * 60 * 60 * 1000); // Restar 5 horas
        const parsedFechaModificacion = localTime;

        const resultado = await conexion.request()
            .input("Nombre_tarifa", sql.VarChar(100), Nombre_tarifa)
            .input("DescripTarifa", sql.VarChar(200), DescripTarifa)
            .input("CostoTarifa", sql.Float, CostoTarifa)
            .input("FechaModificacion", sql.Date, parsedFechaModificacion)
            .query("INSERT INTO TblTarifa (Nombre_tarifa, DescripTarifa, CostoTarifa, FechaModificacion) OUTPUT INSERTED.IdTarifa VALUES (@Nombre_tarifa, @DescripTarifa, @CostoTarifa, @FechaModificacion)");
        
        console.log('Resultado de la inserción:', resultado);
        res.json({
            IdTarifa: resultado.recordset[0]?.IdTarifa,
            Nombre_tarifa,
            DescripTarifa,
            CostoTarifa,
            FechaModificacion: formatDate(parsedFechaModificacion)
        });
    } catch (error) {
        console.error('Error detallado al insertar la tarifa:', error);
        res.status(500).json({ 
            error: 'Error al insertar la tarifa',
            details: error.message 
        });
    }
};

// Función para editar una tarifa existente en la base de datos
export const editarTarifa = async (req, res) => {
    const { IdTarifa } = req.params;
    const { Nombre_tarifa, DescripTarifa, CostoTarifa } = req.body;

    // Verificar si al menos un campo fue proporcionado
    if (Nombre_tarifa == null && DescripTarifa == null && CostoTarifa == null) {
        return res.status(400).json({ message: 'Error, debe proporcionar al menos un campo para actualizar (Nombre_tarifa, DescripTarifa, CostoTarifa)' });
    }

    try {
        const conexion = await obtenerConexion();

        // Verificar si la tarifa existe
        const tarifaExistente = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .query('SELECT * FROM TblTarifa WHERE IdTarifa = @IdTarifa');
        
        if (tarifaExistente.recordset.length === 0) {
            return res.status(404).json({ message: 'Error, tarifa no encontrada para el IdTarifa proporcionado' });
        }

        // Obtener la fecha actual, ajustada a UTC-5
        const now = new Date();
        const localTime = new Date(now.getTime() - 5 * 60 * 60 * 1000); // Restar 5 horas
        const parsedFechaModificacion = localTime;

        // Construir la consulta dinámicamente
        let query = 'UPDATE TblTarifa SET ';
        const updates = [];
        const request = conexion.request().input('IdTarifa', sql.Int, IdTarifa);

        if (Nombre_tarifa != null) {
            updates.push('Nombre_tarifa = @Nombre_tarifa');
            request.input('Nombre_tarifa', sql.VarChar(100), Nombre_tarifa);
        }
        if (DescripTarifa != null) {
            updates.push('DescripTarifa = @DescripTarifa');
            request.input('DescripTarifa', sql.VarChar(200), DescripTarifa);
        }
        if (CostoTarifa != null) {
            updates.push('CostoTarifa = @CostoTarifa');
            request.input('CostoTarifa', sql.Float, CostoTarifa);
        }

        // Agregar FechaModificacion
        updates.push('FechaModificacion = @FechaModificacion');
        request.input('FechaModificacion', sql.Date, parsedFechaModificacion);

        // Unir las partes de la consulta
        query += updates.join(', ') + ' WHERE IdTarifa = @IdTarifa';

        // Ejecutar la consulta
        const resultado = await request.query(query);

        // Obtener el registro actualizado para devolverlo
        const tarifaActualizada = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .query('SELECT * FROM TblTarifa WHERE IdTarifa = @IdTarifa');

        // Formatear FechaModificacion en la respuesta
        const formattedResult = {
            ...tarifaActualizada.recordset[0],
            FechaModificacion: formatDate(tarifaActualizada.recordset[0].FechaModificacion)
        };

        console.log('Resultado de la actualización:', resultado);
        res.json(formattedResult);
    } catch (error) {
        console.error('Error detallado al editar la tarifa:', error);
        res.status(500).json({ 
            error: 'Error al editar la tarifa',
            details: error.message 
        });
    }
};

// Función para borrar una tarifa en la base de datos
export const deleteTarifa = async (req, res) => {
    try {
        const { IdTarifa } = req.params;
        const conexion = await obtenerConexion();
        const resultado = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .query('DELETE FROM TblTarifa WHERE IdTarifa = @IdTarifa');
        console.log(resultado);
        res.json({ message: `Tarifa con IdTarifa ${IdTarifa} eliminada correctamente` });
    } catch (error) {
        console.error('Error detallado al eliminar la tarifa:', error);
        res.status(500).json({ 
            error: 'Error al eliminar la tarifa',
            details: error.message 
        });
    }
};