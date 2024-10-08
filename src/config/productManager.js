// config/productManager.js
import dotenv from 'dotenv';
import path from 'path';
import ProductManagerFS from '../dao/fileManagers/ProductManager.js';
import ProductManagerDB from '../dao/dbManagers/ProductManager.js';
import __dirname from '../utils.js';

dotenv.config(); // Cargar las variables de entorno desde el archivo .env

let productManager;

// Decidir qué tipo de manager usar en base a la variable de entorno
if (process.env.USE_MONGODB === 'true') {
    productManager = new ProductManagerDB();
    console.log('Usando MongoDB como gestor de productos');
} else {
    productManager = new ProductManagerFS(path.join(__dirname, 'data/products.json'));
    console.log('Usando FileSystem como gestor de productos');
}

export default productManager;