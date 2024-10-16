import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String},
    price: { type: Number, required: true },
    thumbnail: { type: String },
    code: { type: String, required: true, unique: true },
    stock: { type: Number},
    category: {type: String, required: true}
});
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);


export default Product;