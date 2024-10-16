import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { create as createHandlebars } from 'express-handlebars'; // Usar importación nombrada
import path from 'path';
//importar archivo utils que soluciona la creacion del path
import __dirname from './utils.js';
import { router as productsRouter, setSocketServer } from './routes/products.js';
import cartsRouter from './routes/carts.js'; // Importación de cartsRouter
import dotenv from 'dotenv'; // Importar dotenv

import methodOverride from 'method-override';

import mongoose from 'mongoose';
import productManager from './config/productManager.js';
import Cart from './dao/models/Cart.js';

// Configurar dotenv
dotenv.config(); // Cargar las variables de entorno
console.log('USE_MONGODB:', process.env.USE_MONGODB); 

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
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    helpers: {
        increment: (value) => {
            return value + 1;
        }
    }
});


// Configurar el motor de plantillas
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); 

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware para sobrescribir métodos
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


// Inyecta el servidor de Socket.io en el router de productos
setSocketServer(io);


// Ruta para la página principal
app.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Establece el límite predeterminado
        const currentPage = parseInt(req.query.page) || 1; // Cambia 'page' a 'currentPage'
        const sort = req.query.sort; // Obtiene el método de ordenamiento de los parámetros de consulta
        const query = req.query.category; // Obtiene la categoría para filtrar productos

        // Llama al método getAllProducts y desestructurar los productos
        const { products, totalProducts, categories } = await productManager.getAllProducts({ limit, page: currentPage, sort, query });

        // Calcula totalPages a partir de totalProducts
        const totalPages = Math.ceil(totalProducts / limit);

        // Verifica si la página solicitada es válida
        if (currentPage > totalPages || currentPage < 1) { // Usar 'currentPage' aquí
            // Redirigir a la página 404
            return res.status(404).render('404');
        }

         // Obtiene todos los carritos directamente aquí
         const carts = await Cart.find(); 

        // Genera enlaces para la paginación
        const prevLink = currentPage > 1 ? `${req.baseUrl}?limit=${limit}&page=${currentPage - 1}&sort=${sort || ''}&category=${query || ''}` : null;
        const nextLink = currentPage < totalPages ? `${req.baseUrl}?limit=${limit}&page=${currentPage + 1}&sort=${sort || ''}&category=${query || ''}` : null;

        res.render('home', { products, prevLink, nextLink, totalPages, page: currentPage, categories, carts }); 
        console.log(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

// Ruta para la página de productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const currentPage = parseInt(req.query.page) || 1; 
        const sort = req.query.sort; 
        const query = req.query.category;

        
        const { products, totalProducts, categories } = await productManager.getAllProducts({ limit, page: currentPage, sort, query });
        
        const totalPages = Math.ceil(totalProducts / limit);

        if (currentPage > totalPages || currentPage < 1) {
            return res.status(404).render('404');
        }

        const prevLink = currentPage > 1 ? `${req.baseUrl}?limit=${limit}&page=${currentPage - 1}&sort=${sort || ''}&category=${query || ''}` : null;
        const nextLink = currentPage < totalPages ? `${req.baseUrl}?limit=${limit}&page=${currentPage + 1}&sort=${sort || ''}&category=${query || ''}` : null;

        console.log('Renderizando /realtimeproducts')
        res.render('realtimeproducts', { products, prevLink, nextLink, totalPages, page: currentPage, categories, limit });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

const queryParamsStore = {};

// Configura Socket.io para manejar eventos en tiempo real
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Configura los parámetros de consulta al conectarse
    socket.on('setQueryParams', (params) => {
        queryParamsStore[socket.id] = params; // Almacenar los parámetros por ID de socket
    });

    socket.on('newProduct', async (product) => {
        try {
            await productManager.addProduct(product); // Método para agregar el producto

            // parámetros de consulta
            const { limit, page, sort, category } = queryParamsStore[socket.id] || { limit: 10, page: 1, sort: null, category: null }

            // Llama a getAllProducts para obtener la lista actualizada
            const { products } = await productManager.getAllProducts({ limit, page, sort, query: category });

            // Emite la lista actualizada a todos los clientes
            io.emit('updatedProducts', products);
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            const deletedProduct = await productManager.deleteProduct(productId);
            if (deletedProduct) {
                console.log('Producto eliminado:', deletedProduct);

                // Obtiene los parámetros de consulta

                const { limit, page, sort, category } = queryParamsStore[socket.id] || { limit: 10, page: 1, sort: null, category: null };

                // Llama a getAllProducts para obtener la lista actualizada
                const { products } = await productManager.getAllProducts({ limit, page, sort, query: category });

                // Emite la lista actualizada de productos
                io.emit('updatedProducts', products);
            } else {
                console.log('No se pudo eliminar el producto');
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
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


//-----------------------------

// Middleware para manejar 404
app.use((req, res, next) => {
    res.status(404).render('404'); // Renderiza la página de error 404
});

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal.'); 
});
//---------------------------


// Inicia el servidor
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en port ${PORT}`);
});