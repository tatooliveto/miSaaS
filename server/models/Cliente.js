const mongoose = require('mongoose');

// Definir el esquema del cliente
const clienteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  preferredContactMethod: { type: String, enum: ['email', 'phone'], required: true },
  purchaseHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true }
  }],
}, { timestamps: true });

// Crear el modelo Cliente basado en el esquema
const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;
