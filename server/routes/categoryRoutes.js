const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear una nueva categoría (si no existe)
router.post('/', async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' });
    // Evitar duplicados
    let category = await Category.findOne({ name });
    if (category) return res.status(409).json({ message: 'La categoría ya existe' });
    category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// (Opcional) Eliminar una categoría
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
