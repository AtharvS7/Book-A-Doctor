import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, getUser } from "../auth";

const Logo = () => (
  <div className="logo">
    <span className="logo-mark">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-7-4.3-9.3-9C1.2 8.8 3 5.5 6.3 5.5c1.9 0 3.2 1 3.7 2.2h4c.5-1.2 1.8-2.2 3.7-2.2 3.3 0 5.1 3.3 3.6 6.5C19 16.7 12 21 12 21z"
          fill="#fff"
        />
      </svg>
    </span>
    Book&nbsp;a&nbsp;Doctor
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const goDash = () => {
    const u = getUser();
    navigate(u?.type === "admin" ? "/adminhome" : "/userhome");
  };

  return (
    <div className="page-wrap">
      <nav className="pub-nav">
        <Logo />
        <div style={{ display: "flex", gap: 12 }}>
          {isLoggedIn() ? (
            <button className="btn-brand" onClick={goDash}>
              Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-brand">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="fade-up">
          <span className="badge-pill badge-approved">Trusted healthcare, on demand</span>
          <h1 style={{ marginTop: 16 }}>
            Book the right doctor, <br /> at the right time.
          </h1>
          <p className="lead">
            Browse verified specialists, check availability, and book appointments with
            your medical documents — all in one calm, secure place.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/register" className="btn-brand">
              Find a Doctor
            </Link>
            <Link to="/login" className="btn-ghost">
              I have an account
            </Link>
          </div>
          <div className="stat-row">
            <div className="stat">
              <h3>500+</h3>
              <span>Verified doctors</span>
            </div>
            <div className="stat">
              <h3>30k+</h3>
              <span>Appointments booked</span>
            </div>
            <div className="stat">
              <h3>4.9★</h3>
              <span>Patient rating</span>
            </div>
          </div>
        </div>
        <div className="hero-art fade-up">
          <svg width="220" height="220" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s-7-4.3-9.3-9C1.2 8.8 3 5.5 6.3 5.5c1.9 0 3.2 1 3.7 2.2h4c.5-1.2 1.8-2.2 3.7-2.2 3.3 0 5.1 3.3 3.6 6.5C19 16.7 12 21 12 21z"
              fill="#0f766e"
            />
          </svg>
        </div>
      </header>

      <section id="about">
        <h2 className="section-title" style={{ textAlign: "center", fontSize: "1.8rem" }}>
          Everything you need for care
        </h2>
        <p className="section-sub" style={{ textAlign: "center" }}>
          A complete platform for patients, doctors, and administrators.
        </p>
        <div className="features">
          {[
            { ic: "🔎", t: "Browse & Filter", d: "Search approved doctors by specialty, location and availability." },
            { ic: "📅", t: "Easy Booking", d: "Pick a slot, attach documents, and track your appointment status." },
            { ic: "🔔", t: "Live Notifications", d: "Get notified the moment your appointment is approved or updated." },
            { ic: "🩺", t: "Become a Doctor", d: "Apply, get admin-approved, and manage your own patient requests." },
            { ic: "🛡️", t: "Secure & Private", d: "JWT-protected sessions and encrypted passwords keep data safe." },
            { ic: "⚙️", t: "Admin Oversight", d: "Admins approve doctors and monitor every appointment platform-wide." },
          ].map((f) => (
            <div key={f.t} className="feature card-soft">
              <div className="ic">{f.ic}</div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 6 }}>{f.t}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 0",
          color: "var(--muted)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Logo />
        <span>© {new Date().getFullYear()} Book a Doctor. Built for care.</span>
      </footer>
    </div>
  );
}
