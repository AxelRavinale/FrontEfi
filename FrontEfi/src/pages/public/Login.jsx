import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Link } from "react-router-dom";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const Login = () => {
  const { login } = useAuth();

  // Valores iniciales del formulario
  const initialValues = {
    email: "",
    password: ""
  };

  // Esquema de validación con Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('El email debe tener un formato válido (ejemplo: usuario@dominio.com)')
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'El email debe incluir un dominio completo (ejemplo: usuario@gmail.com)'
      )
      .required('El email es obligatorio'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es obligatoria')
  });

  // Función para manejar el envío del formulario
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await login(values.email, values.password);
      // El login del AuthContext maneja la navegación automáticamente
    } catch (err) {
      console.error('Error en login:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response) {
        const errorMessage = err.response.data.errors 
          ? err.response.data.errors.join(', ')
          : err.response.data.message || 'Credenciales inválidas';
        setFieldError('general', errorMessage);
      } else {
        setFieldError('general', err.message || 'Error al iniciar sesión');
      }
    } finally {
      setSubmitting(false);
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

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              {/* Error general del servidor */}
              {errors.general && (
                <Message
                  severity="error"
                  text={errors.general}
                  className="w-100 mb-3"
                  style={{ display: "block" }}
                />
              )}

              {/* Campo Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="pi pi-envelope me-2"></i>
                  Email
                </label>
                <InputText
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ejemplo@dominio.com"
                  className={`w-100 ${touched.email && errors.email ? 'p-invalid' : ''}`}
                />
                {touched.email && errors.email && (
                  <small className="p-error d-block mt-1">
                    <i className="pi pi-exclamation-circle me-1"></i>
                    {errors.email}
                  </small>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="pi pi-lock me-2"></i>
                  Contraseña
                </label>
                <Password
                  name="password"
                  value={values.password}
                  onChange={(e) => setFieldValue('password', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Mínimo 6 caracteres"
                  toggleMask
                  feedback={false}
                  className={`w-100 ${touched.password && errors.password ? 'p-invalid' : ''}`}
                  inputClassName="w-100"
                />
                {touched.password && errors.password && (
                  <small className="p-error d-block mt-1">
                    <i className="pi pi-exclamation-circle me-1"></i>
                    {errors.password}
                  </small>
                )}
              </div>

              {/* Link de Olvidé mi contraseña */}
              <div className="text-end mb-3">
                <Link
                  to="/clave-olvidada"
                  className="text-decoration-none"
                  style={{ 
                    color: "var(--primary-brown)", 
                    fontSize: "0.9rem",
                    fontWeight: "500"
                  }}
                >
                  ¿Olvidó su contraseña?
                </Link>
              </div>

              {/* Botón de Ingresar */}
              <Button
                type="submit"
                label={isSubmitting ? "Ingresando..." : "Ingresar"}
                icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
                className="btn-premium w-100 mb-3"
                disabled={isSubmitting}
              />

              {/* Link de Registro */}
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

              {/* Botón Volver */}
              <Link to="/">
                <Button
                  label="Volver al Inicio"
                  icon="pi pi-arrow-left"
                  className="p-button-text w-100"
                  type="button"
                />
              </Link>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Login;