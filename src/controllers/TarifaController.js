// Importa la conexión a la base de datos desde un archivo externo
import {obtenerConexion, sql} from '../database/conexion';

// Función para obtener todas las tarifas registradas
export const obtenerTarifario = async (req,res) => {
    const conexion = await obtenerConexion();
    const resultado = await conexion.query ('SELECT * FROM TblTarifa');
    console.log(resultado);
    res.json(resultado.recordset);
}

// Función para obtener una tarifa específica por su ID
export const ObtenerTarifaId = async (req, res) => {
try{
    const {IdTarifa} = req.params;
    const conexion = await obtenerConexion();
    const resultado = await conexion.request()
        .input('IdTarifa', sql.Int, IdTarifa)
        .query('SELECT * FROM TblTarifa WHERE IdTarifa = @IdTarifa'); 
    console.log(resultado);
    res.json(resultado.recordset);
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la tarifa por ID' });
    }
};

// Función para insertar una nueva tarifa en la base de datos
export const InsertarTarifa = async (req, res) => 
{
    const { DescripTarifa, CostoTarifa } = req.body;
    if(DescripTarifa == null || CostoTarifa == null)
    {
        return res.status(500).json({message: 'Error, no se puede insertar la tarifa'});
    }
    const conexion = await obtenerConexion();
    const resultado = await conexion.request()
        .input("DescripTarifa", sql.VarChar(200), DescripTarifa)
        .input("CostoTarifa", sql.Float, CostoTarifa)
        .query("INSERT INTO TblTarifa (DescripTarifa, CostoTarifa) VALUES (@DescripTarifa, @CostoTarifa)");
    console.log(resultado);
    res.json({DescripTarifa, CostoTarifa});
}

// Función para borrar una tarifa en la base de datos
export const deleteTarifa = async (req, res) => 
{
    const {IdTarifa} = req.params;
    const conexion = await obtenerConexion();
    const resultado = await conexion.request()
        .input('IdTarifa', sql.Int, IdTarifa)
        .query('DELETE FROM TblTarifa WHERE IdTarifa = @IdTarifa');
    //imprimir consola (DEV)
    console.log(resultado);
    //resultado al navegador
    res.json(resultado.recordset);
}