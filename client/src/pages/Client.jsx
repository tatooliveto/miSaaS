import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const emptyClient = { name: '', email: '', phone: '', address: {}, preferredContactMethod: '' };
const API = process.env.REACT_APP_API_URL;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState(emptyClient);
  const [editingId, setEditingId] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  // Obtener clientes
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const res = await axios.get(`${API}/clients`);
    setClients(res.data);
  };

  const handleShow = (client = emptyClient) => {
    setCurrent(client);
    setEditingId(client._id || null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrent(emptyClient);
    setEditingId(null);
  };

  const handleChange = e => {
    setCurrent({ ...current, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Validación de campos obligatorios
    if (!current.name || !current.phone || !current.preferredContactMethod) {
      setAlertMsg('Por favor, completa nombre, teléfono y método de contacto preferido.');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API}/clients/${editingId}`, current);
      } else {
        await axios.post(`${API}/clients`, current);
      }
      fetchClients();
      handleClose();
      setAlertMsg(null);
    } catch (error) {
      setAlertMsg('Error al guardar el cliente. Asegúrate de que los datos requeridos esten completos.');
    }
  };

  const handleDelete = async id => {
    if (window.confirm('¿Eliminar cliente?')) {
      await axios.delete(`${API}/clients/${id}`);
      fetchClients();
    }
  };

  const handleShowOrders = async (client) => {
    setSelectedClient(client);
    const res = await axios.get(`${API}/orders?clientId=${client._id}`);
    setOrders(res.data);
    setShowOrdersModal(true);
  };

  return (
    <div className="container mt-4">
      <h2>Clientes</h2>
      <Button className="mb-3" onClick={() => handleShow()}>+ Nuevo Cliente</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client._id}>
              <td>
                <Button variant="link" onClick={() => handleShowOrders(client)}>
                  {client.name}
                </Button>
              </td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>
                {typeof client.address === 'object' && client.address !== null
                  ? `${client.address.street || ''}, ${client.address.city || ''}, ${client.address.postalCode || ''}`
                  : client.address || ''}
              </td>
              <td>
                <Button size="sm" variant="primary" className="me-2" onClick={() => handleShow(client)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(client._id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertMsg && (
            <Alert variant="danger" onClose={() => setAlertMsg(null)} dismissible>
              {alertMsg}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="name"
                value={current.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email (opcional)</Form.Label>
              <Form.Control
                name="email"
                value={current.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                name="phone"
                value={current.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Ciudad</Form.Label>
              <Form.Control
                name="city"
                value={current.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Método de contacto preferido</Form.Label>
              <Form.Select
                name="preferredContactMethod"
                value={current.preferredContactMethod || ''}
                onChange={e => setCurrent({ ...current, preferredContactMethod: e.target.value })}
                required
              >
                <option value="">Seleccionar</option>
                <option value="email">Email</option>
                <option value="phone">Teléfono</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showOrdersModal} onHide={() => setShowOrdersModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Pedidos de {selectedClient?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <div style={{ marginBottom: 16 }}>
              <h4>Datos del cliente</h4>
              <div><strong>Nombre:</strong> {selectedClient.name}</div>
              <div><strong>Email:</strong> {selectedClient.email}</div>
              <div><strong>Teléfono:</strong> {selectedClient.phone}</div>
              <div>
                <strong>Dirección:</strong>{' '}
                {selectedClient.address
                  ? `${selectedClient.address.street || ''}, ${selectedClient.address.city || ''}, ${selectedClient.address.postalCode || ''}`
                  : ''}
              </div>
              <div><strong>Contacto preferido:</strong> {selectedClient.preferredContactMethod}</div>
            </div>
          )}
          {orders.length === 0 ? (
            <div>No hay pedidos para este cliente.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {orders.map(order => (
                <div
                  key={order._id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: 16,
                    minWidth: 300,
                    boxShadow: '0 2px 8px #0001',
                    background: '#fff'
                  }}
                >
                  <h5>
                    Pedido del {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha'}
                  </h5>
                  <div>
                    <strong>Estado:</strong>{' '}
                    {order.status === 'Completado' || order.status === 'completado' ? (
                      <span style={{ color: 'green' }}>✔️ Completado</span>
                    ) : (
                      <span style={{ color: 'orange' }}>⏳ Pendiente</span>
                    )}
                  </div>
                  <div>
                    <strong>Total:</strong> ${order.totalAmount}
                  </div>
                  <div>
                    <strong>Productos:</strong>
                    <ul style={{ marginBottom: 0 }}>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} - {item.quantity} x ${item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Método de pago:</strong> {order.paymentMethod}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Clients;
