import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Link } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: 18,
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!formData.name || !formData.email || !formData.password) {
      return setError("Todos los campos son obligatorios");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    if (formData.password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }

    try {
      setLoading(true);
      // El register del backend necesita: name, email, age, password, rol (opcional)
      await register({
        name: formData.name,
        email: formData.email,
        age: formData.age,
        password: formData.password,
        rol: "cliente", // Por defecto los registros públicos son clientes
      });
      // El register del AuthContext maneja la navegación automáticamente
    } catch (err) {
      setError(err.message || "Error al registrar el usuario");
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
          width: "500px",
          boxShadow: "0 10px 40px rgba(44, 24, 16, 0.15)",
        }}
      >
        <div className="text-center mb-4">
          <h2 className="elegant-title mb-2">Crear Cuenta</h2>
          <p className="text-muted">
            <i className="pi pi-user-plus me-2"></i>
            Únete a Inmobiliaria Premium
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
              <i className="pi pi-user me-2"></i>
              Nombre Completo
            </label>
            <InputText
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Juan Pérez"
              className="w-100"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="pi pi-envelope me-2"></i>
              Email
            </label>
            <InputText
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="ejemplo@mail.com"
              className="w-100"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="pi pi-calendar me-2"></i>
              Edad
            </label>
            <InputNumber
              value={formData.age}
              onValueChange={(e) => handleChange("age", e.value)}
              min={18}
              max={120}
              placeholder="18"
              className="w-100"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="pi pi-lock me-2"></i>
              Contraseña
            </label>
            <Password
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              toggleMask
              className="w-100"
              inputClassName="w-100"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="pi pi-lock me-2"></i>
              Confirmar Contraseña
            </label>
            <Password
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Repita su contraseña"
              toggleMask
              feedback={false}
              className="w-100"
              inputClassName="w-100"
              required
            />
          </div>

          <Button
            type="submit"
            label={loading ? "Registrando..." : "Registrarse"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
            className="btn-premium w-100 mb-3"
            disabled={loading}
          />

          <div className="text-center">
            <Link
              to="/login"
              className="text-decoration-none"
              style={{ color: "var(--primary-brown)" }}
            >
              ¿Ya tienes cuenta? Inicia sesión
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

export default Register;