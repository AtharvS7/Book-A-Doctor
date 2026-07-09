import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import moment from "moment";
import api from "../config";
import { getUser, clearSession } from "../auth";
import AdminAppointments from "../components/AdminAppointments";

const initial = (name) => (name ? name.trim().charAt(0).toUpperCase() : "A");

export default function AdminHome() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const user = getUser();
  const [section, setSection] = useState("doctors");
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDoctors = useCallback(async () => {
    const { data } = await api.get("/api/admin/getalldoctors");
    setDoctors(data.data || []);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await api.get("/api/admin/getallusers");
    setUsers(data.data || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadDoctors(), loadUsers()]);
      } catch {
        message.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadDoctors, loadUsers, message]);

  const decide = async (doctor, approve) => {
    try {
      await api.post(approve ? "/api/admin/getapprove" : "/api/admin/getreject", {
        doctorId: doctor._id,
        status: approve ? "approved" : "rejected",
        userId: doctor.userId,
      });
      message.success(`Doctor ${approve ? "approved" : "rejected"}`);
      loadDoctors();
    } catch {
      message.error("Action failed");
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  const pending = doctors.filter((d) => d.status === "pending").length;

  const nav = [
    { key: "doctors", label: "Doctor Approvals", icon: "🩺" },
    { key: "users", label: "All Users", icon: "👥" },
    { key: "appointments", label: "All Appointments", icon: "📅" },
  ];

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="brand">🛡️ Admin Panel</div>
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
            <div className="who">{user?.fullName}</div>
            <small style={{ color: "var(--muted)" }}>Administrator</small>
          </div>
          <div className="avatar-chip">{initial(user?.fullName)}</div>
        </div>

        <div className="dash-body">
          {loading ? (
            <div className="spinner" />
          ) : (
            <>
              <div className="stat-cards">
                <div className="stat-card card-soft">
                  <div className="n">{users.length}</div>
                  <div className="l">Total users</div>
                </div>
                <div className="stat-card card-soft">
                  <div className="n">{doctors.length}</div>
                  <div className="l">Doctors</div>
                </div>
                <div className="stat-card card-soft">
                  <div className="n">{pending}</div>
                  <div className="l">Pending approvals</div>
                </div>
              </div>

              {section === "doctors" && (
                <>
                  <h2 className="section-title">Doctor applications</h2>
                  <p className="section-sub">Approve or reject doctor requests.</p>
                  {doctors.length === 0 ? (
                    <div className="empty card-soft">No doctor applications yet.</div>
                  ) : (
                    <div className="tbl-wrap fade-up">
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Specialization</th>
                            <th>Experience</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctors.map((d) => (
                            <tr key={d._id}>
                              <td>Dr. {d.fullName}</td>
                              <td>{d.specialization}</td>
                              <td>{d.experience}</td>
                              <td>{d.phone}</td>
                              <td>
                                <span className={`badge-pill badge-${d.status}`}>{d.status}</span>
                              </td>
                              <td>
                                {d.status === "pending" ? (
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button className="btn-ok" onClick={() => decide(d, true)}>
                                      Approve
                                    </button>
                                    <button className="btn-danger" onClick={() => decide(d, false)}>
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ color: "var(--muted)" }}>—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {section === "users" && (
                <>
                  <h2 className="section-title">All users</h2>
                  <p className="section-sub">Everyone registered on the platform.</p>
                  <div className="tbl-wrap fade-up">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Type</th>
                          <th>Doctor?</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id}>
                            <td>{u.fullName}</td>
                            <td>{u.email}</td>
                            <td style={{ textTransform: "capitalize" }}>{u.type}</td>
                            <td>{u.isdoctor ? "✅" : "—"}</td>
                            <td>{moment(u.createdAt).format("MMM DD, YYYY")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {section === "appointments" && (
                <>
                  <h2 className="section-title">All appointments</h2>
                  <p className="section-sub">Every booking across the platform.</p>
                  <AdminAppointments />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
