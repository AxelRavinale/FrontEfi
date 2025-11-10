import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from 'yup';
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";

const ResetPassword = () => {
    const resetSchema = Yup.object({
        password: Yup.string()
            .min(6, "La contraseña debe tener al menos 6 caracteres")
            .required('La contraseña es obligatoria'),
        confirm: Yup.string()
            .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
            .required('Debes repetir la contraseña')
    });

    const { resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ token: '', id: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const url = new URLSearchParams(window.location.search);
        setParams({ 
            token: url.get("token") || "", 
            id: url.get('id') || '' 
        });
    }, []);

    const invalidLink = !params.token || !params.id;

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
                    <h2 className="elegant-title mb-2">
                        {invalidLink ? '⚠️ Enlace Inválido' : '🔒 Nueva Contraseña'}
                    </h2>
                    <p className="text-muted">
                        <i className="pi pi-shield me-2"></i>
                        {invalidLink ? 'Verificación requerida' : 'Restablece tu contraseña de forma segura'}
                    </p>
                </div>

                {invalidLink ? (
                    <>
                        <Message
                            severity="error"
                            text="El enlace de recuperación es inválido o ha expirado"
                            className="w-100 mb-3"
                            style={{ display: "block" }}
                        />
                        
                        <div className="mb-4 p-3" style={{ 
                            backgroundColor: "#fff3cd", 
                            borderRadius: "8px",
                            border: "1px solid #ffc107",
                            borderLeft: "4px solid #ffc107"
                        }}>
                            <p className="mb-2" style={{ fontSize: "0.95rem", color: "#856404" }}>
                                <strong>Posibles causas:</strong>
                            </p>
                            <ul className="mb-0" style={{ fontSize: "0.9rem", color: "#856404" }}>
                                <li>El enlace ha expirado (válido por 1 hora)</li>
                                <li>El enlace ya fue utilizado</li>
                                <li>El enlace está incompleto</li>
                            </ul>
                        </div>

                        <Link to="/clave-olvidada">
                            <Button
                                label="Solicitar Nuevo Enlace"
                                icon="pi pi-refresh"
                                className="btn-premium w-100 mb-3"
                            />
                        </Link>

                        <hr className="my-3" />

                        <Link to="/login">
                            <Button
                                label="Volver a Iniciar Sesión"
                                icon="pi pi-arrow-left"
                                className="p-button-text w-100"
                                type="button"
                            />
                        </Link>
                    </>
                ) : (
                    <>
                        {success ? (
                            <>
                                <Message
                                    severity="success"
                                    text="✅ ¡Contraseña actualizada exitosamente!"
                                    className="w-100 mb-3"
                                    style={{ display: "block" }}
                                />
                                
                                <div className="mb-4 p-3" style={{ 
                                    backgroundColor: "#d1f2eb", 
                                    borderRadius: "8px",
                                    border: "1px solid #28a745",
                                    borderLeft: "4px solid #28a745"
                                }}>
                                    <p className="mb-0" style={{ fontSize: "0.95rem", color: "#155724" }}>
                                        <i className="pi pi-check-circle me-2"></i>
                                        Ya puedes iniciar sesión con tu nueva contraseña
                                    </p>
                                </div>

                                <Link to="/login">
                                    <Button
                                        label="Ir a Iniciar Sesión"
                                        icon="pi pi-sign-in"
                                        className="btn-premium w-100"
                                    />
                                </Link>
                            </>
                        ) : (
                            <Formik
                                initialValues={{ password: '', confirm: '' }}
                                validationSchema={resetSchema}
                                onSubmit={async (values, { resetForm, setFieldError }) => {
                                    setLoading(true);
                                    setError('');
                                    try {
                                        const response = await resetPassword({
                                            id: params.id,
                                            token: params.token,
                                            password: values.password
                                        });
                                        if (response) {
                                            resetForm();
                                            setSuccess(true);
                                            // Opcional: redirigir después de 2 segundos
                                            setTimeout(() => {
                                                navigate('/login');
                                            }, 2000);
                                        }
                                    } catch (err) {
                                        setFieldError('general', err.message || 'Error al restablecer la contraseña');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                                    <Form>
                                        {/* Mensaje de error general */}
                                        {errors.general && (
                                            <Message
                                                severity="error"
                                                text={errors.general}
                                                className="w-100 mb-3"
                                                style={{ display: "block" }}
                                            />
                                        )}

                                        {/* Información de seguridad */}
                                        <div className="mb-4 p-3" style={{ 
                                            backgroundColor: "#f8f9fa", 
                                            borderRadius: "8px",
                                            border: "1px solid #e9ecef"
                                        }}>
                                            <p className="mb-0 text-muted" style={{ fontSize: "0.95rem" }}>
                                                <i className="pi pi-info-circle me-2" style={{ color: "var(--primary-brown)" }}></i>
                                                La contraseña debe tener al menos 6 caracteres
                                            </p>
                                        </div>

                                        {/* Campo Nueva Contraseña */}
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className="pi pi-lock me-2"></i>
                                                Nueva Contraseña
                                            </label>
                                            <Password
                                                id='password'
                                                name='password'
                                                value={values.password}
                                                onChange={(e) => setFieldValue('password', e.target.value)}
                                                onBlur={handleBlur}
                                                placeholder="Ingresa tu nueva contraseña"
                                                toggleMask
                                                feedback={true}
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

                                        {/* Campo Confirmar Contraseña */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">
                                                <i className="pi pi-lock me-2"></i>
                                                Confirmar Contraseña
                                            </label>
                                            <Password
                                                id='confirm'
                                                name='confirm'
                                                value={values.confirm}
                                                onChange={(e) => setFieldValue('confirm', e.target.value)}
                                                onBlur={handleBlur}
                                                placeholder="Repite tu nueva contraseña"
                                                toggleMask
                                                feedback={false}
                                                className={`w-100 ${touched.confirm && errors.confirm ? 'p-invalid' : ''}`}
                                                inputClassName="w-100"
                                            />
                                            {touched.confirm && errors.confirm && (
                                                <small className="p-error d-block mt-1">
                                                    <i className="pi pi-exclamation-circle me-1"></i>
                                                    {errors.confirm}
                                                </small>
                                            )}
                                        </div>

                                        {/* Botón Guardar */}
                                        <Button
                                            type="submit"
                                            label={loading ? "Guardando..." : "Guardar Nueva Contraseña"}
                                            icon={loading ? "pi pi-spin pi-spinner" : 'pi pi-check'}
                                            className="btn-premium w-100 mb-3"
                                            disabled={loading}
                                        />

                                        <hr className="my-3" />

                                        {/* Link volver */}
                                        <Link to="/login">
                                            <Button
                                                label="Volver a Iniciar Sesión"
                                                icon="pi pi-arrow-left"
                                                className="p-button-text w-100"
                                                type="button"
                                            />
                                        </Link>
                                    </Form>
                                )}
                            </Formik>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default ResetPassword;