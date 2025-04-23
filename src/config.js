//Crear varianbles de entorno con dot-env
import { config } from "dotenv";
//llamada o creacion de variables de entorno
config();

console.log(process.env.desarrolladorFullStack)
export default 
{
    port:process.env.port
}