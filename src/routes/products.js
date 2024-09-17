const express = require('express');
const ProductManager = require('../managers/ProductManager.js');

const router = express.Router();
const productManager = new ProductManager('./data/products.json');

let io;


// Obtener todos los productos
router.get('/', async (req, res) => {
    const products = await productManager.getAllProducts();
    res.json(products);
});


// Obtener un producto por su ID
router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductsById(req.params.pid);
    if (product) {
        res.json(product);
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
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

router.delete('/:pid', async (req, res) => {
    await productManager.deleteProduct(req.params.pid);
    res.status(204).end();

    if (io) {
        const products = productManager.getAllProducts();
        io.emit('updatedProduct', products);
    }
});

function setSocketServer(socketServer) {
    io = socketServer;
}

module.exports = {router, setSocketServer};