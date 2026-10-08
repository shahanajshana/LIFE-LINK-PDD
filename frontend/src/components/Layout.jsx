import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openProfile, setOpenProfile]           = useState(false);
  const [showLogoutModal, setShowLogoutModal]   = useState(false);
  const [sidebarOpen, setSidebarOpen]           = useState(false); // mobile slide drawer

  const { user: authUser, logout } = useAuth();

  const [user, setUser] = useState({
    name: "Shahanaj",
    email: "shahanaj1925@gmail.com",
    phone: "+91 9876543210",
    bloodGroup: "A+",
    city: "Chennai",
    donorStatus: "Eligible Donor",
  });

  useEffect(() => {
    if (authUser) setUser((prev) => ({ ...prev, ...authUser }));
  }, [authUser]);

  // Close sidebar drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
    setOpenProfile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const navItems = [
    { path: "/dashboard",        label: "Dashboard",        icon: "🏠" },
    { path: "/donate-blood",     label: "Donate Blood",     icon: "❤️" },
    { path: "/find-blood",       label: "Find Blood",       icon: "🩸" },
    { path: "/hospitals",        label: "Nearby Hospitals", icon: "🏥" },
    { path: "/donation-history", label: "Donation History", icon: "📋" },
    { path: "/notifications",    label: "Notifications",    icon: "🔔" },
    { path: "/ai-assistant",     label: "AI Health Assistant", icon: "🤖" },
    { path: "/settings",         label: "Settings & Profile",  icon: "⚙️" },
  ];

  // Mobile Bottom Navigation Tabs
  const bottomTabs = [
    { path: "/dashboard",    label: "Home",      icon: "🏠" },
    { path: "/donate-blood", label: "Donate",    icon: "❤️" },
    { path: "/emergency",   label: "SOS",       icon: "🚨", isEmergency: true },
    { path: "/find-blood",   label: "Find Blood",icon: "🩸" },
    { path: "/hospitals",    label: "Hospitals", icon: "🏥" },
  ];

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/auth");
  };

  const getPageTitle = () => {
    const matched = navItems.find((i) => i.path === location.pathname);
    if (matched) return matched.label;
    if (location.pathname === "/emergency") return "🚨 Emergency SOS";
    if (location.pathname === "/emergency-history") return "📋 Emergency History";
    if (location.pathname === "/donor-list") return "👥 Verified Donors";
    if (location.pathname === "/request-blood") return "🩸 Request Blood";
    return "LifeLink Mobile";
  };

  return (
    <div className="layout-container">

      {/* ── Mobile Slide Bar Backdrop ── */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Slide Bar / Mobile & Desktop Navigation Drawer ── */}
      <aside className={`layout-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        
        {/* Slide Bar Header */}
        <div className="sidebar-header-row">
          <div className="layout-brand" onClick={() => { setSidebarOpen(false); navigate("/dashboard"); }}>
            <div className="brand-badge">🩸</div>
            <div>
              <h2 className="brand-title">LifeLink</h2>
              <span className="brand-subtitle">Mobile Healthcare Network</span>
            </div>
          </div>

          {/* Close Slide Bar Button on Mobile */}
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Slide Bar"
          >
            ✕
          </button>
        </div>

        {/* Slide Bar Navigation Items */}
        <nav className="layout-nav">
          <div className="nav-section-label">MAIN NAVIGATION</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(item.path);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="active-dot" />}
              </button>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: "16px" }}>ACCOUNT & SECURITY</div>
          <button
            className="nav-item nav-logout-btn"
            onClick={() => {
              setSidebarOpen(false);
              setShowLogoutModal(true);
            }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        {/* Slide Bar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-app-version">
            <span>LifeLink Mobile Pro · v2.4</span>
            <span className="live-indicator">● Live</span>
          </div>
        </div>
      </aside>

      {/* ── Main Application Content ── */}
      <div className="layout-main">

        {/* ── Mobile Topbar (App Bar) ── */}
        <header className="layout-topbar">
          <div className="topbar-left">
            {/* Hamburger Slide Bar Toggle Button */}
            <button
              className={`hamburger-btn ${sidebarOpen ? "is-open" : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Slide Bar Menu"
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>

            <div className="topbar-title-wrap">
              <h2 className="page-heading">{getPageTitle()}</h2>
              <span className="mobile-app-subtitle">LifeLink Mobile</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Quick Emergency SOS Header Button */}
            <button
              className="sos-quick-btn"
              onClick={() => navigate("/emergency")}
              aria-label="Emergency SOS"
            >
              <span className="sos-pulse-dot" />
              🚨 <span className="sos-text">Emergency SOS</span>
            </button>

            {/* Profile Avatar & Quick Menu */}
            <div className="profile-wrapper">
              <div
                className="profile-pill"
                onClick={() => setOpenProfile(!openProfile)}
              >
                <div className="profile-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="profile-details-text">
                  <strong>{user.name}</strong>
                  <span>{user.bloodGroup || "A+"}</span>
                </div>
              </div>

              {openProfile && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-avatar">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <hr className="dropdown-divider" />

                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setOpenProfile(false);
                      navigate("/settings");
                    }}
                  >
                    👤 View Profile & Settings
                  </div>

                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setOpenProfile(false);
                      navigate("/donation-history");
                    }}
                  >
                    📋 My Donations
                  </div>

                  <hr className="dropdown-divider" />

                  <div
                    className="dropdown-item logout-item"
                    onClick={() => {
                      setOpenProfile(false);
                      setShowLogoutModal(true);
                    }}
                  >
                    🚪 Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Scrollable Page Content Body ── */}
        <main className="layout-content-body">
          {children}
        </main>

        {/* ── Native Mobile Bottom Navigation Bar (Visible on Mobile) ── */}
        <nav className="mobile-bottom-nav">
          {bottomTabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            if (tab.isEmergency) {
              return (
                <button
                  key={tab.path}
                  className="bottom-nav-sos-btn"
                  onClick={() => navigate(tab.path)}
                  aria-label="Emergency SOS"
                >
                  <div className="sos-fab-circle">
                    <span className="sos-fab-icon">🚨</span>
                  </div>
                  <span className="bottom-nav-label sos-label">SOS</span>
                </button>
              );
            }
            return (
              <button
                key={tab.path}
                className={`bottom-nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(tab.path)}
              >
                <span className="bottom-nav-icon">{tab.icon}</span>
                <span className="bottom-nav-label">{tab.label}</span>
                {isActive && <span className="bottom-nav-indicator" />}
              </button>
            );
          })}

          {/* Drawer Menu Quick Toggle in Bottom Bar */}
          <button
            className={`bottom-nav-item ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Slide Bar Menu"
          >
            <span className="bottom-nav-icon">☰</span>
            <span className="bottom-nav-label">Menu</span>
          </button>
        </nav>

      </div>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-badge">🚪</div>
            <h3 className="modal-title">Logout Confirmation</h3>
            <p className="modal-text">Are you sure you want to log out of your LifeLink account?</p>
            <div className="modal-actions">
              <button className="modal-btn-confirm" onClick={confirmLogout}>Yes, Logout</button>
              <button className="modal-btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
