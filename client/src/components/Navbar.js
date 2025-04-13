import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Archivo para estilos

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">SaaS Manager</div>
      <ul className="navbar-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/products">Productos</Link></li>
        <li><Link to="/clients">Clientes</Link></li>
        <li><Link to="/orders">Pedidos</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
