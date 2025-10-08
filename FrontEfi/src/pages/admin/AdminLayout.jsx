import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { ToastContainer } from "react-toastify";
import { ConfirmDialog } from "primereact/confirmdialog";

// Importar páginas de admin
import AdminDashboard from "./AdminDashboard";
import AdminProperties from "./AdminProperties";
import AdminClients from "./AdminClients";
import AdminUsers from "./AdminUsers";
import AdminRentals from "./AdminRentals";
import AdminSales from "./AdminSales";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: "pi pi-home",
      command: () => navigate("/admin/dashboard"),
    },
    {
      label: "Propiedades",
      icon: "pi pi-building",
      command: () => navigate("/admin/properties"),
    },
    {
      label: "Clientes",
      icon: "pi pi-users",
      command: () => navigate("/admin/clients"),
    },
    {
      label: "Usuarios",
      icon: "pi pi-user",
      command: () => navigate("/admin/users"),
    },
    {
      label: "Alquileres",
      icon: "pi pi-key",
      command: () => navigate("/admin/rentals"),
    },
    {
      label: "Ventas",
      icon: "pi pi-shopping-cart",
      command: () => navigate("/admin/sales"),
    },
  ];

  const endContent = (
    <div className="d-flex align-items-center gap-3">
      <span className="text-muted">
        <i className="pi pi-user me-2"></i>
        {user?.name}
      </span>
      <Avatar
        label={user?.name?.charAt(0).toUpperCase()}
        shape="circle"
        style={{ background: "var(--gold)", color: "white" }}
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
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      />
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 70px)" }}>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/properties" element={<AdminProperties />} />
          <Route path="/clients" element={<AdminClients />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/rentals" element={<AdminRentals />} />
          <Route path="/sales" element={<AdminSales />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <ConfirmDialog />
    </>
  );
}