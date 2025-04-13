import React, { useState, useEffect } from 'react';


const Orders = () => {
  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    paymentMethod: "efectivo"
  });

  // Obtener pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Manejar cambios en los ítems
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...newOrder.items];
    updatedItems[index][name] = name === 'quantity' || name === 'price' ? Number(value) : value;
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  // Agregar nuevo ítem
  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: "", quantity: 1, price: 0 }]
    });
  };

  // Crear pedido (SIMPLIFICADO - sin productId)
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    // Validación
    if (newOrder.items.some(item => !item.name || isNaN(item.price) || isNaN(item.quantity))) {
      alert("¡Completa todos los campos correctamente!");
      return;
    }

    try {
      const totalAmount = newOrder.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newOrder.customerName,
          items: newOrder.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount,
          paymentMethod: newOrder.paymentMethod
        })
      });

      const data = await response.json();
      setOrders([...orders, data]);
      
      // Resetear formulario
      setNewOrder({
        customerName: "",
        items: [{ name: "", quantity: 1, price: 0 }],
        paymentMethod: "efectivo"
      });

    } catch (err) {
      console.error("Error:", err);
      alert("Error al crear el pedido");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="orders-container">
      {/* Formulario */}
      <form onSubmit={handleCreateOrder}>
        <h2>Nuevo Pedido</h2>
        
        <label>Cliente:</label>
        <input
          type="text"
          value={newOrder.customerName}
          onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
          required
        />

        <h3>Productos:</h3>
        {newOrder.items.map((item, index) => (
          <div key={index} className="item-group">
            <input
              type="text"
              placeholder="Nombre"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              name="name"
              required
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              name="quantity"
              min="1"
              required
            />
            <input
              type="number"
              placeholder="Precio"
              value={item.price}
              onChange={(e) => handleItemChange(index, e)}
              name="price"
              min="0"
              step="0.01"
              required
            />
          </div>
        ))}
        <button type="button" onClick={addItem}>+ Agregar producto</button>

        <label>Método de pago:</label>
        <select
          value={newOrder.paymentMethod}
          onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})}
        >
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>

        <button type="submit">Crear Pedido</button>
      </form>

      {/* Tabla */}
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.customerName}</td>
              <td>
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    {item.name} (x{item.quantity}) 
                    {/* ${item.price} */} 
                  </div>
                ))}
              </td>
              <td>${order.totalAmount}</td>
              <td>{new Date(order.date).toLocaleDateString('es-ES')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;