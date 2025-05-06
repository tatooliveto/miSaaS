import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';

const MainNavbar = ({ user, setUser }) => (
  <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm py-2">
    <Navbar.Brand href="/">SaaS Manager</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link href="/">Dashboard</Nav.Link>
        <Nav.Link href="/products">Productos</Nav.Link>
        <Nav.Link href="/clients">Clientes</Nav.Link>
        <Nav.Link href="/orders">Pedidos</Nav.Link>
      </Nav>
      {user && user.email && (
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            id="dropdown-user"
            style={{
              padding: 0,
              border: 'none',
              boxShadow: 'none',
              textDecoration: 'none', // quita subrayado
              color: '#fff'
            }}
          >
            <img
              src={user.avatar}
              alt="avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#e57373',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 18,
                marginRight: 8,
              }}
              onError={e => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=e57373&color=fff`;
              }}
            />
            <span style={{
              color: '#fff',
              marginLeft: 8,
              textDecoration: 'none', // quita subrayado
              borderBottom: 'none'
            }}>
              {user.name || user.email}
            </span>
            {/* Flecha blanca */}
            <svg style={{ marginLeft: 6, marginBottom: 3 }} width="16" height="16" fill="#fff" viewBox="0 0 16 16">
              <path d="M1.5 6l6 6 6-6" stroke="#fff" strokeWidth="2" fill="none" />
            </svg>
          </Dropdown.Toggle>
          <Dropdown.Menu
            style={{
              minWidth: 200,
              padding: '12px 0',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            <Dropdown.Item
              style={{
                borderRadius: 6,
                margin: '8px 8px',
                padding: '10px 18px',
                fontWeight: 500
              }}
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                window.location.href = '/login';
              }}
            >
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </Navbar.Collapse>
  </Navbar>
);

export default MainNavbar;
