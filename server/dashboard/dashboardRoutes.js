const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Modelo de Producto
const Order = require('../models/Order'); // Importa el modelo de pedidos

// Ruta para obtener el inventario de productos y resaltar bajo stock
router.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find(); // Consulta todos los productos

    // Filtrar productos con stock bajo
    const lowStockProducts = products.filter(product => product.stock <= product.threshold);

    res.json({
      products,            // Todos los productos
      lowStock: lowStockProducts, // Productos con stock bajo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





// Ruta para obtener pedidos recientes
router.get('/recent-orders', async (req, res) => {
  try {
    // Consulta los pedidos, ordenados por fecha (recientes primero)
    const recentOrders = await Order.find()
      .sort({ date: -1 }) // Orden descendente (más recientes)
      .limit(10)           // Limita a los 10 últimos pedidos

      .populate('items.productId', 'name price'); // Trae detalles del producto

    res.json(recentOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const Client = require('../models/Cliente'); // Importar el modelo de clientes

// Ruta para obtener los clientes activos o recientes
router.get('/active-clients', async (req, res) => {
  try {
    const recentClients = await Client.find() 
      .sort({ dateAdded: -1 }) // Orden descendente por fecha de registro
      .limit(10);               // Limita a los 10 más recientes

    res.json(recentClients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




module.exports = router;
