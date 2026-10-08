import "./Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(null);
  const [emergencyReqs, setEmergencyReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);

  useEffect(() => {
    api.getEmergencyRequests().then((reqs) => {
      if (reqs) setEmergencyReqs(reqs);
      setLoading(false);
    });
  }, []);

  const pendingCount = emergencyReqs.filter((r) => r.status === "Pending").length;

  // Format date nicely
  const fmt = (d) => {
    if (!d) return "Not recorded";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
    catch { return d; }
  };

  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-content-wrapper">
      {/* Top Banner — Dynamic User Profile */}
      <section className="user-hero-banner">
        <div className="user-info-col">
          <div className="user-avatar-large">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="welcome-heading">Welcome, {user.name} 👋</h1>
            <div className="user-meta-row">
              {user.city  && <span>📍 {user.city}</span>}
              {user.phone && <span>📞 {user.phone}</span>}
              <span>📧 {user.email}</span>
            </div>
          </div>
        </div>

        <div className="blood-group-badge-box">
          <h1 className="blood-group-symbol">{user.bloodGroup || "A+"}</h1>
          <p>Blood Group</p>
        </div>

        <div className="eligibility-status-box">
          <span className="status-tag-eligible">{user.donorStatus || "Eligible Donor"}</span>
          <p className="status-detail">Last Donation: {fmt(user.lastDonation)}</p>
          <p className="status-detail">Next Eligible: {fmt(user.nextEligible)}</p>
        </div>
      </section>

      {/* 5 Key Statistics Cards */}
      <section className="stats-grid-5">
        <div className="stat-card">
          <span className="stat-icon">🩸</span>
          <p className="stat-label">Blood Group</p>
          <h2 className="stat-value">{user.bloodGroup || "A+"}</h2>
          <span className="stat-sub positive">Verified Group</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon">❤️</span>
          <p className="stat-label">Donation Count</p>
          <h2 className="stat-value">{user.donationsCount ?? 0}</h2>
          <span className="stat-sub positive">Verified Donations</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🌟</span>
          <p className="stat-label">Lives Helped</p>
          <h2 className="stat-value">{user.livesHelped ?? 0} Lives</h2>
          <span className="stat-sub positive">Community Impact</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <p className="stat-label">Pending Requests</p>
          <h2 className="stat-value">{loading ? "..." : pendingCount} Requests</h2>
          <span className="stat-sub urgent">Needs Response</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <p className="stat-label">Reward Points</p>
          <h2 className="stat-value">{user.rewardPoints ?? 0} Points</h2>
          <span className="stat-sub gold">
            {user.rewardPoints >= 5000 ? "Platinum Badge" : user.rewardPoints >= 2000 ? "Gold Badge" : user.rewardPoints >= 500 ? "Silver Badge" : "Bronze Badge"}
          </span>
        </div>
      </section>

      {/* Urgent Emergency Alert Card */}
      <section className="alert-banner-card">
        <div className="alert-info">
          <div className="alert-header">
            <span className="alert-icon">🚨</span>
            <span className="alert-tag">URGENT EMERGENCY BROADCAST</span>
          </div>
          <h3>Emergency Blood Request{user.city ? ` near ${user.city}` : ""}</h3>
          <p>
            {emergencyReqs.length > 0
              ? `Patient ${emergencyReqs[0].patient} urgently needs ${emergencyReqs[0].bloodGroup} blood at ${emergencyReqs[0].hospital}.`
              : loading
              ? "Loading emergency requests..."
              : "No active emergency requests right now. Stay ready to respond."}
          </p>
        </div>

        <div className="alert-actions">
          <button className="btn-respond" onClick={() => navigate("/emergency")}>
            Submit / Respond SOS 🚨
          </button>
          <button className="btn-history-outline" onClick={() => navigate("/emergency-history")}>
            Previous SOS Requests
          </button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
