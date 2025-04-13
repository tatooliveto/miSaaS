const express = require('express'); 
const app = express();
const Order = require('./models/Order');
const orderRoutes = require('./routes/orderRoutes');
const connectDB = require('./db');
const productRoutes = require('./routes/productRoutes') //importamos las rutas de productos
const clientRoutes = require('./routes/clientRoutes')
const stockRoutes = require('./routes/stockRoutes')
const dashboardRoutes = require('./dashboard/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes')
const cors = require('cors');




connectDB(); // Esto conecta a la base de datos


// Middleware para procesar JSON
app.use(express.json());

app.use(cors()); //permite que el servidor se comunique con el frontend 

// Usar las rutas de pedidos
app.use('/api/orders', orderRoutes);


//ruta de productos
app.use('/api/products', productRoutes);

//ruta de clientes
app.use('/api/clients', clientRoutes);

// Ruta de stock
app.use('/api/stocks', stockRoutes);


//ruta de dashboard

app.use('/api/dashboard', dashboardRoutes);


//ruta de pago (mercado pago)
app.use('/api/payments', paymentRoutes);







//ruta de prueba

app.get('/', (req, res) => {
    res.send('servidor on')
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

