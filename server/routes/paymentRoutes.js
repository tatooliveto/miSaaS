const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadoPagoConfig'); // Configuración de Mercado Pago


router.post('/create-preference', async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: req.body.title,
          unit_price: req.body.price,
          quantity: req.body.quantity,
        },
      ],
      back_urls: {
        success: "http://localhost:3000/success",
        failure: "http://localhost:3000/failure",
        pending: "http://localhost:3000/pending",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.Preference(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error('Error al crear preferencia:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; // Exporta el router


// Explicación del Código
// items: Define el producto o servicio que se está vendiendo.
// back_urls: URLs de redirección tras el pago (simples por ahora).
// auto_return: Automáticamente regresa al usuario cuando el pago es aprobado.
// mercadopago.preferences.create: Genera la preferencia de pago y devuelve un enlace para el cliente.