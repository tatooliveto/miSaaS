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
import axios from 'axios';


const Orders = () => {
  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState([]);
  // Opciones de métodos de pago y estado (con mayúscula inicial)
  const paymentMethods = [
    'Efectivo',
    'Tarjeta',
    'Transferencia',
    'Mercado Pago',
    'Cheque'
  ];
  const statusOptions = ['Pendiente', 'Completado'];
  const [alertMsg, setAlertMsg] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: '' });
  const [newCategory, setNewCategory] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [stockWarning, setStockWarning] = useState({});

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

    // Obtener productos y categorías para el selector
    const fetchProductsAndCategories = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products'),
          axios.get('http://localhost:5000/api/categories')
        ]);
        setProductsList(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {}
    };
    fetchProductsAndCategories();

    // Obtener clientes
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clients');
        setClients(response.data);
      } catch (err) {}
    };
    fetchClients();
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
      // Validar campos obligatorios
      if (!selectedClientId) {
        Swal.fire({ icon: 'warning', title: 'Campo obligatorio', text: 'Debes seleccionar un cliente.' });
        return;
      }
      if (
        !currentOrder?.items?.length ||
        currentOrder.items.some(
          item =>
            !item.name ||
            !item.quantity ||
            !item.price ||
            item.price <= 0 ||
            !item.category
        )
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obligatorios',
          text: 'Completa todos los campos de producto, cantidad, precio y categoría (precio debe ser mayor a 0).'
        });
        return;
      }
      if (!currentOrder?.paymentMethod?.trim()) {
        Swal.fire({ icon: 'warning', title: 'Campo obligatorio', text: 'Debes ingresar el método de pago.' });
        return;
      }

      // Validar stock antes de guardar
      const stockErrors = (currentOrder?.items || []).map((item, idx) => {
        const prod = productsList.find(p => p.name === item.name);
        if (prod && item.quantity > prod.stock) {
          return {
            idx,
            name: item.name,
            max: prod.stock
          };
        }
        return null;
      }).filter(Boolean);

      if (stockErrors.length > 0) {
        const msg = stockErrors.map(e =>
          `El producto "${e.name}" solo tiene ${e.max} unidades disponibles.`
        ).join('\n');
        Swal.fire({
          icon: 'error',
          title: 'Stock insuficiente',
          text: msg
        });
        return;
      }

      // Calcular el monto total
      const totalAmount = (currentOrder?.items || []).reduce(
        (sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0
      );

      // Transformar los datos del modal al formato que espera el backend
      const orderToSend = {
        customerId: selectedClientId,
        items: currentOrder?.items || [],
        paymentMethod: currentOrder?.paymentMethod || 'efectivo',
        status: currentOrder?.status || 'pendiente',
        totalAmount, // <-- agrega esto
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

  // Selección de producto existente
  const handleSelectProduct = (idx, productId) => {
    const prod = productsList.find(p => p._id === productId);
    if (!prod) return;
    const updatedProducts = [...(currentOrder?.items || [])];
    updatedProducts[idx] = {
      productId: prod._id, // <-- Agrega esto
      name: prod.name,
      price: prod.price,
      quantity: 1,
      stock: prod.stock,
      category: prod.category
    };
    setCurrentOrder({ ...currentOrder, items: updatedProducts });
    setStockWarning({ ...stockWarning, [idx]: false });
  };

  // Cambios en cantidad: alerta si supera stock
  const handleProductQuantityChange = (idx, value) => {
    const updatedProducts = [...(currentOrder?.items || [])];
    updatedProducts[idx].quantity = Number(value);
    if (updatedProducts[idx].stock !== undefined && Number(value) > updatedProducts[idx].stock) {
      setStockWarning({ ...stockWarning, [idx]: true });
    } else {
      setStockWarning({ ...stockWarning, [idx]: false });
    }
    setCurrentOrder({ ...currentOrder, items: updatedProducts });
  };

  // Crear producto desde modal
  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.category) return;
    try {
      const res = await axios.post('http://localhost:5000/api/products', newProduct);
      setProductsList([...productsList, res.data]);
      // Asignar el producto recién creado al pedido
      const updatedItems = [...(currentOrder?.items || [])];
      updatedItems[updatedItems.length - 1] = {
        productId: res.data._id,
        name: res.data.name,
        price: res.data.price,
        quantity: 1,
        stock: res.data.stock,
        category: res.data.category
      };
      setCurrentOrder({ ...currentOrder, items: updatedItems });
      setShowProductModal(false);
      setNewProduct({ name: '', price: 0, stock: 0, category: '' });
      toast.success('Producto creado');
    } catch (err) {
      toast.error('Error al crear producto');
    }
  };

  // Crear categoría desde modal de producto
  const handleAddCategory = async () => { 
    if (!newCategory.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/categories', { name: newCategory.trim() });
      setCategories([...categories, res.data]);
      setNewProduct({ ...newProduct, category: newCategory.trim() });
      setNewCategory('');
      toast.success('Categoría creada');
    } catch (err) {
      toast.error('No se pudo crear la categoría');
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
                items: [{ ...emptyProduct }],
                paymentMethod: 'efectivo',
                status: 'pendiente',
              });
              setSelectedClientId('');
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
              <td>
                {order.customerId ? order.customerId.name : 'Sin especificar'}
              </td>
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
              <td>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : 'Sin fecha'}
              </td>
              <td>
                {order.status === 'Completado' || order.status === 'completado' ? (
                  <span title="Completado" style={{ color: 'green', fontSize: 18 }}>✔️</span>
                ) : (
                  <span title="Pendiente" style={{ color: 'orange', fontSize: 18 }}>⏳</span>
                )}
                {' '}
                {order.status || 'pendiente'}
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => {
                    // Mapear items para agregar la categoría desde productsList
                    const itemsWithCategory = order.items && order.items.length > 0
                      ? order.items.map(i => {
                          const prod = productsList.find(p => p.name === i.name);
                          return {
                            ...i,
                            category: prod ? prod.category : ''
                          };
                        })
                      : [{ ...emptyProduct }];
                    setCurrentOrder({
                      items: itemsWithCategory,
                      paymentMethod: order.paymentMethod,
                      status: order.status,
                      id: order._id,
                    });
                    setSelectedClientId(order.clientId);
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
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Cliente</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={selectedClientId}
                      onChange={e => setSelectedClientId(e.target.value)}
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                      ))}
                    </Form.Select>
                    <Button
                      variant="outline-secondary"
                      onClick={() => window.location.href = '/clients'}
                    >
                      Crear nuevo
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Productos <span style={{color:'red'}}>*</span></Form.Label>
              <div className="border rounded p-2 bg-light">
                {/* Cabecera alineada */}
                <Row className="mb-1">
                  <Col md={5}><strong>Producto</strong></Col>
                  <Col md={2}><strong>Cantidad</strong></Col>
                  <Col md={3}><strong>Precio</strong></Col>
                  <Col md={2}></Col>
                </Row>
                {(currentOrder?.items || []).map((item, idx) => (
                  <Row key={idx} className="align-items-end mb-2">
                    <Col md={5}>
                      <Form.Select
                        value={productsList.find(p => p.name === item.name)?._id || ''}
                        onChange={e => handleSelectProduct(idx, e.target.value)}
                      >
                        <option value="">Seleccionar producto</option>
                        {productsList.map(prod => (
                          <option key={prod._id} value={prod._id}>
                            {prod.name} (Stock: {prod.stock})
                          </option>
                        ))}
                      </Form.Select>
                      <Button variant="link" size="sm" onClick={() => setShowProductModal(true)}>
                        + Nuevo producto
                      </Button>
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => handleProductQuantityChange(idx, e.target.value)}
                      />
                      {stockWarning[idx] && (
                        <div style={{ color: 'red', fontSize: 12 }}>Supera el stock disponible</div>
                      )}
                    </Col>
                    <Col md={3}>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <Form.Control
                          type="number"
                          min={1}
                          placeholder="Precio"
                          value={item.price === 0 ? '' : item.price}
                          onChange={e => handleProductChange(idx, 'price', e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col md={2} className="text-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveProduct(idx)}
                        disabled={(currentOrder?.items?.length || 1) === 1}
                      >-</Button>
                    </Col>
                  </Row>
                ))}
                <div className="text-end">
                  <Button variant="secondary" size="sm" onClick={handleAddProduct} className="mt-2">
                    + Agregar Producto
                  </Button>
                </div>
              </div>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Método de Pago <span style={{color:'red'}}>*</span></Form.Label>
                  <Form.Select
                    value={currentOrder?.paymentMethod || ''}
                    onChange={e => setCurrentOrder({
                      ...currentOrder,
                      paymentMethod: e.target.value
                    })}
                  >
                    <option value="">Seleccionar método de pago</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={currentOrder?.status || 'Pendiente'}
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
              </Col>
            </Row>
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

      {/* Modal para crear producto */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre <span style={{color:'red'}}>*</span></Form.Label>
              <Form.Control type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio <span style={{color:'red'}}>*</span></Form.Label>
              <Form.Control
                type="number"
                min="1"
                placeholder="Precio"
                value={newProduct.price === 0 ? '' : newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock <span style={{color:'red'}}>*</span></Form.Label>
              <Form.Control type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría <span style={{color:'red'}}>*</span></Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  value={newProduct.category || ''}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="text"
                  placeholder="Nueva categoría"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  style={{ maxWidth: 180 }}
                />
                <Button variant="secondary" onClick={handleAddCategory}>Crear</Button>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleCreateProduct}>Crear</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;