import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import api from "../config";
import { getUser, setSession, getToken, clearSession } from "../auth";
import DoctorList from "../components/DoctorList";
import UserAppointments from "../components/UserAppointments";
import DoctorAppointments from "../components/DoctorAppointments";
import ApplyDoctor from "../pages/ApplyDoctor";
import Notification from "../components/Notification";

const initial = (name) => (name ? name.trim().charAt(0).toUpperCase() : "U");

export default function UserHome() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const [user, setUser] = useState(getUser());
  const [section, setSection] = useState("home");

  // Refresh the user's data (isdoctor flag + notifications) from the server.
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.post("/api/user/getuserdata", {});
      setUser(data.data);
      setSession(getToken(), data.data);
    } catch {
      /* interceptor handles 401 */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = () => {
    clearSession();
    message.success("Logged out");
    navigate("/login");
  };

  const unreadCount = user?.notification?.length || 0;

  const nav = [
    { key: "home", label: "Find Doctors", icon: "🔎" },
    { key: "appointments", label: "My Appointments", icon: "📅" },
    ...(user?.isdoctor
      ? [{ key: "requests", label: "Appointment Requests", icon: "🩺" }]
      : [{ key: "apply", label: "Apply as Doctor", icon: "➕" }]),
    { key: "notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="brand">🩺 Book a Doctor</div>
        {nav.map((n) => (
          <div
            key={n.key}
            className={`nav-item ${section === n.key ? "active" : ""}`}
            onClick={() => setSection(n.key)}
          >
            <span>{n.icon}</span>
            {n.label}
          </div>
        ))}
        <div className="nav-item" onClick={logout} style={{ marginTop: 12 }}>
          <span>↩</span> Logout
        </div>
      </aside>

      <main className="dash-main">
        <div className="topbar">
          <div>
            <div className="who">
              {user?.isdoctor ? "Dr. " : ""}
              {user?.fullName}
            </div>
            <small style={{ color: "var(--muted)" }}>
              {user?.isdoctor ? "Doctor account" : "Patient account"}
            </small>
          </div>
          <div className="top-right">
            <div className="bell" onClick={() => setSection("notifications")} title="Notifications">
              🔔
              {unreadCount > 0 && <span className="count">{unreadCount}</span>}
            </div>
            <div className="avatar-chip">{initial(user?.fullName)}</div>
          </div>
        </div>

        <div className="dash-body">
          {section === "home" && (
            <>
              <h2 className="section-title">Find a doctor</h2>
              <p className="section-sub">Browse approved specialists and book instantly.</p>
              <DoctorList />
            </>
          )}
          {section === "appointments" && (
            <>
              <h2 className="section-title">My appointments</h2>
              <p className="section-sub">Track the status of every booking.</p>
              <UserAppointments />
            </>
          )}
          {section === "requests" && user?.isdoctor && (
            <>
              <h2 className="section-title">Appointment requests</h2>
              <p className="section-sub">Approve or reject incoming patient bookings.</p>
              <DoctorAppointments />
            </>
          )}
          {section === "apply" && !user?.isdoctor && (
            <>
              <h2 className="section-title">Apply to become a doctor</h2>
              <p className="section-sub">Submit your details for admin approval.</p>
              <ApplyDoctor
                user={user}
                onApplied={() => {
                  refresh();
                  setSection("appointments");
                }}
              />
            </>
          )}
          {section === "notifications" && (
            <>
              <h2 className="section-title">Notifications</h2>
              <p className="section-sub">Stay updated on your applications and appointments.</p>
              <Notification user={user} refresh={refresh} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
