import sql from 'mssql';

const parametrosSQL =
{
    user : process.env.user,
    password : process.env.password,
    server : process.env.server,
    database : process.env.database,
    trustServerCertificate : Boolean(process.env.trustServerCertificate)
}
export async function obtenerConexion() 
{
    try {
        const miConexion = await sql.connect(parametrosSQL);
        return miConexion;
    } catch (error) {
        console.log(error)
    }
}
export {sql};
