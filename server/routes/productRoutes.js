const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); //importar el modelo de productos


//ruta para obtener todos los productos

router.get('/', async(req, res) => {
    try {
        const products =  await Product.find();
        res.json(products)
         } 
    catch (error) {
        res.status(500).json({ message: error.message});
        
    };
});

//ruta para crear un producto
router.post('/', async (req, res) => {
    const product = new Product ({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct)
        
    } catch (error) {
        res.status(400).json({message: error.message})
        
    }
})


//ruta para obtener un producto especifico por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); //almacena en producto lo que encuentre buscando por ID (lo obtiene de los parametros que ingreso el user)
        if (!product) return res.status(404).json({ message: error.message})
        res.json(product)
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
});



//ruta para actualizar un producto 

router.put('/:id', async (req, res ) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado'});
        res.json(updatedProduct)

    } catch (error) {
        res.status(400).json({ message: error.message});

    }
});


router.delete('/:id', async(req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id)
        if(!deletedProduct) return res.status(404).json({ message: 'Producto no encontrado'})
            res.json({message: 'Producto eliminado'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})


module.exports = router;