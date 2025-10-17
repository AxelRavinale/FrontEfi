import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";
import authService from "../service/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar sesión guardada
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir según rol
      const routes = {
        admin: "/admin/dashboard",
        agente: "/agente/dashboard",
        cliente: "/cliente/propiedades",
      };
      navigate(routes[user.rol] || "/dashboard");
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // REGISTER
  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      navigate("/login");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en registro");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // LOGOUT
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  // FORGOT PASSWORD
  const forgotPassword = useCallback(async (email) => {
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al enviar email");
    }
  }, []);

  // RESET PASSWORD
  const resetPassword = useCallback(async (resetToken, newPassword) => {
    try {
      await authService.resetPassword(resetToken, newPassword);
      navigate("/login");
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al restablecer contraseña");
    }
  }, [navigate]);

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
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export { AuthProvider, useAuth, AuthContext };
