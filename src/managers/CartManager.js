const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class CartManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async getAllCarts() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf-8');
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
        await fs.promises.writeFile(this.filePath, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getAllCarts();
        const cart = carts.find(c => c.id === cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(p => p.product === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await fs.promises.writeFile(this.filePath, JSON.stringify(carts, null, 2));
        return cart;
    }
}

module.exports = CartManager;