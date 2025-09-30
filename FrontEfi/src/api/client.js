import axios from "axios";

const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", 
headers: {
    "Content-Type": "application/json",
},
});

// 🔹 Interceptor para adjuntar el token si existe
api.interceptors.request.use((config) => {
const token = localStorage.getItem("token");
if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
return config;
});

// 🔹 Interceptor para manejar errores de auth
api.interceptors.response.use(
(response) => response,
(error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
    // Podemos redirigir al login o refrescar token
    console.warn("⚠️ Sesión inválida o expirada");
    localStorage.removeItem("token");
    window.location.href = "/login";
    }
    return Promise.reject(error);
}
);

export default api;
