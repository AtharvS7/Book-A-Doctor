import { useEffect, useState } from "react";
import { App as AntdApp } from "antd";
import moment from "moment";
import api from "../config";
import { downloadDocument } from "../download";

export default function UserAppointments() {
  const { message } = AntdApp.useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/user/getuserappointments");
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

  if (loading) return <div className="spinner" />;
  if (rows.length === 0)
    return <div className="empty card-soft">You haven't booked any appointments yet.</div>;

  return (
    <div className="tbl-wrap fade-up">
      <table className="tbl">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Specialty</th>
            <th>Date</th>
            <th>Document</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a._id}>
              <td>Dr. {a.doctorInfo?.fullName}</td>
              <td>{a.doctorInfo?.specialization}</td>
              <td>{moment(a.date).format("MMM DD, YYYY hh:mm A")}</td>
              <td>
                {a.document ? (
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => downloadDocument(a._id, a.document.originalname, message)}
                  >
                    ⬇ Download
                  </button>
                ) : (
                  <span style={{ color: "var(--muted)" }}>—</span>
                )}
              </td>
              <td>
                <span className={`badge-pill badge-${a.status}`}>{a.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
