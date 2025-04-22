import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Form, 
  Modal,
  Row,
  Col,
  Spinner,
  Alert
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import './Order.css'; // Para estilos personalizados

const Orders = () => {
  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusOptions] = useState(['pendiente', 'completado']);
  const [alertMsg, setAlertMsg] = useState(null);

  // Helpers para productos dinámicos
  const emptyProduct = { name: '', quantity: 1, price: 0 };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
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

  // Handlers
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar pedido?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      setOrders(orders.filter(order => order._id !== id));
      toast.success('Pedido eliminado correctamente');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProductChange = (idx, field, value) => {
    const updatedProducts = [...(currentOrder?.items || [])];
    updatedProducts[idx][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
    setCurrentOrder({ ...currentOrder, items: updatedProducts });
  };

  const handleAddProduct = () => {
    setCurrentOrder({
      ...currentOrder,
      items: [...(currentOrder?.items || []), { ...emptyProduct }],
    });
  };

  const handleRemoveProduct = (idx) => {
    const updatedProducts = [...(currentOrder?.items || [])];
    updatedProducts.splice(idx, 1);
    setCurrentOrder({ ...currentOrder, items: updatedProducts });
  };

  const handleSave = async () => {
    try {
      // Transformar los datos del modal al formato que espera el backend
      const orderToSend = {
        customerName: currentOrder?.customerName || '',
        items: currentOrder?.items || [],
        paymentMethod: currentOrder?.paymentMethod || 'efectivo',
        status: currentOrder?.status || 'pendiente',
      };
      const method = currentOrder?.id ? 'PUT' : 'POST';
      const url = currentOrder?.id 
        ? `http://localhost:5000/api/orders/${currentOrder.id}`
        : 'http://localhost:5000/api/orders';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderToSend),
      });
      if (!response.ok) throw new Error('Error al guardar');
      const updatedOrder = await response.json();
      setOrders(currentOrder?.id
        ? orders.map(o => o._id === updatedOrder._id ? updatedOrder : o)
        : [...orders, updatedOrder]);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Helpers
  const formatNumber = (value) => {
    return value?.toLocaleString?.('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }) || '$ 0';
  };

  // Render states
  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
      <p>Cargando pedidos...</p>
    </Container>
  );

  if (error) return (
    <Container className="text-center mt-5">
      <Alert variant="danger">{error}</Alert>
      <Button onClick={() => window.location.reload()} variant="primary">
        Reintentar
      </Button>
    </Container>
  );

  return (
    <Container className="mt-4">
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Pedidos</h1>
        </Col>
        <Col className="text-end">
          <Button 
            variant="success" 
            onClick={() => {
              setCurrentOrder({
                customerName: '',
                items: [{ ...emptyProduct }],
                paymentMethod: 'efectivo',
                status: 'pendiente',
              });
              setShowModal(true);
            }}
          >
            + Nuevo Pedido
          </Button>
        </Col>
      </Row>

      {alertMsg && (
        <Alert variant="success" onClose={() => setAlertMsg(null)} dismissible className="mt-2">
          {alertMsg}
        </Alert>
      )}

      {/* Orders Table */}
      <Table striped bordered hover responsive className="mt-3">
        <thead className="bg-dark text-white">
          <tr>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.customerName || 'Sin especificar'}</td>
              <td>
                {order.items && order.items.length > 0
                  ? order.items.map((item, idx) => (
                      <div key={idx}>{item.name}</div>
                    ))
                  : 'No hay productos'}
              </td>
              <td>
                {order.items && order.items.length > 0
                  ? order.items.map((item, idx) => (
                      <div key={idx}>{item.quantity}</div>
                    ))
                  : '-'}
              </td>
              <td>
                {order.items && order.items.length > 0
                  ? order.items.map((item, idx) => (
                      <div key={idx}>{formatNumber(item.price)}</div>
                    ))
                  : '-'}
              </td>
              <td>{formatNumber(order.totalAmount)}</td>
              <td>{order.date ? new Date(order.date).toLocaleDateString() : 'Sin fecha'}</td>
              <td>{order.status || 'pendiente'}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => {
                    setCurrentOrder({
                      customerName: order.customerName,
                      items: order.items && order.items.length > 0 ? order.items.map(i => ({ ...i })) : [{ ...emptyProduct }],
                      paymentMethod: order.paymentMethod,
                      status: order.status,
                      id: order._id,
                    });
                    setShowModal(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(order._id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Order Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentOrder?.id ? 'Editar Pedido' : 'Nuevo Pedido'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del cliente"
                    value={currentOrder?.customerName || ''}
                    onChange={(e) => setCurrentOrder({
                      ...currentOrder,
                      customerName: e.target.value
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Productos</Form.Label>
              {(currentOrder?.items || []).map((item, idx) => (
                <Row key={idx} className="mb-2 align-items-end">
                  <Col md={5}>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Coca Cola"
                      value={item.name}
                      onChange={e => handleProductChange(idx, 'name', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Ej: 2"
                      min={1}
                      value={item.quantity}
                      onChange={e => handleProductChange(idx, 'quantity', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Precio</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <Form.Control
                        type="number"
                        placeholder="Ej: 500"
                        min={0}
                        value={item.price}
                        onChange={e => handleProductChange(idx, 'price', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col md={1} className="text-end">
                    <Button variant="danger" size="sm" onClick={() => handleRemoveProduct(idx)} disabled={(currentOrder?.items?.length || 1) === 1}>-</Button>
                  </Col>
                </Row>
              ))}
              <Button variant="secondary" size="sm" onClick={handleAddProduct} className="mt-2">+ Agregar Producto</Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: efectivo, tarjeta, etc."
                value={currentOrder?.paymentMethod || ''}
                onChange={(e) => setCurrentOrder({
                  ...currentOrder,
                  paymentMethod: e.target.value
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={currentOrder?.status || 'pendiente'}
                onChange={e => setCurrentOrder({
                  ...currentOrder,
                  status: e.target.value
                })}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;