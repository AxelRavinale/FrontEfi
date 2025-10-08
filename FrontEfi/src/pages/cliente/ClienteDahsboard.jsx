import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useProperties } from "../../contexts/PropertiesContext";
import { useRentals } from "../../contexts/RentalsContext";
import { useSales } from "../../contexts/SalesContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ClienteDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties } = useProperties();
  const { rentals } = useRentals();
  const { sales } = useSales();

  // Filtrar solo propiedades disponibles para el cliente
  const propiedadesDisponibles = properties.filter(
    (p) => p.estado === "disponible"
  );

  // Filtrar alquileres del usuario actual
  const misAlquileres = rentals.filter((r) => r.userId === user?.id);
  const alquileresActivos = misAlquileres.filter((r) => r.estado === "activo");

  // Filtrar ventas/compras del usuario actual
  const misCompras = sales.filter((s) => s.id_cliente === user?.id);
  const comprasFinalizadas = misCompras.filter((s) => s.estado === "finalizado");

  return (
    <div className="fade-in-up">
      <div className="mb-4">
        <h1 className="elegant-title">¡Bienvenido, {user?.name}! 👋</h1>
        <p className="text-muted">
          Encuentra tu propiedad ideal o gestiona tus operaciones
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <Card
            className="premium-card text-center h-100 cursor-pointer"
            onClick={() => navigate("/cliente/propiedades")}
            style={{
              background: "linear-gradient(135deg, #87A96B, #a0c184)",
              color: "white",
              border: "none",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <i
              className="pi pi-building mb-3"
              style={{ fontSize: "3rem", opacity: 0.9 }}
            ></i>
            <h2 className="mb-2" style={{ fontWeight: "700", fontSize: "2.5rem" }}>
              {propiedadesDisponibles.length}
            </h2>
            <p className="mb-0" style={{ fontSize: "1rem", opacity: 0.95 }}>
              Propiedades Disponibles
            </p>
          </Card>
        </div>

        <div className="col-md-3">
          <Card
            className="premium-card text-center h-100 cursor-pointer"
            onClick={() => navigate("/cliente/alquileres")}
            style={{
              background: "linear-gradient(135deg, #D4AF37, #E8C547)",
              color: "white",
              border: "none",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <i
              className="pi pi-key mb-3"
              style={{ fontSize: "3rem", opacity: 0.9 }}
            ></i>
            <h2 className="mb-2" style={{ fontWeight: "700", fontSize: "2.5rem" }}>
              {misAlquileres.length}
            </h2>
            <p className="mb-0" style={{ fontSize: "1rem", opacity: 0.95 }}>
              Mis Alquileres
            </p>
          </Card>
        </div>

        <div className="col-md-3">
          <Card
            className="premium-card text-center h-100 cursor-pointer"
            onClick={() => navigate("/cliente/compras")}
            style={{
              background: "linear-gradient(135deg, #8B6F3F, #a38a5c)",
              color: "white",
              border: "none",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <i
              className="pi pi-shopping-cart mb-3"
              style={{ fontSize: "3rem", opacity: 0.9 }}
            ></i>
            <h2 className="mb-2" style={{ fontWeight: "700", fontSize: "2.5rem" }}>
              {misCompras.length}
            </h2>
            <p className="mb-0" style={{ fontSize: "1rem", opacity: 0.95 }}>
              Mis Compras
            </p>
          </Card>
        </div>

        <div className="col-md-3">
          <Card
            className="premium-card text-center h-100"
            style={{
              background: "linear-gradient(135deg, #2D5016, #3d6a1f)",
              color: "white",
              border: "none",
            }}
          >
            <i
              className="pi pi-check-circle mb-3"
              style={{ fontSize: "3rem", opacity: 0.9 }}
            ></i>
            <h2 className="mb-2" style={{ fontWeight: "700", fontSize: "2.5rem" }}>
              {alquileresActivos.length}
            </h2>
            <p className="mb-0" style={{ fontSize: "1rem", opacity: 0.95 }}>
              Alquileres Activos
            </p>
          </Card>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Card className="premium-card h-100">
            <div className="d-flex align-items-center mb-3">
              <i
                className="pi pi-search me-3"
                style={{ fontSize: "2rem", color: "var(--sage-green)" }}
              ></i>
              <div>
                <h4 style={{ color: "var(--primary-brown)", marginBottom: "0.25rem" }}>
                  Buscar Propiedades
                </h4>
                <p className="text-muted mb-0">
                  Explora nuestro catálogo completo
                </p>
              </div>
            </div>
            <Button
              label="Ver Propiedades"
              icon="pi pi-arrow-right"
              className="btn-premium w-100"
              onClick={() => navigate("/cliente/propiedades")}
            />
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="premium-card h-100">
            <div className="d-flex align-items-center mb-3">
              <i
                className="pi pi-bookmark me-3"
                style={{ fontSize: "2rem", color: "var(--gold)" }}
              ></i>
              <div>
                <h4 style={{ color: "var(--primary-brown)", marginBottom: "0.25rem" }}>
                  Mis Operaciones
                </h4>
                <p className="text-muted mb-0">
                  Revisa tus alquileres y compras
                </p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button
                label="Alquileres"
                icon="pi pi-key"
                className="p-button-outlined flex-1"
                style={{ borderColor: "var(--sage-green)", color: "var(--sage-green)" }}
                onClick={() => navigate("/cliente/alquileres")}
              />
              <Button
                label="Compras"
                icon="pi pi-shopping-cart"
                className="p-button-outlined flex-1"
                style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
                onClick={() => navigate("/cliente/compras")}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Información adicional */}
      <div className="row">
        <div className="col-12">
          <Card
            className="premium-card text-center p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(135, 169, 107, 0.1), rgba(212, 175, 55, 0.1))",
              border: "2px solid var(--sage-green)",
            }}
          >
            <i
              className="pi pi-info-circle mb-3"
              style={{ fontSize: "3rem", color: "var(--sage-green)" }}
            ></i>
            <h4 style={{ color: "var(--primary-brown)", fontWeight: "600" }}>
              ¿Necesitas ayuda?
            </h4>
            <p className="text-muted mb-3">
              Nuestro equipo está disponible para ayudarte en todo el proceso de
              alquiler o compra de tu propiedad ideal.
            </p>
            <Button
              label="Contactar Soporte"
              icon="pi pi-phone"
              className="btn-premium"
              onClick={() => {
                window.location.href = "mailto:soporte@inmobiliaria.com";
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}