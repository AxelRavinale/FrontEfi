import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client"; // tu instancia de Axios
import authService from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Cargar sesión guardada al iniciar la app
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // 🔹 Login
  async function login(email, password) {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { token, user } = res;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir según rol
      switch (user.rol) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "agente":
          navigate("/agente/dashboard");
          break;
        case "cliente":
          navigate("/cliente/propiedades");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en login");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Registro
  async function register(data) {
    setLoading(true);
    try {
      const res = await authService.register(data);
      navigate("/login");
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en registro");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Logout
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // 🔹 Recuperar contraseña
  async function forgotPassword(email) {
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al enviar email");
    }
  }

  // 🔹 Restablecer contraseña
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
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
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
