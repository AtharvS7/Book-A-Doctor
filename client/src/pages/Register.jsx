import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import api from "../config";

export default function Register() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    type: "user",
  });
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      return message.warning("Name, email and password are required");
    }
    if (form.password.length < 6) {
      return message.warning("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await api.post("/api/user/register", form);
      message.success("Registered! Please sign in.");
      navigate("/login");
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <h1>Join Book a Doctor today</h1>
        <p style={{ opacity: 0.9, fontSize: "1.05rem" }}>
          Create an account to book appointments, apply as a doctor, or administer the
          platform.
        </p>
        <ul>
          <li>✓ Free to get started</li>
          <li>✓ Book with document uploads</li>
          <li>✓ Apply to become a verified doctor</li>
        </ul>
      </aside>

      <div className="auth-form-side">
        <form className="auth-card fade-up" onSubmit={submit}>
          <h2 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Create account</h2>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>
            Choose how you want to use the platform.
          </p>

          <div className="role-toggle">
            <div
              className={`role-opt ${form.type === "user" ? "sel" : ""}`}
              onClick={() => setForm({ ...form, type: "user" })}
            >
              🧑 Patient
            </div>
            <div
              className={`role-opt ${form.type === "admin" ? "sel" : ""}`}
              onClick={() => setForm({ ...form, type: "admin" })}
            >
              🛡️ Admin
            </div>
          </div>

          <div className="field">
            <label>Full name</label>
            <input name="fullName" value={form.fullName} onChange={change} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={change} placeholder="Optional" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={change} placeholder="At least 6 characters" />
          </div>

          <button className="btn-brand" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <p style={{ textAlign: "center", marginTop: 18, color: "var(--muted)" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "var(--brand-dark)", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
