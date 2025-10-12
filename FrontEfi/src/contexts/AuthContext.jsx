import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client"; // instancia de Axios
import authService from "../service/auth"; // servicios adicionales de auth
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- Cargar sesión guardada al iniciar la app ---
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // --- LOGIN ---
  async function login(email, password) {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

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
          navigate("/dashboard");
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en login");
    } finally {
      setLoading(false);
    }
  }

  // --- REGISTER ---
  async function register(data) {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      // Podés auto loguear o redirigir al login
      navigate("/login");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error en registro");
    } finally {
      setLoading(false);
    }
  }

  // --- LOGOUT ---
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // --- FORGOT PASSWORD ---
  async function forgotPassword(email) {
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Error al enviar email");
    }
  }

  // --- RESET PASSWORD ---
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
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// --- Hook personalizado ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
