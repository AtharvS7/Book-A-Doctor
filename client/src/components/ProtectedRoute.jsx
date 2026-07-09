import { Navigate } from "react-router-dom";
import { isLoggedIn, getUser } from "../auth";

// Guards authenticated routes. Optionally restricts to a user type ("admin").
export default function ProtectedRoute({ children, requireType }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (requireType && getUser()?.type !== requireType) {
    return <Navigate to="/userhome" replace />;
  }
  return children;
}
