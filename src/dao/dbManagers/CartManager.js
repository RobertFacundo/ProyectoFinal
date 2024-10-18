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
            const result = await Cart.findByIdAndDelete(cartId); 
            return result;
        } catch (error) {
            console.error('Error al eliminar carrito:', error);
            return null; 
        }
    }

    async getCartWithProducts(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product'); 
            console.log('Carrito con productos poblados:', JSON.stringify(cart, null, 2));
            return cart;
        } catch (error) {
            console.error('Error al obtener carrito con productos:', error);
            return null;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);

            if (!cart) {
                return null; // Si no se encuentra el carrito, retorna null
            }

            // Encuentra el producto en el carrito y reduce cantidad o lo elimina completamente
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

            if (productIndex !== -1) {
                if (cart.products[productIndex].quantity > 1) {
                    cart.products[productIndex].quantity -= 1;
                } else {
                    cart.products.splice(productIndex, 1);
                }
            }

            await cart.save(); // Guarda los cambios en el carrito
            return cart;
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            return null;
        }
    }

    async emptyCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            
            if (!cart) {
                return null; 
            }
    
            cart.products = [];
            
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
            return null;
        }
    }
}

export default CartManager;