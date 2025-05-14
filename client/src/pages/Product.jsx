import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error('Error al obtener productos');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Obtener productos con bajo stock
    const fetchLowStock = async () => {
      try {
        const res = await fetch(`${API}/dashboard/inventory`);
        if (!res.ok) throw new Error('Error al obtener inventario');
        const data = await res.json();
        setLowStock(data.lowStock || []);
      } catch (err) {
        // No bloquea la UI si falla
      }
    };
    fetchLowStock();

    // Obtener categorías únicas
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories`);
        setCategories(res.data);
      } catch (err) {
        // No bloquea la UI si falla
      }
    };
    fetchCategories();
  }, []);

  // Crear o editar producto
  const handleSave = async () => {
    try {
      const method = currentProduct?._id ? 'PUT' : 'POST';
      const url = currentProduct?._id
        ? `${API}/products/${currentProduct._id}`
        : `${API}/products`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProduct),
      });
      if (!res.ok) throw new Error('Error al guardar producto');
      const saved = await res.json();
      if (method === 'POST') setProducts([...products, saved]);
      else setProducts(products.map(p => (p._id === saved._id ? saved : p)));
      setShowModal(false);
      setAlertMsg('Producto guardado correctamente');
    } catch (err) {
      setError(err.message);
    }
  };

  // Crear nueva categoría desde el modal
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await axios.post(`${API}/categories`, { name: newCategory.trim() });
      setCategories([...categories, res.data]);
      setCurrentProduct({ ...currentProduct, category: newCategory.trim() });
      setNewCategory('');
      toast.success('Categoría creada');
    } catch (err) {
      toast.error('No se pudo crear la categoría');
    }
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      setProducts(products.filter(p => p._id !== id));
      toast.success('Producto eliminado');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /><p>Cargando productos...</p></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      {/* Panel de bajo stock */}
      {lowStock.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <strong>¡Atención!</strong> Los siguientes productos tienen poco stock:
          <ul className="mb-0 mt-2">
            {lowStock.map(prod => (
              <li key={prod._id}>
                <b>{prod.name}</b> (Stock: {prod.stock})
              </li>
            ))}
          </ul>
        </Alert>
      )}
      <Row className="mb-4 align-items-center">
        <Col><h1>Productos</h1></Col>
        <Col className="text-end">
          <Button onClick={() => { setCurrentProduct({ name: '', price: 0, stock: 0, category: '' }); setShowModal(true); }} variant="success">+ Nuevo Producto</Button>
        </Col>
      </Row>
      {alertMsg && <Alert variant="success" onClose={() => setAlertMsg(null)} dismissible>{alertMsg}</Alert>}
      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>{product.category || '-'}</td>
              <td>
                <Button size="sm" variant="outline-primary" className="me-2" onClick={() => { setCurrentProduct(product); setShowModal(true); }}>Editar</Button>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(product._id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentProduct?._id ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={currentProduct?.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" value={currentProduct?.price || 0} onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={currentProduct?.stock || 0} onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  value={currentProduct?.category || ''}
                  onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Product;
