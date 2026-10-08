import { useState, useEffect } from "react";
import { api } from "../services/api";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const data = await api.getBloodRequests();
    if (data) setRequests(data);
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 My Blood Requests</h1>
          <p style={styles.sub}>Track all formal blood requests submitted for your hospital patients</p>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingText}>Loading requests...</div>
      ) : requests.length === 0 ? (
        <div style={styles.emptyState}>No blood requests found.</div>
      ) : (
        <div style={styles.grid}>
          {requests.map((req) => (
            <div key={req.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.idBadge}>{req.id}</span>
                  <h3 style={styles.patientName}>{req.patientName || "Patient Request"}</h3>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    background: req.status === "Matched" ? "#dcfce7" : "#fef3c7",
                    color: req.status === "Matched" ? "#166534" : "#92400e",
                  }}
                >
                  {req.status || "Pending"}
                </span>
              </div>

              <div style={styles.detailsList}>
                <p>🩸 <strong>Blood Group:</strong> {req.bloodGroup}</p>
                <p>📦 <strong>Units Required:</strong> {req.units || 1} Units</p>
                <p>🏥 <strong>Hospital:</strong> {req.hospital}</p>
                <p>📍 <strong>City:</strong> {req.city || "Chennai"}</p>
                <p>🕒 <strong>Date & Time:</strong> {req.date || "Just now"}</p>
              </div>

              <button
                style={styles.detailsBtn}
                onClick={() => setSelectedReq(req)}
              >
                View Details 👁️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal View Details */}
      {selectedReq && (
        <div style={styles.overlay} onClick={() => setSelectedReq(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#0f172a", marginBottom: "8px" }}>Blood Request Details</h2>
            <span style={styles.idBadge}>{selectedReq.id}</span>

            <div style={styles.modalBody}>
              <p><strong>Patient Name:</strong> {selectedReq.patientName}</p>
              <p><strong>Blood Group:</strong> {selectedReq.bloodGroup}</p>
              <p><strong>Units:</strong> {selectedReq.units || 1} Units</p>
              <p><strong>Hospital Facility:</strong> {selectedReq.hospital}</p>
              <p><strong>City:</strong> {selectedReq.city || "Chennai"}</p>
              <p><strong>Attendant Contact:</strong> {selectedReq.phone}</p>
              <p><strong>Urgency Level:</strong> {selectedReq.urgency || "Normal"}</p>
              <p><strong>Date & Time Submitted:</strong> {selectedReq.date}</p>
              <p><strong>Fulfillment Status:</strong> {selectedReq.status}</p>
            </div>

            <button style={styles.closeBtn} onClick={() => setSelectedReq(null)}>
              Close Details
            </button>
          </div>
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
    gap: "10px",
    marginBottom: "14px",
  },
  idBadge: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "800",
    display: "inline-block",
    marginBottom: "4px",
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
  detailsList: {
    fontSize: "13px",
    color: "#475569",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  detailsBtn: {
    width: "100%",
    background: "#0f172a",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
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
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#ffffff",
    width: "440px",
    padding: "28px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#334155",
    margin: "16px 0",
  },
  closeBtn: {
    width: "100%",
    background: "#0f172a",
    color: "#ffffff",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default MyRequests;
