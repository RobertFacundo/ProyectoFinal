
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const { router: productsRouter, setSocketServer } = require('./routes/products');
const cartsRouter = require('./routes/carts');
const ProductManager = require('./managers/ProductManager.js');

const app = express(); // Crea una instancia de la aplicación Express.
const httpServer = createServer(app); // Crea el servidor HTTP usando Express.
const io = new Server(httpServer); // Configura Socket.io para que escuche conexiones en el servidor HTTP.
const PORT = 8080;
// Crea una instancia de ProductManager, indicando el archivo JSON de productos.
const productManager = new ProductManager('./data/products.json');

const hbs = exphbs.create({
    extname: '.handlebars', // Opcional: puedes especificar la extensión de archivo si usas algo distinto
    layoutsDir: 'views/layouts/',
    defaultLayout: 'main'
});

// Configurar Handlebars
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Inyectar el servidor de Socket.io en el router de productos
setSocketServer(io);

// Ruta para la página principal con Handlebars
app.get('/', async (req, res) => {
    try {
        // Obtiene todos los productos usando el método getAllProducts del productManager renderizando en home
        const products = await productManager.getAllProducts();
        res.render('home', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

// Ruta para la página de productos en tiempo real con Handlebars
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
        res.render('realtimeproducts', { products }); // Renderiza la vista 'realtimeproducts', que será actualizada en tiempo real con Socket.io
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

// Configuración del servidor Socket.io para manejar eventos de conexión en tiempo real
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Evento cuando se añade un nuevo producto desde el cliente
    socket.on('newProduct', async (product) => {
        try {
            // Se agrega el nuevo producto con el método addProduct del productManager
            await productManager.addProduct(product); // Ahora le pasamos el producto al método
            const updatedProducts = await productManager.getAllProducts();  // Se obtiene la lista actualizada de productos
    
            console.log('Emitiendo productos actualizados:', updatedProducts);
            // Se emiten los productos actualizados a todos los clientes conectados
            io.emit('updatedProducts', updatedProducts);
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });

    // Evento cuando se elimina un producto
    socket.on('deleteProduct', async (productId) => {
        await productManager.deleteProduct(productId);
        const updatedProducts = await productManager.getAllProducts();
        console.log('Emitiendo productos actualizados:', updatedProducts); // 
        io.emit('updatedProducts', updatedProducts);    // Se emiten los productos actualizados a todos los clientes conectados
    });
});

// ----------------------------------------------------
// Añadiendo WebSockets dentro de las rutas HTTP (POST/DELETE)
// ----------------------------------------------------

// Ruta HTTP para agregar un producto (vía POST)
app.post('/api/products', async (req, res) => {
    const newProduct = req.body;
    console.log('Producto recibido en el servidor vía POST:', newProduct); // Verificar los datos que llegan al servidor

    try {
        await productManager.addProduct(newProduct);
        const updatedProducts = await productManager.getAllProducts();

        console.log('Productos actualizados enviados a todos los clientes:', updatedProducts); // Verificar la lista actualizada

        // Emite evento de actualización a través de WebSocket
        io.emit('updatedProducts', updatedProducts); // Enviar lista actualizada de productos a todos los clientes conectados

        res.status(201).json({ message: 'Producto agregado', product: newProduct });
    } catch (error) {
        console.error('Error al agregar el producto:', error); // Mostrar el error en el servidor
        res.status(500).json({ success: false, message: 'Error al agregar producto', error });
    }
});

// Ruta HTTP para eliminar un producto (vía DELETE)
app.delete('api/products/:id', async (req, res) => {
    const productId = req.params.id;
    await productManager.deleteProduct(productId);
    const updatedProducts = await productManager.getAllProducts();

    // Emitir evento de actualización a través de WebSocket
    io.emit('updatedProducts', updatedProducts);

    res.status(200).json({ message: 'Producto eliminado' });
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en port ${PORT}`)
})