const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async getAllProducts() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async getProductsById(id) {
        try {
            const products = await this.getAllProducts();
            const product = products.find(p => p.id === id);
            return product || null;
        } catch (error) {
            console.error('Error al obtener el producto por ID:', error);
            return null;
        }
    }

    async addProduct({ title, description, code, price, status, stock, category, thumbnails }) {
        const products = await this.getAllProducts();
        const newProduct = {
            id: uuidv4(),
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        }
        products.push(newProduct);
        await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async updatedProduct(id, updatedFields) {
        const products = await this.getAllProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;

        products[index] = { ...products[index], ...updatedFields };
        await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
        return products[index];
    }

    async deleteProduct(id) {
        let products = await this.getAllProducts();
        const productoAEliminar = products.find(p => p.id === id);
        if (!productoAEliminar) {
            return null;
        }
        products = products.filter(p => p.id !== id);
        await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));

        return productoAEliminar;
    }
}

module.exports = ProductManager;