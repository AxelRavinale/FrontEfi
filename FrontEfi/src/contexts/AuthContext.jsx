import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}