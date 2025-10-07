import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";

const Register = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password || !form.confirm) {
      return setError("Todos los campos son obligatorios");
    }
    if (form.password !== form.confirm) {
      return setError("Las contraseñas no coinciden");
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/register", {
        email: form.email,
        password: form.password,
      });
      setUser(res.data.user); // guardamos usuario en contexto
      navigate("/dashboard");
    } catch (err) {
      setError("Error al registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "25rem" }}>
        <h2 className="text-center mb-4">Registro 📝</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              placeholder="ejemplo@mail.com"
              required
            />
          </div>
          <div className="mb-3">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              minLength="6"
              required
            />
          </div>
          <div className="mb-3">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              className="form-control"
              minLength="6"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>
        <hr />
        <button
          onClick={() => navigate("/")}
          className="btn btn-outline-secondary w-100 mt-2"
        >
          ⬅ Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default Register;
