import { useState, useEffect } from "react";
import { api } from "../../services/api";

const NOTIFICATION_ITEMS = [
  { key: "urgent_requests",  title: "Urgent Blood Requests",  desc: "Get notified when there is an urgent blood request" },
  { key: "nearby_drives",    title: "Nearby Blood Drives",    desc: "Get alerts for donation events near you" },
  { key: "smart_match",      title: "Smart Match Alerts",     desc: "AI-powered donor-patient matching notifications" },
  { key: "community",        title: "Community Updates",      desc: "Success stories and community activities" },
  { key: "weekly_digest",    title: "Weekly Digest",          desc: "Weekly summary of donations and requests" },
];

const CHANNEL_ITEMS = [
  { key: "push",  label: "📱 Push Notifications" },
  { key: "email", label: "📧 Email" },
  { key: "sms",   label: "📩 SMS" },
];

const DEFAULT_SETTINGS = {
  urgent_requests: true,
  nearby_drives:   true,
  smart_match:     true,
  community:       true,
  weekly_digest:   true,
  push:            true,
  email:           true,
  sms:             false,
};

function NotificationSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.getNotificationSettings().then((data) => {
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
      setLoading(false);
    });
  }, []);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await api.saveNotificationSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save notification settings:", err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading settings...</div>;
  }

  return (
    <div>
      {saved && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "700", marginBottom: "16px" }}>
          ✅ Notification settings saved!
        </div>
      )}

      {/* Push Notifications */}
      <div style={styles.card}>
        <h2>Push Notifications</h2>
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.key} style={styles.notificationBox}>
            <div>
              <h4>🔔 {item.title}</h4>
              <p style={styles.desc}>{item.desc}</p>
            </div>
            <input
              type="checkbox"
              checked={!!settings[item.key]}
              onChange={() => toggle(item.key)}
              style={{ accentColor: "#ef4444", cursor: "pointer", width: "18px", height: "18px" }}
            />
          </div>
        ))}
      </div>

      {/* Channels */}
      <div style={styles.card}>
        <h2>Notification Channels</h2>
        {CHANNEL_ITEMS.map((ch) => (
          <div key={ch.key} style={styles.channel}>
            <span>{ch.label}</span>
            <input
              type="checkbox"
              checked={!!settings[ch.key]}
              onChange={() => toggle(ch.key)}
              style={{ accentColor: "#ef4444", cursor: "pointer", width: "18px", height: "18px" }}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSave} style={styles.saveBtn}>
        Save Notification Preferences 💾
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: "15px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  notificationBox: {
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  desc: { color: "gray", marginTop: "5px" },
  channel: {
    background: "#f9fafb",
    padding: "18px",
    borderRadius: "10px",
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "8px",
  },
};

export default NotificationSettings;
