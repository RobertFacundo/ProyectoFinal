// products.js
import express from 'express';
import productManager from '../config/productManager.js'; 
import path from 'path';
import mongoose from 'mongoose';
import __dirname from '../utils.js';

const router = express.Router();
let io;


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
        console.log('Producto modificado!:', updatedProduct)
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Eliminar un producto por su ID
router.delete('/:pid', async (req, res) => {
    const productId = req.params.pid; // Obtener el ID del producto

    // Verificar si el ID es un ObjectId válido (solo si usas MongoDB)
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log(`ID inválido recibido: ${productId}`);
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        // Intentar eliminar el producto
        const deletedProduct = await productManager.deleteProduct(productId);
        
        if (!deletedProduct) {
            console.log(`Producto no encontrado con ID: ${productId}`);
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Emitir la actualización de productos si el socket está disponible
        if (io) {
            const products = await productManager.getAllProducts();
            io.emit('updatedProducts', products);
        }

        console.log(`Producto con ID ${productId} eliminado`);
        // Responder con un código de estado 204 (Sin contenido)
        res.status(204).end();
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el producto', error });
    }
});


// Establecer el servidor de sockets
function setSocketServer(socketServer) {
    io = socketServer;
}

export { router, setSocketServer}; // Exporta usando ES Modules