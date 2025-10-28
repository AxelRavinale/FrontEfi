import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { ToastContainer } from "react-toastify";
import { ConfirmDialog } from "primereact/confirmdialog";

// Importar páginas de cliente
import ClienteDashboard from "./ClienteDashboard";
import ClientePropiedades from "./ClientePropiedades";
import ClienteMisAlquileres from "./ClienteMisAlquileres";
import ClienteMisCompras from "./ClienteMisCompras";

export default function ClienteLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Inicio",
      icon: "pi pi-home",
      command: () => navigate("/cliente/dashboard"),
    },
    {
      label: "Propiedades",
      icon: "pi pi-building",
      command: () => navigate("/cliente/propiedades"),
    },
    {
      label: "Mis Alquileres",
      icon: "pi pi-key",
      command: () => navigate("/cliente/alquileres"),
    },
    {
      label: "Mis Compras",
      icon: "pi pi-shopping-cart",
      command: () => navigate("/cliente/compras"),
    },
  ];

  const endContent = (
    <div className="d-flex align-items-center gap-3">
      <span className="text-muted">
        <i className="pi pi-user me-2"></i>
        {user?.nombre} 
      </span>
      <Avatar
        label={user?.nombre?.charAt(0).toUpperCase()}
        shape="circle"
        style={{ background: "var(--forest-green)", color: "white" }}
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
          borderBottom: "1px solid rgba(45, 80, 22, 0.2)",
        }}
      />
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 70px)" }}>
        <Routes>
          <Route path="/" element={<ClienteDashboard />} />
          <Route path="/dashboard" element={<ClienteDashboard />} />
          <Route path="/propiedades" element={<ClientePropiedades />} />
          <Route path="/alquileres" element={<ClienteMisAlquileres />} />
          <Route path="/compras" element={<ClienteMisCompras />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <ConfirmDialog />
    </>
  );
}