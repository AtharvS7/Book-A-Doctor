import { useEffect, useState } from "react";
import { App as AntdApp } from "antd";
import moment from "moment";
import api from "../config";
import { downloadDocument } from "../download";

export default function DoctorAppointments() {
  const { message } = AntdApp.useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/doctor/getdoctorappointments");
      setRows(data.data || []);
    } catch {
      message.error("Could not load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handle = async (appointmentId, status) => {
    try {
      await api.post("/api/doctor/handlestatus", { appointmentId, status });
      message.success(`Appointment ${status}`);
      load();
    } catch {
      message.error("Action failed");
    }
  };

  if (loading) return <div className="spinner" />;
  if (rows.length === 0)
    return <div className="empty card-soft">No appointment requests yet.</div>;

  return (
    <div className="tbl-wrap fade-up">
      <table className="tbl">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Document</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a._id}>
              <td>{a.userInfo?.fullName}</td>
              <td>{a.userInfo?.phone || "—"}</td>
              <td>{moment(a.date).format("MMM DD, YYYY hh:mm A")}</td>
              <td>
                {a.document ? (
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => downloadDocument(a._id, a.document.originalname, message)}
                  >
                    ⬇ View
                  </button>
                ) : (
                  <span style={{ color: "var(--muted)" }}>—</span>
                )}
              </td>
              <td>
                <span className={`badge-pill badge-${a.status}`}>{a.status}</span>
              </td>
              <td>
                {a.status === "pending" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ok" onClick={() => handle(a._id, "approved")}>
                      Approve
                    </button>
                    <button className="btn-danger" onClick={() => handle(a._id, "rejected")}>
                      Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "var(--muted)" }}>Done</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
