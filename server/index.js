require('dotenv').config();
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
const categoryRoutes = require('./routes/categoryRoutes');
const cors = require('cors');
const passport = require('passport');
require('./passport'); // Asegúrate de que la ruta sea correcta

const session = require('express-session');

connectDB(); // Esto conecta a la base de datos

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

// Middleware para procesar JSON
app.use(express.json());

app.use(cors()); //permite que el servidor se comunique con el frontend 


app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

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

// Ruta de categorías
app.use('/api/categories', categoryRoutes);

// Ruta de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

//ruta de prueba
app.get('/', (req, res) => {
    res.send('servidor on')
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

