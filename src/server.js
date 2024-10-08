import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { create as createHandlebars } from 'express-handlebars'; // Usar importación nombrada
import path from 'path'; 
//importar archivo utils que soluciona la creacion del path
import __dirname from './utils.js';
import { router as productsRouter, setSocketServer} from './routes/products.js';
import cartsRouter from './routes/carts.js'; // Importación de cartsRouter

import dotenv from 'dotenv'; // Importar dotenv
import mongoose from 'mongoose';
import productManager from './config/productManager.js';

// Configurar dotenv
dotenv.config(); // Cargar las variables de entorno
console.log('USE_MONGODB:', process.env.USE_MONGODB); // Im

// Configuración básica de Express
const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer);
const PORT = 8080;

// Gestor a utilizar

if (process.env.USE_MONGODB === 'true') {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
}

// Configurar Handlebars
const hbs = createHandlebars({
    extname: '.handlebars',
    layoutsDir: path.join(__dirname, 'views/layouts'), // Utilizar path para manejar las rutas
    defaultLayout: 'main',
});

// Configurar el motor de plantillas
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Usar path para evitar problemas con las rutas

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Asegurarse de que la ruta sea correcta
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Inyectar el servidor de Socket.io en el router de productos
setSocketServer(io);


// Ruta para la página principal
app.get('/', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
        res.render('home', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

// Ruta para la página de productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
        res.render('realtimeproducts', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

// Configurar Socket.io para manejar eventos en tiempo real
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('newProduct', async (product) => {
        try {
            await productManager.addProduct(product);
            const updatedProducts = await productManager.getAllProducts();
            io.emit('updatedProducts', updatedProducts);
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        await productManager.deleteProduct(productId);
        const updatedProducts = await productManager.getAllProducts();
        io.emit('updatedProducts', updatedProducts);
    });
});

// Rutas HTTP adicionales

// Ruta para agregar un producto (vía POST)
app.post('/api/products', async (req, res) => {
    const newProduct = req.body;
    try {
        await productManager.addProduct(newProduct);
        const updatedProducts = await productManager.getAllProducts();
        io.emit('updatedProducts', updatedProducts);
        res.status(201).json({ message: 'Producto agregado', product: newProduct });
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ success: false, message: 'Error al agregar producto', error });
    }
});

// Ruta para eliminar un producto (vía DELETE)
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    await productManager.deleteProduct(productId);
    const updatedProducts = await productManager.getAllProducts();
    io.emit('updatedProducts', updatedProducts);
    res.status(200).json({ message: 'Producto eliminado' });
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en port ${PORT}`);
});