import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from "axios";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

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
      const res = await axios.post("http://localhost:5000/api/login", values);
      
      // Guardar usuario en contexto
      setUser(res.data.user);
      
      // Guardar token si lo necesitas
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error('Error en login:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response) {
        // El servidor respondió con un error
        const errorMessage = err.response.data.errors 
          ? err.response.data.errors.join(', ')
          : err.response.data.message || 'Credenciales inválidas';
        
        setFieldError('general', errorMessage);
      } else if (err.request) {
        // La petición se hizo pero no hubo respuesta
        setFieldError('general', 'No se pudo conectar con el servidor');
      } else {
        // Algo pasó al configurar la petición
        setFieldError('general', 'Error al iniciar sesión');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "25rem" }}>
        <h2 className="text-center mb-4">Iniciar Sesión 🔒</h2>
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              {/* Error general del servidor */}
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              {/* Campo Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  placeholder="ejemplo@dominio.com"
                />
                <ErrorMessage name="email" component="div" className="invalid-feedback" />
              </div>

              {/* Campo Contraseña */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                />
                <ErrorMessage name="password" component="div" className="invalid-feedback" />
              </div>

              {/* Botón de submit */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Iniciando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </Form>
          )}
        </Formik>

        <hr />
        
        {/* Botón para volver */}
        <button
          onClick={() => navigate("/")}
          className="btn btn-outline-secondary w-100 mt-2"
        >
          ⬅️ Volver al Inicio
        </button>

        {/* Enlace de contraseña olvidada */}
        <div className="text-center mt-3">
          <a 
            style={{ cursor: 'pointer', color: '#007bff' }} 
            onClick={() => navigate('/clave-olvidada')}
          >
            ¿Olvidó su contraseña?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;