const mongoose = require('mongoose');

// Define el esquema de stock
const stockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al ID del producto
    ref: 'Product', // Relación con el modelo de productos
    required: true, // Campo obligatorio
  },
  quantity: {
    type: Number, // Cantidad de producto en stock
    required: true, // Campo obligatorio
  },
  threshold: {
    type: Number, // Cantidad mínima para activar notificación
    required: true, // Campo obligatorio
  },
  lastUpdated: {
    type: Date, // Fecha de la última actualización
    default: Date.now, // Valor por defecto
  },
});

// Exporta el modelo de stock
module.exports = mongoose.model('Stock', stockSchema);



//COMENTARIOS
// Modelo de Stock: En el modelo de stock, incluimos un campo llamado productId. Este campo se usa para almacenar el ID del producto al que se refiere ese registro de stock.

// Vinculación: Cuando creamos un nuevo registro de stock, asignamos el ID del producto a productId. Esto significa que cada registro de stock está conectado a un producto específico.

// Funcionalidad: Al consultar el stock, podemos ver fácilmente cuántas unidades quedan de cada producto y enviar alertas si el stock está bajo.
