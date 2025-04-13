## 🛠️ Proyecto SaaS – Backend

Este proyecto es un backend para un sistema SaaS de gestión de productos, clientes, stock, pedidos y pagos. Utiliza **Node.js**, **Express** y **MongoDB**.

---

### 📁 Estructura de carpetas principal


server/
│
├── config/               # Configuraciones (por definir o futuras)
├── dashboard/            # Rutas para métricas o visualizaciones del sistema
├── models/               # Esquemas de Mongoose
├── routes/               # Endpoints del backend
│   ├── clientRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── productRoutes.js
│   └── stockRoutes.js
├── utils/                # Funciones auxiliares
├── .env                  # Variables de entorno (no subir)
├── db.js                 # Conexión a MongoDB
├── index.js              # Archivo principal del servidor
└── testMercadoPago.js    # Script de prueba para pagos

 
---

### 🚀 Cómo levantar el proyecto

1. Clonar el repositorio
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Levantar el servidor:
   ```bash
   npm start
   ```

---

### 📚 Documentación

- [Documentación de Mongoose](https://mongoosejs.com/docs/api/connection.html)
- [Documentación de Express](https://expressjs.com/es/)
- [Documentación de Node.js](https://nodejs.org/es/docs/)

### 🌐 Rutas disponibles

| Método | Ruta             | Descripción                     |
|--------|------------------|---------------------------------|
| GET    | `/`              | Ruta de prueba (servidor on)    |
| -      | `/api/orders`    | Rutas relacionadas a pedidos    |
| -      | `/api/products`  | Gestión de productos            |
| -      | `/api/clients`   | Gestión de clientes             |
| -      | `/api/stocks`    | Manejo de stock                 |
| -      | `/api/dashboard` | Rutas para métricas             |
| -      | `/api/payments`  | Pagos (MercadoPago)             |


🧠 Tecnologías utilizadas
Node.js

Express

MongoDB + Mongoose

CORS

MercadoPago (test en progreso)

