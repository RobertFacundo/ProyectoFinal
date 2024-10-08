// config/cartManager.js
import dotenv from 'dotenv';
import path from 'path';
import CartManagerFS from '../dao/fileManagers/CartManager.js';
import CartManagerDB from '../dao/dbManagers/CartManager.js';
import __dirname from '../utils.js';

dotenv.config(); // Cargar las variables de entorno desde el archivo .env

let cartManager;

// Decidir qué tipo de manager usar en base a la variable de entorno
if (process.env.USE_MONGODB === 'true') {
    cartManager = new CartManagerDB();
    console.log('Usando MongoDB como gestor de carritos');
} else {
    cartManager = new CartManagerFS(path.join(__dirname, 'data/carts.json'));
    console.log('Usando FileSystem como gestor de carritos');
}

export default cartManager;