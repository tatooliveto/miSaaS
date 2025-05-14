import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Modal, ListGroup, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
const API = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [stats, setStats] = useState({
    clientes: 0,
    productos: 0,
    pedidos: 0,
    totalVendido: 0,
    ultimosPedidos: [],
    allPedidos: [],
    allProductos: [],
  });
  const [showDetail, setShowDetail] = useState(null); // 'clientes', 'productos', 'pedidos', 'total'
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [clientes, productos, pedidos] = await Promise.all([
        axios.get(`${API}/clients`),
        axios.get(`${API}/products`),        
        axios.get(`${API}/orders`),
      ]);
      const totalVendido = pedidos.data
        .filter(p => p.status === 'Completado' || p.status === 'completado')
        .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

      setStats({
        clientes: clientes.data.length,
        productos: productos.data.length,
        pedidos: pedidos.data.length,
        totalVendido,
        ultimosPedidos: pedidos.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
        allPedidos: pedidos.data,
        allProductos: productos.data,
      });

      // Productos con poco stock
      setLowStock(productos.data.filter(p => p.stock <= 5));
    };
    fetchStats();
  }, []);

  // Top clientes por total gastado
  const getTopClientes = (pedidos, limit) => {
    const clientes = pedidos.reduce((acc, p) => {
      const cliente = p.customerId?.name || 'Sin especificar';
      acc[cliente] = (acc[cliente] || 0) + p.totalAmount;
      return acc;
    }, {});
    return Object.entries(clientes)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  };

  // Top productos por cantidad vendida
  const getTopProductos = (pedidos, limit) => {
    const productos = pedidos.reduce((acc, p) => {
      (p.items || []).forEach(item => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {});
    return Object.entries(productos)
      .map(([name, cantidad]) => ({ name, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limit);
  };

  // Detalle de ventas (qué productos suman el total vendido)
  const getDetalleVentas = pedidos =>
    pedidos
      .filter(p => p.status === 'Completado' || p.status === 'completado')
      .map(p => ({
        cliente: p.customerId?.name || 'Sin especificar',
        total: p.totalAmount,
        productos: (p.items || []).map(item => item.name).join(', '),
      }));

  // Acceso rápido (puedes cambiar las rutas según tu router)
  const goTo = path => window.location.href = path;

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>

      {/* Acceso rápido */}
      <div className="mb-3 d-flex gap-2">
        <Button variant="success" onClick={() => goTo('/orders')}>+ Nuevo Pedido</Button>
        <Button variant="primary" onClick={() => goTo('/clients')}>+ Nuevo Cliente</Button>
        <Button variant="warning" onClick={() => goTo('/products')}>+ Nuevo Producto</Button>
      </div>

      {/* Alerta de bajo stock */}
      {lowStock.length > 0 && (
        <Alert variant="warning">
          <b>¡Atención!</b> Los siguientes productos tienen poco stock:
          <ul style={{ marginBottom: 0 }}>
            {lowStock.map(p => (
              <li key={p._id}>{p.name} (Stock: {p.stock})</li>
            ))}
          </ul>
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Card body style={{ cursor: 'pointer' }} onClick={() => setShowDetail('clientes')}>
            Clientes: <b>{stats.clientes}</b>
          </Card>
        </Col>
        <Col>
          <Card body style={{ cursor: 'pointer' }} onClick={() => setShowDetail('productos')}>
            Productos: <b>{stats.productos}</b>
          </Card>
        </Col>
        <Col>
          <Card body style={{ cursor: 'pointer' }} onClick={() => setShowDetail('pedidos')}>
            Pedidos: <b>{stats.pedidos}</b>
          </Card>
        </Col>
        <Col>
          <Card body style={{ cursor: 'pointer' }} onClick={() => setShowDetail('total')}>
            Total vendido: <b>${stats.totalVendido}</b>
          </Card>
        </Col>
      </Row>

      <h4>Últimos pedidos</h4>
      <Table striped bordered>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {stats.ultimosPedidos.map(p => (
            <tr key={p._id}>
              <td>{p.customerId?.name || 'Sin especificar'}</td>
              <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
              <td>${p.totalAmount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de detalles */}
      <Modal show={!!showDetail} onHide={() => setShowDetail(null)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {showDetail === 'clientes' && 'Top clientes'}
            {showDetail === 'productos' && 'Productos más vendidos'}
            {showDetail === 'pedidos' && 'Productos más pedidos'}
            {showDetail === 'total' && 'Detalle de ventas'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showDetail === 'clientes' && (
            <ListGroup>
              {getTopClientes(stats.allPedidos, 5).map((c, i) => (
                <ListGroup.Item key={i}>
                  {c.name} — <b>${c.total}</b>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {showDetail === 'productos' && (
            <ListGroup>
              {getTopProductos(stats.allPedidos, 5).map((p, i) => (
                <ListGroup.Item key={i}>
                  {p.name} — <b>{p.cantidad}</b> vendidos
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {showDetail === 'pedidos' && (
            <ListGroup>
              {getTopProductos(stats.allPedidos, 5).map((p, i) => (
                <ListGroup.Item key={i}>
                  {p.name} — <b>{p.cantidad}</b> pedidos
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {showDetail === 'total' && (
            <ListGroup>
              {getDetalleVentas(stats.allPedidos).map((v, i) => (
                <ListGroup.Item key={i}>
                  {v.cliente} — <b>${v.total}</b> — {v.productos}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
