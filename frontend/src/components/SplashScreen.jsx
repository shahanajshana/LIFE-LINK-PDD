import React from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";

function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="splash-master-wrapper">
      {/* Background ambient lighting effects */}
      <div className="splash-ambient-glow glow-top"></div>
      <div className="splash-ambient-glow glow-bottom"></div>

      <div className="splash-glass-card">
        {/* Animated Brand Drop Badge */}
        <div className="splash-logo-container">
          <div className="splash-drop-icon">🩸</div>
          <div className="splash-ring ring-1"></div>
          <div className="splash-ring ring-2"></div>
        </div>

        {/* Brand Name */}
        <h1 className="splash-brand-title">LifeLink</h1>

        {/* Inspirational Slogan */}
        <div className="splash-slogan-box">
          <h2 className="splash-main-slogan">
            "Every Drop Connects a Life. <span className="slogan-highlight">Be the Lifeline.</span>"
          </h2>
          <p className="splash-sub-slogan">
            Smart real-time emergency blood matching and hospital dispatch network — bridging donors, patients, and healthcare facilities when every second counts.
          </p>
        </div>

        {/* 3 Impact Stat Badges */}
        <div className="splash-stats-row">
          <div className="stat-pill">
            <span className="stat-num">10,000+</span>
            <span className="stat-label">Verified Donors</span>
          </div>
          <div className="stat-pill highlight-pill">
            <span className="stat-num">&lt; 15 Mins</span>
            <span className="stat-label">SOS Response</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">500+</span>
            <span className="stat-label">Partner Hospitals</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="splash-actions-group">
          <button
            className="splash-primary-btn"
            onClick={() => navigate("/auth?tab=login")}
          >
            Enter LifeLink Portal ➔
          </button>
        </div>

        {/* Footer Tag */}
        <div className="splash-footer-badge">
          <span className="secure-dot"></span> 24/7 Real-Time Emergency Healthcare Network
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
