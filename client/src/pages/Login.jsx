import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      const user = jwtDecode(token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user); // <-- actualiza el estado global
      navigate('/'); // Redirige al dashboard
    }
  }, [navigate, setUser]);

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: 80 }}>
      <h2>Iniciar sesión</h2>
      <a
        className="btn btn-danger w-100"
        href="http://localhost:5000/api/auth/google"
      >
        Iniciar sesión con Google
      </a>
    </div>
  );
};

export default Login;