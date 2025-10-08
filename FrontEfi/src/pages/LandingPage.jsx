import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background:
          "linear-gradient(135deg, rgba(107, 68, 35, 0.95), rgba(45, 80, 22, 0.95))",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Patrón de fondo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(212, 175, 55, 0.05) 2px, rgba(212, 175, 55, 0.05) 4px)",
          animation: "patternMove 20s linear infinite",
        }}
      ></div>

      <Card
        className="premium-card p-5 text-center fade-in-up"
        style={{
          maxWidth: "600px",
          position: "relative",
          zIndex: 2,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="mb-4">
          <i
            className="pi pi-home"
            style={{
              fontSize: "5rem",
              background:
                "linear-gradient(135deg, var(--gold), var(--light-gold))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          ></i>
        </div>

        <h1
          className="elegant-title mb-3"
          style={{ fontSize: "3rem", color: "var(--primary-brown)" }}
        >
          Bienvenido a Inmobiliaria Efi
        </h1>

        <p
          className="lead text-muted mb-4"
          style={{ fontSize: "1.3rem", lineHeight: "1.8" }}
        >
          Tu sistema de gestión de propiedades y alquileres. Explora las
          propiedades disponibles o inicia sesión para gestionar tu cuenta.
        </p>

        <div className="d-flex flex-column gap-3 mt-5">
          <Button
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            className="btn-premium p-3"
            style={{ fontSize: "1.1rem" }}
            onClick={() => navigate("/login")}
          />

          <Button
            label="Crear Cuenta"
            icon="pi pi-user-plus"
            className="p-button-outlined p-3"
            style={{
              fontSize: "1.1rem",
              borderColor: "var(--primary-brown)",
              color: "var(--primary-brown)",
            }}
            onClick={() => navigate("/register")}
          />

          <Button
            label="Explorar Propiedades"
            icon="pi pi-search"
            className="p-button-text p-3"
            style={{ fontSize: "1rem", color: "var(--sage-green)" }}
            onClick={() => navigate("/")}
          />
        </div>

        <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
          <div className="row text-center">
            <div className="col-4">
              <h4 style={{ color: "var(--gold)", fontWeight: "700" }}>500+</h4>
              <small className="text-muted">Propiedades</small>
            </div>
            <div className="col-4">
              <h4 style={{ color: "var(--sage-green)", fontWeight: "700" }}>
                1000+
              </h4>
              <small className="text-muted">Clientes</small>
            </div>
            <div className="col-4">
              <h4 style={{ color: "var(--primary-brown)", fontWeight: "700" }}>
                15+
              </h4>
              <small className="text-muted">Años</small>
            </div>
          </div>
        </div>
      </Card>

      {/* Partículas flotantes decorativas */}
      <style>
        {`
          @keyframes patternMove {
            0% { transform: translateX(-20px); }
            100% { transform: translateX(20px); }
          }
        `}
      </style>
    </div>
  );
}

export default LandingPage;