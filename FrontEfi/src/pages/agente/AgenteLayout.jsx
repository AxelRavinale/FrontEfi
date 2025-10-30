import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { ToastContainer } from "react-toastify";
import { ConfirmDialog } from "primereact/confirmdialog";

// Importar páginas de agente
import AgenteDashboard from "./AgenteDashboard";
import AgenteProperties from "./AgenteProperties";
import AgenteClients from "./AgenteClients";
import AgenteRentals from "./AgenteRentals";
import AgenteSales from "./AgenteSales";
import AgenteSolicitudes from "./AgenteSolicitudes";

export default function AgenteLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: "pi pi-home",
      command: () => navigate("/agente/dashboard"),
    },
    {
      label: "Propiedades",
      icon: "pi pi-building",
      command: () => navigate("/agente/properties"),
    },
    {
      label: "Clientes",
      icon: "pi pi-users",
      command: () => navigate("/agente/clients"),
    },
    {
      label: "Solicitudes",
      icon: "pi pi-inbox",
      command: () => navigate("/agente/solicitudes"),
      style: { 
        background: "linear-gradient(135deg, rgba(139, 111, 63, 0.1), rgba(45, 80, 22, 0.1))",
        fontWeight: "600",
        color: "var(--primary-brown)"
      }
    },
    {
      label: "Alquileres",
      icon: "pi pi-key",
      command: () => navigate("/agente/rentals"),
    },
    {
      label: "Ventas",
      icon: "pi pi-shopping-cart",
      command: () => navigate("/agente/sales"),
    },
  ];

  const endContent = (
    <div className="d-flex align-items-center gap-3">
      <span className="text-muted">
        <i className="pi pi-briefcase me-2"></i>
        Agente: {user?.nombre} 
      </span>
      <Avatar
        label={user?.nombre?.charAt(0).toUpperCase()}
        shape="circle"
        style={{ background: "var(--sage-green)", color: "white" }}
      />
      <button className="btn btn-premium" onClick={logout}>
        <i className="pi pi-sign-out me-2"></i>Salir
      </button>
    </div>
  );

  return (
    <>
      <Menubar
        model={menuItems}
        end={endContent}
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(135, 169, 107, 0.2)",
        }}
      />
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 70px)" }}>
        <Routes>
          <Route path="/" element={<AgenteDashboard />} />
          <Route path="/dashboard" element={<AgenteDashboard />} />
          <Route path="/properties" element={<AgenteProperties />} />
          <Route path="/clients" element={<AgenteClients />} />
          <Route path="/solicitudes" element={<AgenteSolicitudes />} />
          <Route path="/rentals" element={<AgenteRentals />} />
          <Route path="/sales" element={<AgenteSales />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <ConfirmDialog />
    </>
  );
}