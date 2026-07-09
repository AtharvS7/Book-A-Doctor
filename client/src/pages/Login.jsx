import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import api from "../config";
import { setSession } from "../auth";

export default function Login() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return message.warning("Please fill in all fields");
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/user/login", form);
      setSession(data.token, data.data);
      message.success("Welcome back!");
      navigate(data.data.type === "admin" ? "/adminhome" : "/userhome");
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <h1>Welcome back to Book a Doctor</h1>
        <p style={{ opacity: 0.9, fontSize: "1.05rem" }}>
          Sign in to manage appointments, browse specialists, and stay on top of your care.
        </p>
        <ul>
          <li>✓ Track appointment status in real time</li>
          <li>✓ Secure, JWT-protected sessions</li>
          <li>✓ One account for patients and doctors</li>
        </ul>
      </aside>

      <div className="auth-form-side">
        <form className="auth-card fade-up" onSubmit={submit}>
          <h2 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Sign in</h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Enter your credentials to continue.
          </p>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              placeholder="••••••••"
            />
          </div>

          <button className="btn-brand" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p style={{ textAlign: "center", marginTop: 18, color: "var(--muted)" }}>
            New here?{" "}
            <Link to="/register" style={{ color: "var(--brand-dark)", fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
