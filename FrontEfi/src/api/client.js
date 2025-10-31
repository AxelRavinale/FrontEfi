import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ CORREGIDO: Solo redirigir al login en 401 (Unauthorized)
// Los errores 403 (Forbidden) deben manejarse en el componente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir en 401 (token inválido/expirado)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Los errores 403 (sin permisos) se propagan para que el componente los maneje
    // Ejemplo: "No puedes editar esta propiedad porque no es tuya"
    return Promise.reject(error);
  }
);

export default api;