import { useEffect, useMemo, useState } from "react";
import { Modal, DatePicker, Upload, App as AntdApp } from "antd";
import api from "../config";

const initial = (name) => (name ? name.trim().charAt(0).toUpperCase() : "D");

export default function DoctorList() {
  const { message } = AntdApp.useApp();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("");

  // Booking modal state
  const [active, setActive] = useState(null); // doctor being booked
  const [date, setDate] = useState(null);
  const [file, setFile] = useState(null);
  const [booking, setBooking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/user/getalldoctorsu");
      setDoctors(data.data || []);
    } catch {
      message.error("Could not load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const specialties = useMemo(
    () => [...new Set(doctors.map((d) => d.specialization).filter(Boolean))],
    [doctors]
  );

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    const matchesText =
      d.fullName?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.address?.toLowerCase().includes(q);
    const matchesSpec = !spec || d.specialization === spec;
    return matchesText && matchesSpec;
  });

  const book = async () => {
    if (!date) return message.warning("Please pick a date and time");
    setBooking(true);
    try {
      const fd = new FormData();
      fd.append("doctorId", active._id);
      fd.append("date", date.toISOString());
      if (file) fd.append("image", file);
      await api.post("/api/user/getappointment", fd);
      message.success("Appointment booked! Awaiting doctor approval.");
      setActive(null);
      setDate(null);
      setFile(null);
    } catch (err) {
      message.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-up">
      <div className="filter-bar">
        <input
          placeholder="Search by name, specialty or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={spec} onChange={(e) => setSpec(e.target.value)}>
          <option value="">All specialties</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty card-soft">No approved doctors match your search yet.</div>
      ) : (
        <div className="doc-grid">
          {filtered.map((d) => (
            <div key={d._id} className="doc-card card-soft">
              <div className="doc-head">
                <div className="doc-avatar">{initial(d.fullName)}</div>
                <div>
                  <h3 style={{ fontSize: "1.05rem" }}>Dr. {d.fullName}</h3>
                  <span className="badge-pill badge-approved">{d.specialization}</span>
                </div>
              </div>
              <div className="doc-meta">📍 {d.address}</div>
              <div className="doc-meta">🎓 {d.experience} experience</div>
              <div className="doc-meta">
                🕒 {Array.isArray(d.timings) ? d.timings.join(" – ") : d.timings}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 14,
                }}
              >
                <strong style={{ color: "var(--brand-dark)" }}>₹{d.fees}</strong>
                <button className="btn-brand btn-sm" onClick={() => setActive(d)}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={active ? `Book with Dr. ${active.fullName}` : ""}
        open={Boolean(active)}
        onCancel={() => setActive(null)}
        okText={booking ? "Booking…" : "Confirm Booking"}
        confirmLoading={booking}
        onOk={book}
      >
        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Pick a date & time and optionally attach a medical document.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            Date & time
          </label>
          <DatePicker
            showTime
            format="YYYY-MM-DD hh:mm A"
            style={{ width: "100%" }}
            value={date}
            onChange={setDate}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
            Document (optional)
          </label>
          <Upload
            beforeUpload={(f) => {
              setFile(f);
              return false; // prevent auto-upload; we send it manually
            }}
            maxCount={1}
            onRemove={() => setFile(null)}
          >
            <button className="btn-ghost btn-sm" type="button">
              📎 Select file
            </button>
          </Upload>
        </div>
      </Modal>
    </div>
  );
}
