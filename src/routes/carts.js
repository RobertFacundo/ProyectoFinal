import express from 'express'; // Importa express usando ES Modules
import cartManager from '../config/cartManager.js'; // Importa la instancia de cartManager
import __dirname from '../utils.js'; // Importar archivo utils que soluciona la creación del path

const router = express.Router();

// --------------------- Rutas para Carritos --------------------- //

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.redirect('/api/carts'); // Redirige a la lista de carritos
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
        console.log('Renderizando la vista de carros:');
        // Imprimir carritos de forma más legible
        carts.forEach(cart => {
            console.log('Carrito ID:', cart._id);
            console.log('Productos:', JSON.stringify(cart.products, null, 2)); // Mostrar productos con formato
        });
        res.render('carts', { carts });
    } catch (error) {
        console.error('Error al obtener carros:', error);
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


// Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.removeProductFromCart(cid, pid);
        if (updatedCart) {
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Carrito o producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const updatedCart = await cartManager.updateCart(cid, products);
        if (updatedCart) {
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar la cantidad de un producto específico en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
        if (updatedCart) {
            res.json(updatedCart);
        } else {
            res.status(404).json({ message: 'Carrito o producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar cantidad del producto en el carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// Obtener carrito por ID con los productos completos (usando populate)
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartWithProducts(req.params.cid);
        if (cart) {
            res.render('cartDetails', { cart });
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        console.error('Error al buscar carrito por id:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un carrito específico por ID
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        console.log(`Eliminando carrito con ID: ${cid}`);
        await cartManager.deleteCart(cid);
        res.redirect('/api/carts'); // Redirige a la lista de carritos después de eliminar
        console.log('Carrito eliminado con éxito');
    } catch (error) {
        console.error('Error al eliminar carrito:', error);
        res.status(500).render('error', { message: 'Error interno del servidor' });
    }
});

export default router;