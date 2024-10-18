import express from 'express'; // Importa express usando ES Modules
import cartManager from '../config/cartManager.js'; // Importa la instancia de cartManager
import __dirname from '../utils.js'; // Importa archivo utils que soluciona la creación del path

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

// Obtiene todos los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        console.log('Renderizando la vista de carros:');
        //Imprime cada cart
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

// Agregar producto al carrito desde herramientas como postman
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

//Ruta para agregar productos al carrito directamente desde la interfaz
router.post('/addProduct', async (req, res) => {
    try {
        const { cartId, productId } = req.body; // Obtiene cartId y productId del cuerpo de la solicitud
        const updatedCart = await cartManager.addProductToCart(cartId, productId);

        if (!updatedCart) {
            return res.status(404).json({ message: 'Carrito no encontrado.' });
        }
        console.log('Producto agregado exitosamente... redirigiendo al handlebars del carro seleccionado')

        res.redirect(`/api/carts/${cartId}`); // Redirige a la página principal o a donde prefieras
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'No se pudo agregar el producto al carrito.' });
    }
});


// Eliminar un producto específico del carrito desde herramientas como postman
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.removeProductFromCart(cid, pid);
        if (updatedCart) {
            res.redirect(`/api/carts/${cid}`); // Redirige a la vista de detalles del carrito
        } else {
            res.status(404).json({ message: 'Carrito o producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para eliminar productos del carrito directamente desde la interfaz
router.post('/deleteProduct', async (req, res) => {
    try {
        const { cartId, productId } = req.body; 
        const updatedCart = await cartManager.removeProductFromCart(cartId, productId);

        if (!updatedCart) {
            return res.status(404).json({ message: 'Carrito o producto no encontrado.' });
        }
        console.log('Producto eliminado exitosamente... redirigiendo al carrito seleccionado')

        res.redirect(`/api/carts/${cartId}`); 
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ message: 'No se pudo eliminar el producto del carrito.' });
    }
});

// Actualiza un carrito con un arreglo de productos
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

// Actualiza la cantidad de un producto específico en el carrito
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


// Obtiene carrito por ID con los productos completos (usando populate)
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

// Elimina un carrito específico por ID
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

// Ruta para vaciar el carrito
router.post('/emptyCart', async (req, res) => {
    try {
        const { cartId } = req.body; 
        const updatedCart = await cartManager.emptyCart(cartId);

        if (!updatedCart) {
            return res.status(404).json({ message: 'Carrito no encontrado.' });
        }
        console.log('Carrito vaciado exitosamente... redirigiendo al carrito seleccionado');

        res.redirect(`/api/carts/${cartId}`); 
    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        res.status(500).json({ message: 'No se pudo vaciar el carrito.' });
    }
});

export default router;