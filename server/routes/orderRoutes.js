const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Crear un pedido
router.post('/', async (req, res) => {
  try {
    const { items, ...rest } = req.body;
    const totalAmount = (items || []).reduce(
      (sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0
    );
    const order = new Order({ ...rest, items, totalAmount });
    const savedOrder = await order.save();
    const populatedOrder = await savedOrder.populate('customerId', 'name email');
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  const { clientId } = req.query;
  let filter = {};
  if (clientId) filter.customerId = clientId;
  const orders = await Order.find(filter)
    .populate('customerId', 'name email') // Trae nombre y email del cliente
    .sort({ createdAt: -1 });
  res.json(orders);
});

// Actualizar un pedido
router.put('/:id', async (req, res) => {
  try {
    const { items, status, ...rest } = req.body;
    const totalAmount = (items || []).reduce(
      (sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0
    );

    // Busca el pedido anterior
    const prevOrder = await Order.findById(req.params.id);

    // Si antes no estaba completado y ahora sí, descuenta stock
    if (
      prevOrder.status !== 'Completado' &&
      (status === 'Completado' || status === 'completado')
    ) {
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { ...rest, items, status, totalAmount },
      { new: true }
    ).populate('customerId', 'name email');
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