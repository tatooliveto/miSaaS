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

// Actualizar un pedido
router.put('/:id', async (req, res) => {
  try {
    const { customerName, items, paymentMethod, status } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Obtener el pedido anterior para comparar el status
    const prevOrder = await Order.findById(req.params.id);
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { customerName, items, paymentMethod, status, totalAmount },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Si el status cambió a 'completado' y antes no lo estaba, descuenta stock
    if (prevOrder && prevOrder.status !== 'completado' && status === 'completado') {
      for (const item of items) {
        // Busca el producto por nombre (o deberías usar productId si lo tienes)
        const product = await Product.findOne({ name: item.name });
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un pedido
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json({ message: 'Pedido eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;