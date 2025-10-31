import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, var(--cream) 0%, var(--off-white) 100%)",
      }}
    >
      <Card className="premium-card p-5 text-center" style={{ maxWidth: "500px" }}>
        <i
          className="pi pi-lock"
          style={{ fontSize: "4rem", color: "var(--primary-brown)", marginBottom: "1rem" }}
        ></i>
        <h2 className="elegant-title mb-3">Acceso Denegado</h2>
        <p className="text-muted mb-4">
          No tienes permisos para acceder a esta sección.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Button
            label="Volver"
            icon="pi pi-arrow-left"
            className="p-button-text"
            onClick={() => navigate(-1)}
          />
          <Button
            label="Ir al Inicio"
            icon="pi pi-home"
            className="btn-premium"
            onClick={() => navigate("/")}
          />
        </div>
      </Card>
    </div>
  );
}
