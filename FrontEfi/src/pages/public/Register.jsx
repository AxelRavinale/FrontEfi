import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
const { register } = useAuth();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    await register(email, password);
    } catch (err) {
    console.error("Error en registro:", err);
    }
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
    >
        <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>
        <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4"
        />
        <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4"
        />
        <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
        >
        Registrarse
        </button>
    </form>
    </div>
);
};

export default Register;
