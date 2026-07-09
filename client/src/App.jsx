import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserHome from "./pages/UserHome";
import AdminHome from "./pages/AdminHome";

export default function App() {
  return (
    <AntdApp>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/userhome"
            element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminhome"
            element={
              <ProtectedRoute requireType="admin">
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AntdApp>
  );
}
