<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect } from "react";
=======
import React, { createContext, useState, useContext } from "react";
import api from "../api/client"; // tu instancia de Axios
>>>>>>> 6ece8d858b25b5f51d8049cca665f75d7b7beaaa
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
<<<<<<< HEAD
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar sesión guardada al iniciar la app
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login
  async function login(email, password) {
    try {
      const res = await authService.login(email, password);
      const { token, user } = res;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir según rol
      switch(user.rol) {
        case 'admin':
          navigate("/admin/dashboard");
          break;
        case 'agente':
          navigate("/agente/dashboard");
          break;
        case 'cliente':
          navigate("/cliente/propiedades");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en login");
    }
  }

  // Registro
  async function register(data) {
    try {
      const res = await authService.register(data);
      // El backend no devuelve token en registro, solo confirma creación
      // Opcionalmente puedes hacer auto-login después del registro
      navigate("/login");
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en registro");
    }
  }

  // Logout
  function logout() {
    setToken(null);
=======
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.user); // supongamos que el backend devuelve { user, token }
      localStorage.setItem("token", res.data.token);
      setLoading(false);
      navigate("/");
    } catch (err) {
      setLoading(false);
      throw err.response?.data?.message || "Error en login";
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      setLoading(false);
      navigate("/");
    } catch (err) {
      setLoading(false);
      throw err.response?.data?.message || "Error en registro";
    }
  };

  const logout = () => {
>>>>>>> 6ece8d858b25b5f51d8049cca665f75d7b7beaaa
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
<<<<<<< HEAD
  }

  // Forgot password (envía mail con link)
  async function forgotPassword(email) {
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al enviar email");
    }
  }

  // Reset password (recibe token + nueva pass)
  async function resetPassword(resetToken, newPassword) {
    try {
      await authService.resetPassword(resetToken, newPassword);
      navigate("/login");
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al restablecer contraseña");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        loading
      }}
    >
      {!loading && children}
=======
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
>>>>>>> 6ece8d858b25b5f51d8049cca665f75d7b7beaaa
    </AuthContext.Provider>
  );
}

export function useAuth() {
<<<<<<< HEAD
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
=======
  return useContext(AuthContext);
}
>>>>>>> 6ece8d858b25b5f51d8049cca665f75d7b7beaaa
