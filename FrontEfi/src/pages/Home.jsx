import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
    <div className="p-5 bg-white shadow rounded">
        <h1 className="fw-bold mb-3">
        Bienvenido a <span className="text-primary">🏢 Inmobiliaria 🏠</span>
        </h1>
        <p className="lead text-secondary mb-4">
        Esta es tu plataforma principal. Desde aquí vas a poder navegar,
        iniciar sesión o simplemente explorar la aplicación.
        </p>

        <div className="d-flex gap-3 justify-content-center">
        <Link to="/login" className="btn btn-primary btn-lg">
            Iniciar Sesión
        </Link>
        <Link to="/register" className="btn btn-outline-primary btn-lg">
            Registrarse
        </Link>
        </div>
    </div>
    </div>
);
}

export default Home;


