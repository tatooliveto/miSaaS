import React, { useEffect, useState } from 'react'; //importamos react, useEffect y useState para manejar el estado de los productos
import axios from 'axios'; //importamos axios para hacer peticiones a la API

const Dashboard = () => {
  const [products, setProducts] = useState([]); //la logica aqui seria que se obtengan los productos del backend y se seteen en el estado de los productos

  useEffect(() => {
    // Obtener productos desde el backend
    axios.get('http://localhost:3000/api/products')
      .then(response => setProducts(response.data)) //seteamos los productos en el estado
      .catch(error => console.log(error)); //manejamos el error
  }, []); //la logica aqui seria que se obtengan los productos del backend y se seteen en el estado de los productos

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {products.map(product => ( //mapeamos (es decir, recorremos) los productos y mostramos el nombre y el stock de cada producto en una lista
          <li key={product._id}>{product.name} - Stock: {product.stock}</li> //mostramos el nombre y el stock de cada producto en una lista
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
