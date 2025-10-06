import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-5">Cargando...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default PrivateRoute;