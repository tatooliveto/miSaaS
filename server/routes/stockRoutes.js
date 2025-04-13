const express = require('express');
const router = express.Router();
const Stock = require('../models/stockModel');

// Crear stock
router.post('/', async (req, res) => {
  // Crea un nuevo registro de stock
  try {
    const newStock = new Stock(req.body); // Crea nueva instancia con los datos del cuerpo
    await newStock.save(); // Guarda en la base de datos
    res.status(201).json(newStock); // Responde con el stock creado
  } catch (error) {
    res.status(400).json({ message: error.message }); // Responde con error
  }
});

// Obtener todos los stocks
router.get('/', async (req, res) => {
  // Obtiene todos los registros de stock
  try {
    const stocks = await Stock.find(); // Busca todos los stocks
    res.status(200).json(stocks); // Responde con la lista de stocks
  } catch (error) {
    res.status(500).json({ message: error.message }); // Responde con error
  }
});

// stockRoutes.js - en la ruta de actualización de stock

router.put('/:id', async (req, res) => {
  try {
      const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedStock) return res.status(404).json({ message: 'Stock no encontrado' });

      // Comprobar si la cantidad es menor al threshold
      if (updatedStock.quantity <= updatedStock.threshold) {
          // Aquí podrías enviar una notificación por email o SMS
          console.log("Alerta: El stock está bajo para el producto:", updatedStock.productId);
      }

      res.json(updatedStock);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});


// Eliminar stock
router.delete('/:id', async (req, res) => {
  // Elimina un registro de stock por ID
  try {
    await Stock.findByIdAndDelete(req.params.id); // Elimina el stock
    res.status(204).send(); // Responde sin contenido
  } catch (error) {
    res.status(500).json({ message: error.message }); // Responde con error
  }
});

// Exporta las rutas de stock
module.exports = router;



// Resumen de la funcionalidad de stock y alertas:

// En esta parte del proyecto, estamos implementando la gestión del stock de productos. Cada vez que se crea o actualiza un registro de stock, el sistema verifica la cantidad disponible y compara si ha caído por debajo de un umbral predefinido (campo threshold). Si el stock está bajo, se activa una alerta, que podría ser notificación por correo o SMS al dueño del negocio. Además, estamos relacionando el stock directamente con los productos mediante el campo productId, para que el inventario esté siempre actualizado según las ventas y cambios en los pedidos.

// //Explicación básica para el dueño de un negocio:

// Estamos creando un sistema que te ayuda a gestionar tu inventario. Cada vez que vendes un producto, el sistema ajusta automáticamente la cantidad de stock. Si la cantidad baja de un nivel que tú decides, recibirás una alerta para que sepas cuándo es hora de reabastecer. Esto evita que te quedes sin productos sin darte cuenta y te ayuda a estar siempre al tanto de tu inventario sin necesidad de hacer cálculos manuales.