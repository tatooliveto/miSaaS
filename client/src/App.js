import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Products from './pages/Product';
import Clients from './pages/Client';
import Orders from './pages/Order';
import Login from './pages/Login';
import MainNavbar from './components/Navbar';

const AppRoutes = ({ user, setUser }) => {
  const location = useLocation();
  const logged = !!user;

  return (
    <>
      {/* Solo muestra el navbar si NO estamos en /login y el usuario está autenticado */}
      {logged && location.pathname !== '/login' && <MainNavbar user={user} setUser={setUser} />}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="colored" />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/" element={logged ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/products" element={logged ? <Products /> : <Navigate to="/login" />} />
        <Route path="/clients" element={logged ? <Clients /> : <Navigate to="/login" />} />
        <Route path="/orders" element={logged ? <Orders /> : <Navigate to="/login" />} />
        {/* Ruta catch-all para redirigir a login si no hay match */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    // Escucha cambios en localStorage (por ejemplo, después del login)
    const onStorage = () => {
      const u = localStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} />
    </Router>
  );
};

export default App;





