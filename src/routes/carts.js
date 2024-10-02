import express from 'express'; // Importa express usando ES Modules
import CartManager from '../managers/CartManager.js'; // Importa CartManager con 'import'
import path from 'path'; // Path es necesario para manejar rutas en ES modules
//importar archivo utils que soluciona la creacion del path
import __dirname from '../utils.js';

const router = express.Router();
const cartManager = new CartManager(path.join(__dirname, 'data/carts.json'));

router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
    console.log('Agregando carro:', newCart)
});

router.get('/', async (req, res) => {
    const carts = await cartManager.getAllCarts();
    res.json(carts);
    console.log('Obteniendo carros:', carts)
});

router.get('/:cid', async (req, res) => {
    const cart = await cartManager.getCartsById(req.params.cid);
    if (cart) {
        res.json(cart);
        console.log('Buscando carro por id:', cart)
    } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }
});

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
        if (updatedCart) {
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router; 