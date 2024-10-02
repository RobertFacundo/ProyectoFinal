// products.js
import express from 'express';

const router = express.Router();
let productManager; // Declarar la variable aquí
let io;

// Función para establecer el ProductManager
function setProductManager(manager) {
    productManager = manager;
}

// Obtener todos los productos
router.get('/', async (req, res) => {
    const products = await productManager.getAllProducts();
    res.json(products);
    console.log('Productos encontrados:', products)
});

// Obtener un producto por su ID
router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductsById(req.params.pid);
    if (product) {
        res.json(product);
        console.log('Producto encontrado:', product)
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        // Agrega el nuevo producto
        const newProduct = await productManager.addProduct(req.body);

        // Emite la lista de productos actualizada después de agregar el nuevo producto
        if (io) {
            const updatedProducts = await productManager.getAllProducts(); // Obtener la lista actualizada de productos
            io.emit('updatedProducts', updatedProducts);
        }

        // Envía una respuesta HTTP al cliente
        res.status(201).json(newProduct);
        console.log('Producto agregado:', newProduct)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Actualizar un producto existente
router.put('/:pid', async (req, res) => {
    const updatedProduct = await productManager.updatedProduct(req.params.pid, req.body);
    if (updatedProduct) {
        res.json(updatedProduct);

        if (io) {
            const products = await productManager.getAllProducts();
            io.emit('updatedProducts', products);
        }
        console.log('Producto modificado', updatedProduct)
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Eliminar un producto por su ID
router.delete('/:pid', async (req, res) => {
    await productManager.deleteProduct(req.params.pid);
    res.status(204).end();

    if (io) {
        const products = await productManager.getAllProducts(); // Asegúrate de usar await aquí
        io.emit('updatedProducts', products); // Corregido a 'updatedProducts'
    }
    console.log('Producto eliminado')
});

function setSocketServer(socketServer) {
    io = socketServer;
}

export { router, setSocketServer, setProductManager }; // Exporta usando ES Modules