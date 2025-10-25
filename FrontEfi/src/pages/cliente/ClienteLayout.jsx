import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverLogout, setHoverLogout] = useState(false);

  const menuItems = [
    {
      label: "Inicio",
      icon: "🏡",
      path: "/cliente/dashboard",
    },
    {
      label: "Propiedades",
      icon: "🏠",
      path: "/cliente/propiedades",
    },
    {
      label: "Mis Alquileres",
      icon: "🔑",
      path: "/cliente/alquileres",
    },
    {
      label: "Mis Compras",
      icon: "🛍️",
      path: "/cliente/compras",
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Estilos - Tema CLIENTE (Terracota/Cálido)
  const navbarStyle = {
    background: "linear-gradient(to right, #3d2817, #5a3d2b)",
    borderBottom: "2px solid #8b6f47",
    padding: "1rem 0",
    boxShadow: "0 4px 12px rgba(61, 40, 23, 0.3)",
  };

  const brandStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "white",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "transform 0.3s ease",
  };

  const clienteBadgeStyle = {
    background: "linear-gradient(135deg, #ba4a00 0%, #a04000 100%)",
    color: "white",
    fontSize: "0.7rem",
    padding: "3px 8px",
    borderRadius: "12px",
    fontWeight: "600",
    marginLeft: "8px",
    boxShadow: "0 2px 6px rgba(186, 74, 0, 0.4)",
  };

  const getButtonStyle = (index, isActiveBtn) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    border: "none",
    background: isActiveBtn 
      ? "linear-gradient(135deg, #ba4a00 0%, #a04000 100%)"
      : hoveredItem === index 
        ? "linear-gradient(135deg, #ba4a00 0%, #a04000 100%)"
        : "transparent",
    borderRadius: "12px",
    color: isActiveBtn || hoveredItem === index ? "white" : "#fef5e7",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: isActiveBtn || hoveredItem === index 
      ? "0 4px 12px rgba(186, 74, 0, 0.4)" 
      : "none",
    transform: hoveredItem === index ? "translateY(-2px)" : "translateY(0)",
  });

  const iconStyle = (index) => ({
    fontSize: "1.2rem",
    display: "inline-block",
    transition: "transform 0.3s ease",
    transform: hoveredItem === index ? "scale(1.2) rotate(5deg)" : "scale(1)",
  });

  const avatarStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ba4a00 0%, #a04000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: "600",
    border: "2px solid #873600",
    color: "white",
    boxShadow: "0 2px 8px rgba(186, 74, 0, 0.5)",
  };

  const logoutButtonStyle = {
    padding: "10px 24px",
    background: hoverLogout
      ? "linear-gradient(135deg, #a04000 0%, #873600 100%)"
      : "linear-gradient(135deg, #ba4a00 0%, #a04000 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(186, 74, 0, 0.4)",
    transform: hoverLogout ? "translateY(-2px)" : "translateY(0)",
    cursor: "pointer",
  };

  const userInfoStyle = {
    color: "white",
    fontSize: "0.9rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <>
      {/* Navbar Moderno - Cliente */}
      <nav style={navbarStyle}>
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            {/* Logo/Marca con badge Cliente */}
            <a href="#" style={brandStyle}>
              <span style={{ fontSize: "1.8rem" }}>🏘️</span>
              <span>Inmobiliaria</span>
              <span style={clienteBadgeStyle}>CLIENTE</span>
            </a>

            {/* Menú de navegación - Desktop */}
            <div className="d-none d-lg-flex align-items-center gap-2 flex-grow-1 justify-content-center">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  style={getButtonStyle(index, isActive(item.path))}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span style={iconStyle(index)}>{item.icon}</span>
                  <span style={{ fontSize: "0.95rem" }}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Usuario y Salir */}
            <div className="d-none d-lg-flex align-items-center gap-3">
              <span style={userInfoStyle}>
                <span>👤</span>
                <span>{user?.name}</span>
              </span>
              <div style={avatarStyle}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button
                style={logoutButtonStyle}
                onClick={logout}
                onMouseEnter={() => setHoverLogout(true)}
                onMouseLeave={() => setHoverLogout(false)}
              >
                <span>🚪</span>
                <span>Salir</span>
              </button>
            </div>

            {/* Menú móvil - Hamburguesa */}
            <button
              className="btn d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mobileMenuCliente"
              style={{
                border: "2px solid #ba4a00",
                borderRadius: "8px",
                color: "white",
              }}
            >
              ☰
            </button>
          </div>

          {/* Menú desplegable móvil */}
          <div className="collapse d-lg-none mt-3" id="mobileMenuCliente">
            <div className="d-flex flex-column gap-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  style={{
                    ...getButtonStyle(index, isActive(item.path)),
                    justifyContent: "flex-start",
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid #ca6f1e" }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={avatarStyle}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={userInfoStyle}>{user?.name}</span>
                    <div style={clienteBadgeStyle}>CLIENTE</div>
                  </div>
                </div>
                <button
                  style={{ ...logoutButtonStyle, width: "100%" }}
                  onClick={logout}
                >
                  <span>🚪</span>
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal - Fondo claro cálido para Cliente */}
      <div
        className="container-fluid p-4"
        style={{
          minHeight: "calc(100vh - 80px)",
          background: "linear-gradient(to bottom, #fdebd0, #fadbd8)",
        }}
      >
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