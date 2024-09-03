const express = require('express');
const CartManager = require('../managers/CartManager.js');

const router = express.Router();
const cartManager = new CartManager('./data/carts.json');

router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

router.get('/', async (req, res) => {
    const carts = await cartManager.getAllCarts();
    res.json(carts);
})

router.get('/:cid', async (req, res) => {
    const cart = await cartManager.getCartsById(req.params.cid);
    if (cart) {
        res.json(cart);
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
            res.status(404).json({ message: ' Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;