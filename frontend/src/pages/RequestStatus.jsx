import { useEffect, useState } from "react";
import { api } from "../services/api";

function RequestStatus() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const data = await api.getEmergencyRequests();
    if (data) setRequests(data);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Blood Request Tracker</h1>
        <p style={styles.subtitle}>Real-time status tracking of all active and fulfilled blood requests</p>
      </div>

      {loading ? (
        <div style={styles.loadingText}>Loading requests...</div>
      ) : requests.length === 0 ? (
        <div style={styles.empty}>No active blood requests found.</div>
      ) : (
        <div style={styles.grid}>
          {requests.map((req, index) => (
            <div key={req.id || index} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.patientName}>{req.patient || req.name}</h3>
                <span
                  style={{
                    ...styles.badge,
                    background:
                      req.status === "Matched"
                        ? "#dcfce7"
                        : req.urgency === "Emergency"
                        ? "#fee2e2"
                        : "#fef3c7",
                    color:
                      req.status === "Matched"
                        ? "#166534"
                        : req.urgency === "Emergency"
                        ? "#991b1b"
                        : "#92400e",
                  }}
                >
                  {req.status || req.urgency || "Active"}
                </span>
              </div>

              <div style={styles.cardDetails}>
                <p>🩸 <strong>Blood Group:</strong> {req.bloodGroup}</p>
                <p>🏥 <strong>Hospital:</strong> {req.hospital}</p>
                <p>📍 <strong>City:</strong> {req.city || "Local"}</p>
                <p>📞 <strong>Phone:</strong> {req.phone}</p>
                <p>⚡ <strong>Urgency:</strong> {req.urgency || "Emergency"}</p>
              </div>

              <div style={styles.timeFooter}>
                Submitted: {req.date || "Just now"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    background: "#ffffff",
    borderRadius: "16px",
    color: "#64748b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "14px",
  },
  patientName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
  },
  cardDetails: {
    fontSize: "14px",
    color: "#475569",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  timeFooter: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "10px",
  },
};

export default RequestStatus;