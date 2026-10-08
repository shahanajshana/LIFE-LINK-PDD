import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="welcome-page-container">
      <div className="welcome-card">
        <div className="welcome-icon-box">🩸</div>
        
        <h1 className="welcome-logo">LifeLink</h1>
        <h3 className="welcome-tagline">Donate Blood, Save Lives</h3>

        <p className="welcome-description">
          Connecting blood donors, patients, hospitals and blood banks when every second matters.
        </p>

        <div className="welcome-btn-group">
          <button
            className="welcome-btn-primary"
            onClick={() => navigate("/auth")}
          >
            Get Started 🚀
          </button>
          
          <div className="welcome-btn-row">
            <button
              className="welcome-btn-outline"
              onClick={() => navigate("/auth?tab=login")}
            >
              Login 🔑
            </button>
            <button
              className="welcome-btn-outline"
              onClick={() => navigate("/auth?tab=register")}
            >
              Register 📝
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
