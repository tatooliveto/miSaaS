const mongoose = require('mongoose');

// Definir el esquema del cliente
const clienteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    postalCode: String
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
