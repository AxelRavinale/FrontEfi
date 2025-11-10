import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Formik, Field, Form } from "formik";
import * as Yup from 'yup';
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const { forgotPassword } = useContext(AuthContext);
    const navigate = useNavigate();

    // Esquema de validación con regex estricta
    const ForgotSchema = Yup.object({
        email: Yup.string()
            .email("El email debe tener un formato válido")
            .matches(
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'El email debe incluir un dominio completo (ejemplo: usuario@gmail.com)'
            )
            .required('El email es obligatorio')
    });

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{
                background: "linear-gradient(135deg, var(--cream) 0%, var(--off-white) 100%)",
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
                    <h2 className="elegant-title mb-2">Recuperar Contraseña</h2>
                    <p className="text-muted">
                        <i className="pi pi-lock me-2"></i>
                        Restablece tu acceso
                    </p>
                </div>

                <div className="mb-4 p-3" style={{ 
                    backgroundColor: "#f8f9fa", 
                    borderRadius: "8px",
                    border: "1px solid #e9ecef"
                }}>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.95rem" }}>
                        <i className="pi pi-info-circle me-2" style={{ color: "var(--primary-brown)" }}></i>
                        Ingresa tu email y te enviaremos un enlace de recuperación
                    </p>
                </div>

                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={ForgotSchema}
                    onSubmit={async (values, { resetForm, setFieldError, setSubmitting }) => {
                        try {
                            const response = await forgotPassword(values.email);
                            if (response) {
                                resetForm();
                                setFieldError('success', '✅ Email enviado exitosamente. Revisa tu bandeja de entrada.');
                            }
                        } catch (error) {
                            setFieldError('general', error.message || 'Error al enviar el email de recuperación');
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ values, errors, touched, isSubmitting, handleChange, handleBlur }) => (
                        <Form>
                            {/* Mensaje de éxito */}
                            {errors.success && (
                                <Message
                                    severity="success"
                                    text={errors.success}
                                    className="w-100 mb-3"
                                    style={{ display: "block" }}
                                />
                            )}

                            {/* Mensaje de error general */}
                            {errors.general && (
                                <Message
                                    severity="error"
                                    text={errors.general}
                                    className="w-100 mb-3"
                                    style={{ display: "block" }}
                                />
                            )}

                            {/* Campo Email */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">
                                    <i className="pi pi-envelope me-2"></i>
                                    Email de recuperación
                                </label>
                                <Field name='email'>
                                    {({ field }) => (
                                        <InputText
                                            id='email'
                                            {...field}
                                            type="email"
                                            placeholder="ejemplo@dominio.com"
                                            className={`w-100 ${touched.email && errors.email ? 'p-invalid' : ''}`}
                                            onBlur={handleBlur}
                                        />
                                    )}
                                </Field>
                                {touched.email && errors.email && (
                                    <small className="p-error d-block mt-1">
                                        <i className="pi pi-exclamation-circle me-1"></i>
                                        {errors.email}
                                    </small>
                                )}
                            </div>

                            {/* Botón Enviar */}
                            <Button
                                type="submit"
                                label={isSubmitting ? "Enviando..." : "Enviar Email de Recuperación"}
                                icon={isSubmitting ? "pi pi-spin pi-spinner" : 'pi pi-send'}
                                className="btn-premium w-100 mb-3"
                                disabled={isSubmitting}
                            />

                            {/* Links de navegación */}
                            <div className="text-center mb-3">
                                <Link
                                    to="/login"
                                    className="text-decoration-none"
                                    style={{ color: "var(--primary-brown)" }}
                                >
                                    <i className="pi pi-arrow-left me-1"></i>
                                    Volver a Iniciar Sesión
                                </Link>
                            </div>

                            <hr className="my-3" />

                            {/* Botón Volver al Inicio */}
                            <Link to="/">
                                <Button
                                    label="Volver al Inicio"
                                    icon="pi pi-home"
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

export default ForgotPassword;