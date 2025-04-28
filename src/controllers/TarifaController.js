// Importa la conexión a la base de datos desde un archivo externo
import { obtenerConexion, sql } from '../database/conexion';

// Función para obtener todas las tarifas registradas
export const obtenerTarifario = async (req, res) => {
    try {
        const conexion = await obtenerConexion();
        const resultado = await conexion.query('SELECT * FROM TblTarifa');
        console.log(resultado);
        res.json(resultado.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el tarifario' });
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
        console.log(resultado);
        res.json(resultado.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la tarifa por ID' });
    }
};

// Función para insertar una nueva tarifa en la base de datos
export const InsertarTarifa = async (req, res) => {
    const { DescripTarifa, CostoTarifa } = req.body;
    if (DescripTarifa == null || CostoTarifa == null) {
        return res.status(400).json({ message: 'Error, todos los campos (DescripTarifa, CostoTarifa) son requeridos' });
    }
    try {
        const conexion = await obtenerConexion();
        const resultado = await conexion.request()
            .input("DescripTarifa", sql.VarChar(200), DescripTarifa)
            .input("CostoTarifa", sql.Float, CostoTarifa)
            .query("INSERT INTO TblTarifa (DescripTarifa, CostoTarifa) VALUES (@DescripTarifa, @CostoTarifa)");
        console.log(resultado);
        res.json({ DescripTarifa, CostoTarifa });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar la tarifa' });
    }
};

// Función para editar una tarifa existente en la base de datos
export const editarTarifa = async (req, res) => {
    const { IdTarifa } = req.params;
    const { DescripTarifa, CostoTarifa } = req.body;

    // Validar que los campos no sean nulos
    if (DescripTarifa == null || CostoTarifa == null) {
        return res.status(400).json({ message: 'Error, todos los campos (DescripTarifa, CostoTarifa) son requeridos' });
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

        // Actualizar la tarifa
        const resultado = await conexion.request()
            .input('IdTarifa', sql.Int, IdTarifa)
            .input('DescripTarifa', sql.VarChar(200), DescripTarifa)
            .input('CostoTarifa', sql.Float, CostoTarifa)
            .query(`
                UPDATE TblTarifa 
                SET DescripTarifa = @DescripTarifa,
                    CostoTarifa = @CostoTarifa
                WHERE IdTarifa = @IdTarifa
            `);

        console.log(resultado);
        res.json({ IdTarifa, DescripTarifa, CostoTarifa });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al editar la tarifa' });
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
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la tarifa' });
    }
};