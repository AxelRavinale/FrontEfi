import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("Todos los campos son obligatorios");
    }

    try {
      setLoading(true);
      await login(email, password);
      // El login del AuthContext maneja la navegación automáticamente
    } catch (err) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background:
          "linear-gradient(135deg, var(--cream) 0%, var(--off-white) 100%)",
      }}
    >
      <Card
        className="premium-card p-4"
        style={{
          width: "450px",
          boxShadow: "0 10px 40px rgba(44, 24, 16, 0.15)",
        }}
      >
        <div className="text-center mb-4">
          <h2 className="elegant-title mb-2">Iniciar Sesión</h2>
          <p className="text-muted">
            <i className="pi pi-home me-2"></i>
            Inmobiliaria Premium
          </p>
        </div>

        {error && (
          <Message
            severity="error"
            text={error}
            className="w-100 mb-3"
            style={{ display: "block" }}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="pi pi-envelope me-2"></i>
              Email
            </label>
            <InputText
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@mail.com"
              className="w-100"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="pi pi-lock me-2"></i>
              Contraseña
            </label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              toggleMask
              feedback={false}
              className="w-100"
              inputClassName="w-100"
              required
            />
          </div>

          <Button
            type="submit"
            label={loading ? "Ingresando..." : "Ingresar"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            className="btn-premium w-100 mb-3"
            disabled={loading}
          />

          <div className="text-center">
            <Link
              to="/register"
              className="text-decoration-none"
              style={{ color: "var(--primary-brown)" }}
            >
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>

          <hr className="my-3" />

          <Link to="/">
            <Button
              label="Volver al Inicio"
              icon="pi pi-arrow-left"
              className="p-button-text w-100"
            />
          </Link>
        </form>
      </Card>
    </div>
  );
};

export default Login;