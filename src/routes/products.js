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
    try {
        const limit = parseInt(req.query.limit) || 10; // Establecer un límite predeterminado
        const currentPage = parseInt(req.query.page) || 1; // Página predeterminada
        const sort = req.query.sort; // 'asc' o 'desc' para ordenar
        const query = req.query.category; // Filtrar por categoría

        // Llamar al método getAllProducts del ProductManager
        const { products, totalProducts, prevLink, nextLink, page } = await productManager.getAllProducts({
            limit,
            page: currentPage,
            sort,
            query
        });

        console.log('Respuesta del Product Manager:', { products, totalProducts, prevLink, nextLink });


        // Calcular totalPages a partir de totalProducts
        const totalPages = Math.ceil(totalProducts / limit);

        // Verificar si la página solicitada es válida
        if (page > totalPages || page < 1) {
            // Redirigir a la página 404
            return res.status(404).render('404');
        }

        // Si hay parámetros de consulta, devolver los productos en JSON con el formato solicitado
        if (req.query.limit || req.query.page || req.query.sort || req.query.category) {
            return res.json({
                status: 'success',
                payload: products,
                totalPages: totalPages,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                page: currentPage,
                hasPrevPage: currentPage > 1,
                hasNextPage: currentPage < totalPages,
                prevLink: currentPage > 1 ? `${req.baseUrl}?limit=${limit}&page=${currentPage - 1}` : null,
                nextLink: currentPage < totalPages ? `${req.baseUrl}?limit=${limit}&page=${currentPage + 1}` : null,
            });
        }

        // Renderizar la vista de productos en caso contrario
        res.render('home', {
            products,
            totalProducts,
            prevLink,
            nextLink,
            page, // Aquí mantén 'page' para la paginación en la vista
            totalPages: Math.ceil(totalProducts / limit),
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
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
            // Obtener la lista actualizada de productos
            const { products: updatedProducts } = await productManager.getAllProducts();
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

        if (deletedProduct) {
            if (io) {
                const { products: updatedProducts } = await productManager.getAllProducts();
                io.emit('updatedProducts', updatedProducts);
            }
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
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

export { router, setSocketServer }; // Exporta usando ES Modules