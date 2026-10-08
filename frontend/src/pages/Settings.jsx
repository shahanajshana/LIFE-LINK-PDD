import { useState } from "react";

import ProfileSettings from "../components/settings/ProfileSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";

function Settings() {
  const [selected, setSelected] = useState("profile");

  return (
    <div style={styles.page}>
      <h1>Settings</h1>
      <p style={styles.subheading}>Manage your account and preferences</p>

      <div style={styles.container}>
        <div style={styles.sidebar}>
          <div
            style={selected === "profile" ? styles.activeMenu : styles.menu}
            onClick={() => setSelected("profile")}
          >
            👤 Profile
          </div>

          <div
            style={selected === "notifications" ? styles.activeMenu : styles.menu}
            onClick={() => setSelected("notifications")}
          >
            🔔 Notifications
          </div>

          <div
            style={selected === "privacy" ? styles.activeMenu : styles.menu}
            onClick={() => setSelected("privacy")}
          >
            🔒 Privacy & Security
          </div>
        </div>

        <div style={styles.content}>
          {selected === "profile" && <ProfileSettings />}
          {selected === "notifications" && <NotificationSettings />}
          {selected === "privacy" && <PrivacySettings />}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    background: "#f5f6fa",
    minHeight: "100vh",
  },
  subheading: {
    color: "gray",
    marginBottom: "25px",
  },
  container: {
    display: "flex",
    gap: "30px",
  },
  sidebar: {
    width: "250px",
  },
  menu: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    cursor: "pointer",
  },
  activeMenu: {
    background: "#ef4444",
    color: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
};

export default Settings;