// products.js
import express from 'express';
import productManager from '../config/productManager.js';
import path from 'path';
import mongoose from 'mongoose';
import __dirname from '../utils.js';

import Cart from '../dao/models/Cart.js';


const router = express.Router();
let io;


// Obteniene todos los productos
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


        // Calcula totalPages a partir de totalProducts
        const totalPages = Math.ceil(totalProducts / limit);

        // Verifica si la página solicitada es válida
        if (page > totalPages || page < 1) {
            // Redirigir a la página 404
            return res.status(404).render('404');
        }

         // Obtiene todos los carritos directamente aquí
         const carts = await Cart.find(); 

        // Si hay parámetros de consulta, devuelve los productos en JSON con el formato solilicitado del enunciado
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

        // Renderiza la vista de productos en caso contrario
        res.render('home', {
            products,
            totalProducts,
            prevLink,
            nextLink,
            page,
            totalPages: Math.ceil(totalProducts / limit),
            carts
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});


// Obtiene un producto por su ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductsById(req.params.pid);
        if (product) {
           
            res.render('productDetails', { product }); 
            console.log('Producto encontrado:', product);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Agrega un nuevo producto
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

// Actualiza un producto existente
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

// Elimina un producto por su ID
router.delete('/:pid', async (req, res) => {
    const productId = req.params.pid; // Obtiene el ID del producto

    // Verifica si el ID es un ObjectId válido (solo si se usa MongoDB)
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log(`ID inválido recibido: ${productId}`);
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
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
        res.status(204).end();
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el producto', error });
    }
});


// Establece el servidor de sockets
function setSocketServer(socketServer) {
    io = socketServer;
}

export { router, setSocketServer }; // Exporta usando ES Modules