import express from 'express'; // Importa express usando ES Modules
import cartManager from '../config/cartManager.js'; // Importa la instancia de cartManager
import __dirname from '../utils.js'; // Importar archivo utils que soluciona la creación del path

const router = express.Router();

// --------------------- Rutas para Carritos --------------------- //

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
        console.log('Agregando carro:', newCart);
    } catch (error) {
        console.error('Error al agregar carro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener todos los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.json(carts);
        console.log('Obteniendo carros:', carts);
    } catch (error) {
        console.error('Error al obtener carros:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartsById(req.params.cid);
        if (cart) {
            res.json(cart);
            console.log('Buscando carro por id:', cart);
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error('Error al buscar carro por id:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
        if (updatedCart) {
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
        console.log('Producto agregado al carrito exitosamente');
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;