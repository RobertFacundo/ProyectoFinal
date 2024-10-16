import Cart from '../models/Cart.js'; // Importa el modelo de carrito
import mongoose from 'mongoose';

class CartManager {
    async getAllCarts() {
        try {
            const carts = await Cart.find(); // Usa Mongoose para encontrar todos los carritos
            return carts;
        } catch (error) {
            console.error('Error al obtener carritos:', error);
            return [];
        }
    }

    async getCartsById(id) {
        try {
            const cart = await Cart.findById(id); // Usa Mongoose para encontrar un carrito por ID
            return cart;
        } catch (error) {
            console.error('Error al obtener carrito:', error);
            return null;
        }
    }

    async createCart() {
        try {
            const newCart = new Cart(); // Crea una nueva instancia del modelo
            await newCart.save(); // Guarda el nuevo carrito en la base de datos
            return newCart;
        } catch (error) {
            console.error('Error al crear carrito:', error);
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            console.log(`Buscando el carrito con ID: ${cartId}`);
            const cart = await Cart.findById(cartId); // Busca el carrito por ID
    
            if (!cart) {
                console.log(`Carrito no encontrado con ID: ${cartId}`);
                return null; // Si no se encuentra el carrito, retorna null
            }
    
            console.log(`Carrito encontrado:`, cart);
            console.log(`Buscando el producto con ID: ${productId} en el carrito...`);
    
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId); // Busca el índice del producto en el carrito
    
            if (productIndex !== -1) {
                // Si el producto ya está en el carrito, aumentar la cantidad
                console.log(`Producto ya en el carrito. Incrementando cantidad. Cantidad actual: ${cart.products[productIndex].quantity}`);
                cart.products[productIndex].quantity += 1;
            } else {
                // Si el producto no está en el carrito, agregarlo con cantidad 1
                console.log(`Producto no encontrado en el carrito. Agregando nuevo producto con ID: ${productId}`);
                cart.products.push({ product: productId, quantity: 1 });
            }
    
            console.log(`Guardando cambios en el carrito...`);
            await cart.save(); // Guarda los cambios en el carrito
            console.log(`Carrito actualizado:`, cart); // Retorna el carrito actualizado
            return cart; // Retorna el carrito actualizado
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            return res.status(500).json({ message: 'No se pudo agregar el producto al carrito.' }); 
        }
    }

      // Nueva función para eliminar un carrito
      async deleteCart(cartId) {
        try {
            const result = await Cart.findByIdAndDelete(cartId); // Usa Mongoose para eliminar el carrito por ID
            return result; // Retorna el resultado de la eliminación
        } catch (error) {
            console.error('Error al eliminar carrito:', error);
            return null; // Manejo de error
        }
    }

    async getCartWithProducts(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product'); // Asegúrate de que la relación sea correcta
            console.log('Carrito con productos poblados:', JSON.stringify(cart, null, 2)); 
            return cart;
        } catch (error) {
            console.error('Error al obtener carrito con productos:', error);
            return null;
        }
    }
}

export default CartManager;