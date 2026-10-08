import { useState, useEffect } from "react";
import { api } from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await api.getNotifications();
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAllRead = async () => {
    const updated = await api.markNotificationsRead();
    if (updated) setNotifications(updated);
  };

  const clearAll = async () => {
    if (window.confirm("Clear all notifications?")) {
      await api.clearNotifications();
      setNotifications([]);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🔔 System Notifications</h1>
          <p style={styles.sub}>Real-time emergency alerts, blood matches, and hospital updates</p>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.readBtn} onClick={markAllRead}>
            Mark as Read ✓
          </button>
          <button style={styles.clearBtn} onClick={clearAll}>
            Clear All 🗑️
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingText}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.emptyState}>No new notifications. You are all caught up!</div>
      ) : (
        <div style={styles.list}>
          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.card,
                background: item.read ? "#ffffff" : "#fff5f5",
                borderLeft: item.read ? "1px solid #e2e8f0" : "6px solid #ef4444",
              }}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <span style={styles.timeTag}>{item.time}</span>
              </div>
              <p style={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
  },
  sub: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "4px",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  readBtn: {
    background: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "10px 18px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  clearBtn: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "10px 18px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  card: {
    padding: "20px 24px",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  timeTag: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#475569",
    margin: 0,
    lineHeight: "1.5",
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    background: "#ffffff",
    borderRadius: "16px",
    color: "#64748b",
  },
};

export default Notifications;
