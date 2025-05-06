const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId : { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: Number,
  stock: Number,
  category: String,
  
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  items: [orderItemSchema],
  paymentMethod: { type: String, required: true },
  status: { type: String, required: true },
  totalAmount: { type: Number, default: 0 } // <-- agrega esto
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);