const fs = require('fs'); // Requiere el módulo 'fs' para manejar la lectura y escritura de archivos.
const { v4: uuidv4 } = require('uuid'); // Requiere la librería 'uuid' para generar identificadores únicos.

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath; // Guarda la ruta del archivo JSON donde se almacenan los productos.
    }


    // Método para obtener todos los productos.
    async getAllProducts() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf-8'); // Lee el archivo de productos.
            return JSON.parse(data); // Convierte el contenido del archivo en un objeto JSON.
        } catch (error) {
            return [];
        }
    }

    // Método para obtener un producto por su ID.
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

    // Método para agregar un nuevo producto.
    async addProduct({ title, description = '', code = '', price, status = true, stock = 0, category = '', thumbnails = [] }) {
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


    // Método para actualizar un producto existente.
    async updatedProduct(id, updatedFields) {
        const products = await this.getAllProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;

        products[index] = { ...products[index], ...updatedFields };
        await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
        return products[index];
    }

    // Método para eliminar un producto por su ID.
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