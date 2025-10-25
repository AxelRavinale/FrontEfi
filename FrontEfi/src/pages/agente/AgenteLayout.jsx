import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import { ConfirmDialog } from "primereact/confirmdialog";

// Importar páginas de agente
import AgenteDashboard from "./AgenteDashboard";
import AgenteProperties from "./AgenteProperties";
import AgenteClients from "./AgenteClients";
import AgenteRentals from "./AgenteRentals";
import AgenteSales from "./AgenteSales";

export default function AgenteLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverLogout, setHoverLogout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      icon: "📊",
      path: "/agente/dashboard",
    },
    {
      label: "Propiedades",
      icon: "🏢",
      path: "/agente/properties",
    },
    {
      label: "Clientes",
      icon: "👥",
      path: "/agente/clients",
    },
    {
      label: "Alquileres",
      icon: "🔑",
      path: "/agente/rentals",
    },
    {
      label: "Ventas",
      icon: "🛒",
      path: "/agente/sales",
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Estilos - Tema AGENTE (Verde/Natural)
  const navbarStyle = {
    background: "linear-gradient(to right, #1a3a2e, #225240)",
    borderBottom: "2px solid #2d5f4d",
    padding: "1rem 0",
    boxShadow: "0 4px 12px rgba(34, 82, 64, 0.3)",
  };

  const brandStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#7dd87d",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "transform 0.3s ease",
  };

  const agenteBadgeStyle = {
    background: "linear-gradient(135deg, #52b788 0%, #40916c 100%)",
    color: "white",
    fontSize: "0.7rem",
    padding: "3px 8px",
    borderRadius: "12px",
    fontWeight: "600",
    marginLeft: "8px",
    boxShadow: "0 2px 6px rgba(82, 183, 136, 0.4)",
  };

  const getButtonStyle = (index, isActiveBtn) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    border: "none",
    background: isActiveBtn 
      ? "linear-gradient(135deg, #52b788 0%, #40916c 100%)"
      : hoveredItem === index 
        ? "linear-gradient(135deg, #52b788 0%, #40916c 100%)"
        : "transparent",
    borderRadius: "12px",
    color: isActiveBtn || hoveredItem === index ? "white" : "#b7e4c7",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: isActiveBtn || hoveredItem === index 
      ? "0 4px 12px rgba(82, 183, 136, 0.4)" 
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
    background: "linear-gradient(135deg, #52b788 0%, #40916c 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: "600",
    border: "2px solid #2d5f4d",
    color: "white",
    boxShadow: "0 2px 8px rgba(82, 183, 136, 0.5)",
  };

  const logoutButtonStyle = {
    padding: "10px 24px",
    background: hoverLogout
      ? "linear-gradient(135deg, #40916c 0%, #2d6a4f 100%)"
      : "linear-gradient(135deg, #52b788 0%, #40916c 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(82, 183, 136, 0.4)",
    transform: hoverLogout ? "translateY(-2px)" : "translateY(0)",
    cursor: "pointer",
  };

  const userInfoStyle = {
    color: "#b7e4c7",
    fontSize: "0.9rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const darkModeToggleStyle = {
    background: darkMode ? "#52b788" : "rgba(82, 183, 136, 0.2)",
    border: "2px solid #52b788",
    borderRadius: "20px",
    padding: "8px 16px",
    color: darkMode ? "white" : "#52b788",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  return (
    <>
      {/* Navbar Moderno - Agente */}
      <nav style={navbarStyle}>
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            {/* Logo/Marca con badge Agente */}
            <a href="#" style={brandStyle}>
              <span style={{ fontSize: "1.8rem" }}>🏘️</span>
              <span>Inmobiliaria</span>
              <span style={agenteBadgeStyle}>AGENTE</span>
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

            {/* Usuario, Dark Mode y Salir */}
            <div className="d-none d-lg-flex align-items-center gap-3">
              {/* Toggle Modo Oscuro */}
              <button
                style={darkModeToggleStyle}
                onClick={() => setDarkMode(!darkMode)}
              >
                <span>{darkMode ? "🌙" : "☀️"}</span>
                <span>{darkMode ? "Oscuro" : "Claro"}</span>
              </button>

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
              data-bs-target="#mobileMenuAgente"
              style={{
                border: "2px solid #52b788",
                borderRadius: "8px",
                color: "#7dd87d",
              }}
            >
              ☰
            </button>
          </div>

          {/* Menú desplegable móvil */}
          <div className="collapse d-lg-none mt-3" id="mobileMenuAgente">
            <div className="d-flex flex-column gap-2">
              {/* Toggle modo oscuro móvil */}
              <button
                style={{ ...darkModeToggleStyle, width: "100%", justifyContent: "center" }}
                onClick={() => setDarkMode(!darkMode)}
              >
                <span>{darkMode ? "🌙" : "☀️"}</span>
                <span>{darkMode ? "Modo Oscuro" : "Modo Claro"}</span>
              </button>

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
                style={{ borderTop: "1px solid #2d5f4d" }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={avatarStyle}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={userInfoStyle}>{user?.name}</span>
                    <div style={agenteBadgeStyle}>AGENTE</div>
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

      {/* Contenido principal - Con modo oscuro */}
      <div
        className="container-fluid p-4"
        style={{
          minHeight: "calc(100vh - 80px)",
          background: darkMode 
            ? "linear-gradient(to bottom, #2d5f4d, #1b4332)"
            : "linear-gradient(to bottom, #d5f4e6, #a9dfbf)",
          transition: "background 0.3s ease",
        }}
      >
        <Routes>
          <Route path="/" element={<AgenteDashboard />} />
          <Route path="/dashboard" element={<AgenteDashboard />} />
          <Route path="/properties" element={<AgenteProperties />} />
          <Route path="/clients" element={<AgenteClients />} />
          <Route path="/rentals" element={<AgenteRentals />} />
          <Route path="/sales" element={<AgenteSales />} />
        </Routes>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      <ConfirmDialog />
    </>
  );
}