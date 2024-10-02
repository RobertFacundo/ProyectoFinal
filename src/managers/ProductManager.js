import fs from 'fs/promises'; // Importamos el módulo fs/promises
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class ProductManager {
    constructor(filePath) {
        this.filePath = path.resolve(filePath);
        this.init();
        console.log('Ruta del archivo de productos:!!', this.filePath);
    }

    async init() {
        try {
            // Verifica si el archivo existe
            await fs.access(this.filePath);
            console.log(`Ruta del archivo de productos: ${this.filePath} desde el init`);
        } catch (error) {
            console.error(`Error al acceder al archivo: ${error.message}`);
            // Si no existe, crear un archivo vacío
            await fs.writeFile(this.filePath, JSON.stringify([])); // Crear el archivo vacío
            console.log(`Archivo creado en: ${this.filePath}`);
        }
    }

    async getAllProducts() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8'); // Cambia fsPromises a fs
            const products = JSON.parse(data);

            if (products.length === 0) {
                console.log('Archivo encontrado y leído... sin productos');
            }

            return products;
        } catch (error) {
            console.error('Error al leer el archivo de productos:', error);
            return [];
        }
    }

    async getProductsById(id) {
        const products = await this.getAllProducts();
        return products.find(p => p.id === id);
    }

    async addProduct(product) {
        console.log('Intentando agregar producto:', product);
        try {
            const products = await this.getAllProducts();
            const newProduct = {
                id: uuidv4(),
                ...product
            };
            products.push(newProduct);
            await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
            console.log('Producto agregado satisfactoriamente:', newProduct);
            return newProduct;
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    }

    async updatedProduct(id, updatedData) {
        try {
            console.log('Actualizando producto')
            const products = await this.getAllProducts();
            const productIndex = products.findIndex(p => p.id === id);

            // Verifica si el producto no se encontró
            if (productIndex === -1) {
                console.log('Producto no encontrado'); // O puedes lanzar un error
                return null;
            }
            console.log('Actualizando producto')
            // Actualiza el producto
            products[productIndex] = { ...products[productIndex], ...updatedData };
            await fs.writeFile(this.filePath, JSON.stringify(products, null, 2)); // Cambia fsPromises a fs
            console.log('Producto actualizado:', products[productIndex]);

            return products[productIndex];
        } catch (error) {
            console.error('Error al actualizar el producto:', error); // Maneja el error
            throw new Error('No se pudo actualizar el producto'); // Lanza un error para manejarlo más arriba en la pila de llamadas, si es necesario
        }
    }

    async deleteProduct(id) {
        console.log(`Eliminando producto ${id} desde la pestaña realtimeproducts...`)
        const products = await this.getAllProducts();
        const updatedProducts = products.filter(p => p.id !== id);
        await fs.writeFile(this.filePath, JSON.stringify(updatedProducts, null, 2)); // Cambia fsPromises a fs
        console.log('Producto eliminado !');
    }
}

export default ProductManager;