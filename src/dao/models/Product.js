import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String},
    price: { type: Number, required: true },
    thumbnail: { type: String },
    code: { type: String, unique: true },
    stock: { type: Number},
});

const Product = mongoose.model('Product', productSchema);

export default Product;