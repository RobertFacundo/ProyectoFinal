import Product from '../models/Product.js'; // Importa el modelo de producto
import mongoose from 'mongoose';

class ProductManager {

    async getAllProducts() {
        try {
            const products = await Product.find().lean(); // Usa Mongoose para encontrar todos los productos
            console.log('Productos encontrados desde mongoDB:', products);
            return products;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    }

    async getProductsById(id) {
        try {
            const product = await Product.findById(id).lean(); // Usa Mongoose para encontrar un producto por ID
            console.log('Producto encontrado desde mongoDB:', product);
            return product;
        } catch (error) {
            console.error('Error al obtener producto:', error);
            return null;
        }
    }

    async addProduct(productData) {
        try {
            const newProduct = new Product(productData); // Crea una nueva instancia del modelo
            await newProduct.save(); // Guarda el nuevo producto en la base de datos
            console.log('Producto agregado desde MongoDb:', newProduct);
            return newProduct;
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    }

    async updatedProduct(id, updatedData) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true }).lean(); // Actualiza el producto y retorna el nuevo
            console.log('Producto actualizado desde MongoDb:', updatedProduct);
            return updatedProduct;
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            throw new Error('No se pudo actualizar el producto');
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id).lean(); // Elimina y obtiene el producto por ID
            if (deletedProduct) {
                console.log('Producto a eliminar encontrado en MongoDb:', deletedProduct);
                return deletedProduct; // Retorna el producto eliminado
            } else {
                console.log('Producto no encontrado en la base de datos.');
                return null;
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            throw error;
        }
    }
}

export default ProductManager;