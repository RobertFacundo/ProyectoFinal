import { promises as fs } from 'fs'; // Importa el módulo 'fs' para manejar la lectura y escritura de archivos.
import { v4 as uuidv4 } from 'uuid'; // Importa la librería 'uuid' para generar identificadores únicos.

class CartManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async getAllCarts() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            console.log('Carts data read from file:', data); //
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading carts file:', error);
            return [];
        }
    }

    async getCartsById(id) {
        const carts = await this.getAllCarts();
        return carts.find(c => c.id === id);
    }

    async createCart() {
        const carts = await this.getAllCarts();
        const newCart = {
            id: uuidv4(),
            products: []
        };
        carts.push(newCart);
        await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async addProductToCart(cartId, productId) {
        try {
            const carts = await this.getAllCarts(); // Obtener todos los carritos
            const cart = carts.find(c => c.id === cartId); // Buscar el carrito por su ID

            if (!cart) return null; // Si no se encuentra el carrito, retorna null
            console.log('Carro encontrado:', cart)

            const productIndex = cart.products.findIndex(p => p.product === productId); // Buscar el índice del producto en el carrito

            if (productIndex !== -1) {
                // Si el producto ya está en el carrito, aumentar la cantidad
                cart.products[productIndex].quantity += 1;
            } else {
                // Si el producto no está en el carrito, agregarlo con cantidad 1
                cart.products.push({ product: productId, quantity: 1 });
                console.log('Producto agregado al carrito correctamente')
            }

            await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2)); // Escribir los carritos actualizados en el archivo
            return cart; // Retornar el carrito actualizado
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error); // Registrar el error en la consola
            throw new Error('No se pudo agregar el producto al carrito.'); // Lanzar un error personalizado
        }
    }
}

export default CartManager;