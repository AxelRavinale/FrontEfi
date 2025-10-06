import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import PrivateRoute from "./components/PrivateRoute";

// Importar páginas públicas
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

// Importar layouts
import AdminLayout from "./pages/admin/AdminLayout";
import AgenteLayout from "./pages/agente/AgenteLayout";
import ClienteLayout from "./pages/cliente/ClienteLayout";

// Importar estilos
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/premium.css";

function App() {
  return (
    <AppProviders>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin - Rutas protegidas */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        />

        {/* Agente - Rutas protegidas */}
        <Route
          path="/agente/*"
          element={
            <PrivateRoute allowedRoles={["agente", "admin"]}>
              <AgenteLayout />
            </PrivateRoute>
          }
        />

        {/* Cliente - Rutas protegidas */}
        <Route
          path="/cliente/*"
          element={
            <PrivateRoute allowedRoles={["cliente"]}>
              <ClienteLayout />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppProviders>
  );
}

export default App;