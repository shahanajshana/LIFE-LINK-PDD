import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const navLinks = [
    { label: "🏠 Home", path: "/" },
    { label: "🚨 Emergency SOS", path: "/emergency" },
    { label: "🩸 Blood Bank Stock", path: "/blood-bank" },
    { label: "🏥 Hospitals Network", path: "/hospital" },
    { label: "🔐 Account Portal", path: "/auth" },
  ];

  return (
    <div className="home-container-layout">
      {/* Vertical Side Navigation */}
      <aside className="home-vertical-nav">
        <div className="home-brand" onClick={() => navigate("/")}>
          <span className="brand-drop">🩸</span>
          <div>
            <span className="brand-text">LifeLink</span>
            <span className="brand-subtext">Smart Network</span>
          </div>
        </div>

        <div className="vertical-nav-title">QUICK NAVIGATION</div>

        <div className="vertical-link-list">
          {navLinks.map((item, i) => (
            <button
              key={i}
              className="vertical-nav-btn"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="vertical-nav-cta">
          <button className="vertical-primary-btn" onClick={() => navigate("/auth")}>
            Get Started 🚀
          </button>
          <button className="vertical-ghost-btn" onClick={() => navigate("/auth")}>
            Log In 🔐
          </button>
        </div>
      </aside>

      {/* Main Hero Content */}
      <main className="home-hero-main">
        <div className="hero-badge">
          ⚡ Next-Gen Emergency Blood Network
        </div>
        <h1 className="hero-title">
          Connecting <span className="highlight-text">Donors</span> & <span className="highlight-text">Hospitals</span> in Real-Time
        </h1>
        <p className="hero-description">
          LifeLink bridges the critical gap between voluntary blood donors and emergency requests with instant AI smart matching, live blood bank tracking, and 24/7 SOS dispatch.
        </p>

        <div className="hero-cta-vertical">
          <button
            className="hero-btn-primary"
            onClick={() => navigate("/auth")}
          >
            Find a Donor Now 🚀
          </button>
          <button
            className="hero-btn-secondary"
            onClick={() => navigate("/intro")}
          >
            How it Works ✨
          </button>
        </div>

        {/* Feature Grid */}
        <div className="home-stats-grid">
          <div className="home-stat-card">
            <h3>10,000+</h3>
            <p>Verified Donors</p>
          </div>
          <div className="home-stat-card">
            <h3>500+</h3>
            <p>Partner Hospitals</p>
          </div>
          <div className="home-stat-card">
            <h3>&lt; 15 Mins</h3>
            <p>Average SOS Response</p>
          </div>
          <div className="home-stat-card">
            <h3>24/7</h3>
            <p>Emergency Dispatch</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;