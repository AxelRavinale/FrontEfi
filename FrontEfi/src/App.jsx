import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* Admin */}
      <Route path="/admin/*" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminLayout />
        </PrivateRoute>
      } />
      
      {/* Agente */}
      <Route path="/agente/*" element={
        <PrivateRoute allowedRoles={['agente', 'admin']}>
          <AgenteLayout />
        </PrivateRoute>
      } />
      
      {/* Cliente */}
      <Route path="/cliente/*" element={
        <PrivateRoute allowedRoles={['cliente']}>
          <ClienteLayout />
        </PrivateRoute>
      } />
    </Routes>
  );
}
