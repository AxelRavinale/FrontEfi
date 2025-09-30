import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client"; // axios con interceptor
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);     // info del usuario logueado
const [token, setToken] = useState(null);   // JWT
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

// 🔄 Cargar sesión guardada al iniciar la app
useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
    setToken(savedToken);
    setUser(JSON.parse(savedUser));
    }
    setLoading(false);
}, []);

// 🔐 Login
async function login(email, password) {
    try {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard"); // redirigir según rol
    } catch (err) {
    throw new Error(err.response?.data?.error || "Error en login");
    }
}

// 📝 Registro
async function register(data) {
    try {
    const res = await api.post("/auth/register", data);
    const { token, user } = res.data;

    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard");
    } catch (err) {
    throw new Error(err.response?.data?.error || "Error en registro");
    }
}

// 🚪 Logout
function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
}

// 🔑 Forgot password (envía mail con link)
async function forgotPassword(email) {
    await api.post("/auth/forgot-password", { email });
}

// 🔑 Reset password (recibe token + nueva pass)
async function resetPassword(token, newPassword) {
    await api.post("/auth/reset-password", { token, password: newPassword });
}

return (
    <AuthContext.Provider
    value={{ user, token, login, register, logout, forgotPassword, resetPassword, loading }}
    >
    {children}
    </AuthContext.Provider>
);
}

export function useAuth() {
return useContext(AuthContext);
}
