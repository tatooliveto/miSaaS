const express = require('express'); // Importa el módulo Express
const router = express.Router(); // Crea un router de Express
const Client = require('../models/Cliente'); // Importa el modelo Client

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    const newClient = new Client(req.body); // Crea una nueva instancia de Client con los datos del cuerpo de la solicitud
    await newClient.save(); // Guarda el nuevo cliente en la base de datos
    res.status(201).json(newClient); // Responde con el cliente creado y código 201 (Creado)
  } catch (error) {
    res.status(400).json({ message: error.message }); // Responde con un error si falla la creación
  }
});

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find(); // Busca todos los clientes en la base de datos
    res.status(200).json(clients); // Responde con la lista de clientes y código 200 (OK)
  } catch (error) {
    res.status(500).json({ message: error.message }); // Responde con un error si falla la búsqueda
  }
});

// Actualizar un cliente
router.put('/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Actualiza el cliente por ID y devuelve el nuevo objeto
    res.status(200).json(updatedClient); // Responde con el cliente actualizado y código 200 (OK)
  } catch (error) {
    res.status(400).json({ message: error.message }); // Responde con un error si falla la actualización
  }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id); // Elimina el cliente por ID
    res.status(204).send(); // Responde con código 204 (Sin contenido)
  } catch (error) {
    res.status(500).json({ message: error.message }); // Responde con un error si falla la eliminación
  }
});

module.exports = router; // Exporta el router para usarlo en otras partes de la aplicación
