import "./Auth.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [tab, setTab] = useState("login"); // "login" | "register" | "forgot"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regBloodGroup, setRegBloodGroup] = useState("A+");
  const [regCity, setRegCity] = useState("Chennai");
  const [showRegPass, setShowRegPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot / Reset password state
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);



  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "register" || tabParam === "login") {
      setTab(tabParam);
    }
  }, [location]);

  // Demo auto-fill helper
  const handleQuickDemoFill = () => {
    setLoginEmail("shahanaj1925@gmail.com");
    setLoginPassword("Password@123");
    setError("");
  };

  // ── Login Handler ──────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const email = loginEmail.trim();

    if (!email || !loginPassword) {
      setError("Please enter your email and password.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email, loginPassword);
      setLoading(false);
      if (res && res.token && res.user) {
        login(res.user, res.token, rememberMe);
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid response from authentication service.");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Invalid email or password. Please try again.");
    }
  };

  // ── Register Handler ───────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!EMAIL_REGEX.test(regEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        bloodGroup: regBloodGroup,
        city: regCity.trim(),
      });
      setLoading(false);
      setRegSuccess(true);
      setTimeout(() => {
        setTab("login");
        setLoginEmail(regEmail.trim());
        setLoginPassword(regPassword);
        setRegSuccess(false);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  // ── Forgot & Reset Password Handlers ──────────────────────────────────────
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    const email = forgotEmail.trim();
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setLoading(false);
      setForgotStep(2);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to verify email. Please try again.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (forgotNewPass.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPassword(forgotEmail.trim(), forgotNewPass);
      setLoading(false);
      setResetSuccess(true);

      // Pre-fill login credentials with the new password
      setLoginEmail(forgotEmail.trim());
      setLoginPassword(forgotNewPass);

      setTimeout(() => {
        if (res && res.token && res.user) {
          login(res.user, res.token, true);
          navigate("/dashboard", { replace: true });
        } else {
          setTab("login");
          setResetSuccess(false);
          setForgotStep(1);
        }
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="auth-root-container">
      {/* Background ambient lighting */}
      <div className="auth-ambient-glow glow-1"></div>
      <div className="auth-ambient-glow glow-2"></div>

      <div className="auth-master-card">
        {/* ── LEFT SHOWCASE PANEL ── */}
        <div className="auth-left-showcase">
          <div className="brand-header" onClick={() => navigate("/")}>
            <div className="brand-logo-icon">🩸</div>
            <div>
              <h2 className="brand-title">LifeLink</h2>
              <span className="brand-status-tag">
                <span className="pulse-dot"></span> Emergency Network Active
              </span>
            </div>
          </div>

          <div className="showcase-content">
            <h1 className="showcase-heading">
              Smart Healthcare &amp; <span className="highlight-text">Blood Network</span>
            </h1>
            <p className="showcase-description">
              Connecting voluntary blood donors, emergency patients, and hospitals in real-time. Fast, secure, and always ready to save lives.
            </p>

            <div className="showcase-features">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <h4>Instant SOS Broadcast</h4>
                  <p>Average emergency response in under 15 minutes</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏥</span>
                <div>
                  <h4>500+ Partner Hospitals</h4>
                  <p>Real-time blood stock and verified trauma centers</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <div>
                  <h4>Verified &amp; Secure</h4>
                  <p>End-to-end encrypted medical contact coordination</p>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span>© 2026 LifeLink Healthcare System</span>
            <span>24/7 Emergency Helpline: 1800-123-BLOOD</span>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="auth-right-form-panel">
          <div className="form-inner-wrapper">
            
            {/* Header / Tabs */}
            <div className="auth-form-header">
              <h2 className="form-main-title">
                {tab === "login" ? "Welcome Back" : tab === "register" ? "Join LifeLink" : "Reset Password"}
              </h2>
              <p className="form-sub-title">
                {tab === "login"
                  ? "Access your donor dashboard, emergency requests & hospital network"
                  : tab === "register"
                  ? "Register as a donor or healthcare partner in just 1 minute"
                  : "Enter your registered email to receive account recovery instructions"}
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            {tab !== "forgot" && !regSuccess && (
              <div className="auth-segmented-tabs">
                <button
                  type="button"
                  className={`tab-btn ${tab === "login" ? "active" : ""}`}
                  onClick={() => { setError(""); setTab("login"); }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`tab-btn ${tab === "register" ? "active" : ""}`}
                  onClick={() => { setError(""); setTab("register"); }}
                >
                  Register
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="auth-alert-box error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message for Registration */}
            {regSuccess && (
              <div className="auth-alert-box success">
                <span className="alert-icon">✅</span>
                <span>Account created successfully! Redirecting to login...</span>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {tab === "login" && (
              <form onSubmit={handleLoginSubmit} className="auth-pure-form">
                {/* Demo Quick-Fill Pill */}
                <div className="demo-fill-banner" onClick={handleQuickDemoFill}>
                  <div className="demo-badge">⚡ Quick Fill</div>
                  <div className="demo-text">Use verified demo account: <strong>shahanaj1925@gmail.com</strong></div>
                </div>

                <div className="form-field-group">
                  <label>Email Address</label>
                  <div className="field-input-wrapper">
                    <span className="input-field-icon">✉️</span>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <div className="field-label-row">
                    <label>Password</label>
                    <button
                      type="button"
                      className="forgot-link-btn"
                      onClick={() => { setError(""); setTab("forgot"); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="field-input-wrapper">
                    <span className="input-field-icon">🔒</span>
                    <input
                      type={showLoginPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      tabIndex={-1}
                    >
                      {showLoginPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="form-options-row">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-primary-action-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-text">
                      <span className="btn-spinner"></span> Authenticating...
                    </span>
                  ) : (
                    "Sign In to Account ➔"
                  )}
                </button>

                <div className="auth-switch-prompt">
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    className="switch-link-btn"
                    onClick={() => { setError(""); setTab("register"); }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === "register" && !regSuccess && (
              <form onSubmit={handleRegisterSubmit} className="auth-pure-form">
                <div className="form-field-group">
                  <label>Full Name</label>
                  <div className="field-input-wrapper">
                    <span className="input-field-icon">👤</span>
                    <input
                      type="text"
                      placeholder="e.g. Shahanaj Begum"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-field-group">
                    <label>Email Address</label>
                    <div className="field-input-wrapper">
                      <span className="input-field-icon">✉️</span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-field-group">
                    <label>Phone Number</label>
                    <div className="field-input-wrapper">
                      <span className="input-field-icon">📞</span>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-field-group">
                    <label>Blood Group</label>
                    <div className="field-input-wrapper select-wrapper">
                      <span className="input-field-icon">🩸</span>
                      <select
                        value={regBloodGroup}
                        onChange={(e) => setRegBloodGroup(e.target.value)}
                      >
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-field-group">
                    <label>City / Location</label>
                    <div className="field-input-wrapper">
                      <span className="input-field-icon">📍</span>
                      <input
                        type="text"
                        placeholder="e.g. Chennai"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-field-group">
                    <label>Password</label>
                    <div className="field-input-wrapper">
                      <span className="input-field-icon">🔒</span>
                      <input
                        type={showRegPass ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowRegPass(!showRegPass)}
                        tabIndex={-1}
                      >
                        {showRegPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  <div className="form-field-group">
                    <label>Confirm Password</label>
                    <div className="field-input-wrapper">
                      <span className="input-field-icon">🔒</span>
                      <input
                        type={showRegPass ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-options-row">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>I agree to the Healthcare Terms &amp; Donor Privacy Policy</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-primary-action-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-text">
                      <span className="btn-spinner"></span> Creating Account...
                    </span>
                  ) : (
                    "Create LifeLink Account ➔"
                  )}
                </button>

                <div className="auth-switch-prompt">
                  Already registered?{" "}
                  <button
                    type="button"
                    className="switch-link-btn"
                    onClick={() => { setError(""); setTab("login"); }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ── FORGOT / RESET PASSWORD ── */}
            {tab === "forgot" && (
              <div className="auth-pure-form">
                {resetSuccess ? (
                  <div className="forgot-success-box">
                    <div className="success-icon">🎉</div>
                    <h3 style={{ color: "#16a34a" }}>Password Reset Successfully!</h3>
                    <p>
                      Your new password has been saved. Logging you in now...
                    </p>
                  </div>
                ) : forgotStep === 1 ? (
                  <form onSubmit={handleVerifyEmail}>
                    <div className="form-field-group">
                      <label>Registered Account Email</label>
                      <div className="field-input-wrapper">
                        <span className="input-field-icon">✉️</span>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="auth-primary-action-btn"
                      disabled={loading || !forgotEmail.trim()}
                      style={{ marginTop: "16px" }}
                    >
                      {loading ? (
                        <span className="btn-spinner-text">
                          <span className="btn-spinner"></span> Verifying Email...
                        </span>
                      ) : (
                        "Verify & Set New Password ➔"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit}>
                    <div className="demo-fill-banner" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
                      <div className="demo-badge" style={{ background: "#3b82f6" }}>Account</div>
                      <div className="demo-text" style={{ color: "#1e40af" }}>
                        Resetting password for: <strong>{forgotEmail}</strong>{" "}
                        <button
                          type="button"
                          onClick={() => setForgotStep(1)}
                          style={{ background: "none", border: "none", color: "#ef4444", fontWeight: "700", cursor: "pointer", marginLeft: "6px" }}
                        >
                          (Change)
                        </button>
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label>New Password</label>
                      <div className="field-input-wrapper">
                        <span className="input-field-icon">🔒</span>
                        <input
                          type={showForgotPass ? "text" : "password"}
                          placeholder="Enter your new password"
                          value={forgotNewPass}
                          onChange={(e) => setForgotNewPass(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="eye-toggle-btn"
                          onClick={() => setShowForgotPass(!showForgotPass)}
                          tabIndex={-1}
                        >
                          {showForgotPass ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <div className="form-field-group" style={{ marginTop: "12px" }}>
                      <label>Confirm New Password</label>
                      <div className="field-input-wrapper">
                        <span className="input-field-icon">🔒</span>
                        <input
                          type={showForgotPass ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={forgotConfirmPass}
                          onChange={(e) => setForgotConfirmPass(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="auth-primary-action-btn"
                      disabled={loading || !forgotNewPass || !forgotConfirmPass}
                      style={{ marginTop: "16px" }}
                    >
                      {loading ? (
                        <span className="btn-spinner-text">
                          <span className="btn-spinner"></span> Updating Password...
                        </span>
                      ) : (
                        "Save Password & Sign In ➔"
                      )}
                    </button>
                  </form>
                )}

                <div className="auth-switch-prompt" style={{ marginTop: "20px" }}>
                  Remember your password?{" "}
                  <button
                    type="button"
                    className="switch-link-btn"
                    onClick={() => { setResetSuccess(false); setForgotStep(1); setError(""); setTab("login"); }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
