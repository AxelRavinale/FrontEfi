import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
const isAuthenticated = false; // 🔴 de momento está hardcodeado
// Más adelante lo vamos a conectar con AuthContext

return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
