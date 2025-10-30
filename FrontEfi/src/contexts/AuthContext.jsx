import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import authService from "../service/auth";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Validar sesión al cargar
  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      console.log('🔍 Validando sesión...', { savedToken: !!savedToken, savedUser });
      
      if (savedToken && savedUser) {
        try {
          const res = await authService.verifySession();
          console.log('✅ Sesión válida:', res.user);
          
          if (isMounted) {
            setToken(savedToken);
            setUser(res.user); // ✅ Incluye clienteId si es cliente
            // ✅ Actualizar también en localStorage
            localStorage.setItem("user", JSON.stringify(res.user));
          }
        } catch (error) {
          console.error('❌ Sesión inválida:', error);
          if (isMounted) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setToken(null);
          }
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // LOGIN
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, user } = res.data;

      console.log('👤 Usuario autenticado:', user); // ✅ Debug

      setToken(token);
      setUser(user); // ✅ Ahora incluye clienteId para clientes

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirigir según rol
      const routes = {
        admin: "/admin/dashboard",
        agente: "/agente/dashboard",
        cliente: "/cliente/propiedades",
      };
      
      navigate(routes[user.rol] || "/");
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
      await api.post("/api/auth/register", data);
      navigate("/login");
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

  return (
    <AuthContext.Provider
      value={{
        user, // ✅ Ahora incluye clienteId para clientes
        token,
        login,
        register,
        logout,
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