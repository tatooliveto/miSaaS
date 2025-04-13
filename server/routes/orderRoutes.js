const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Crear pedido (SIMPLIFICADO)
router.post('/', async (req, res) => {
  const { customerName, items, paymentMethod } = req.body;

  // Validación básica
  if (!customerName || !items || !paymentMethod) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    // Calcular total
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    const newOrder = new Order({
      customerName,
      items,
      totalAmount,
      paymentMethod,
      status: "pendiente"
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;