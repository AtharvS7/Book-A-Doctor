import { useEffect, useState } from "react";
import { App as AntdApp } from "antd";
import moment from "moment";
import api from "../config";

export default function AdminAppointments() {
  const { message } = AntdApp.useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/admin/getallAppointmentsAdmin");
        setRows(data.data || []);
      } catch {
        message.error("Could not load appointments");
      } finally {
        setLoading(false);
      }
    })();
  }, [message]);

  if (loading) return <div className="spinner" />;
  if (rows.length === 0)
    return <div className="empty card-soft">No appointments on the platform yet.</div>;

  return (
    <div className="tbl-wrap fade-up">
      <table className="tbl">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a._id}>
              <td>{a.userInfo?.fullName}</td>
              <td>Dr. {a.doctorInfo?.fullName}</td>
              <td>{moment(a.date).format("MMM DD, YYYY hh:mm A")}</td>
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
