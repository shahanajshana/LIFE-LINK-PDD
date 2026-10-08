import { useState, useEffect } from "react";
import { api } from "../services/api";

function EmergencyHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [deleteReqId, setDeleteReqId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const data = await api.getEmergencyRequests();
    if (data) setRequests(data);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteReqId) return;
    await api.deleteEmergencyRequest(deleteReqId);
    setRequests((prev) => prev.filter((r) => r.id !== deleteReqId));
    setDeleteReqId(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Previous Emergency Requests</h1>
          <p style={styles.sub}>Track, monitor status, and manage past emergency blood dispatches</p>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingText}>Loading emergency history...</div>
      ) : requests.length === 0 ? (
        <div style={styles.emptyState}>No emergency requests logged yet.</div>
      ) : (
        <div style={styles.grid}>
          {requests.map((req) => (
            <div key={req.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <span style={styles.idBadge}>{req.id}</span>
                  <h3 style={styles.patientName}>{req.patient}</h3>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    background:
                      req.status === "Accepted"
                        ? "#dcfce7"
                        : req.status === "Completed"
                        ? "#e0f2fe"
                        : req.status === "Cancelled"
                        ? "#fee2e2"
                        : "#fef3c7",
                    color:
                      req.status === "Accepted"
                        ? "#166534"
                        : req.status === "Completed"
                        ? "#0369a1"
                        : req.status === "Cancelled"
                        ? "#991b1b"
                        : "#92400e",
                  }}
                >
                  {req.status || "Pending"}
                </span>
              </div>

              <div style={styles.detailsList}>
                <p>🩸 <strong>Blood Group:</strong> {req.bloodGroup} ({req.unitsNeeded || req.units || 1} Units)</p>
                <p>🏥 <strong>Hospital:</strong> {req.hospital}</p>
                <p>⚡ <strong>Emergency Level:</strong> {req.urgency || "Emergency"}</p>
                <p>🕒 <strong>Created At:</strong> {req.createdAt || req.date || "Just now"}</p>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  style={styles.detailsBtn}
                  onClick={() => setSelectedReq(req)}
                >
                  View Details 👁️
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => setDeleteReqId(req.id)}
                >
                  Delete History 🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {selectedReq && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReq(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#0f172a", marginBottom: "8px" }}>Emergency Request Details</h2>
            <span style={styles.idBadge}>{selectedReq.id}</span>

            <div style={styles.modalBody}>
              <p><strong>Patient Name:</strong> {selectedReq.patient}</p>
              <p><strong>Blood Group Required:</strong> {selectedReq.bloodGroup}</p>
              <p><strong>Required Units:</strong> {selectedReq.unitsNeeded || selectedReq.units || 1} Units</p>
              <p><strong>Hospital:</strong> {selectedReq.hospital}</p>
              <p><strong>Hospital Location:</strong> {selectedReq.location || "Hospital Ward"}</p>
              <p><strong>Contact Phone:</strong> {selectedReq.phone}</p>
              <p><strong>Emergency Level:</strong> {selectedReq.urgency}</p>
              <p><strong>Required Date & Time:</strong> {selectedReq.requiredDate || "Immediate"} at {selectedReq.requiredTime || "ASAP"}</p>
              <p><strong>Exact Dispatch Time:</strong> {selectedReq.createdAt || selectedReq.date}</p>
              <p><strong>Status:</strong> {selectedReq.status}</p>
              {selectedReq.message && <p><strong>Notes:</strong> {selectedReq.message}</p>}
            </div>

            <button style={styles.modalCloseBtn} onClick={() => setSelectedReq(null)}>
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Delete History Confirmation Modal */}
      {deleteReqId && (
        <div style={styles.modalOverlay} onClick={() => setDeleteReqId(null)}>
          <div style={{ ...styles.modalContent, width: "400px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Delete Emergency Request
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
              Are you sure you want to delete this emergency request?
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button style={styles.confirmDeleteBtn} onClick={confirmDelete}>
                Delete
              </button>
              <button style={styles.cancelBtn} onClick={() => setDeleteReqId(null)}>
                Cancel
              </button>
            </div>
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
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
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
  statusBadge: {
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
    marginBottom: "18px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  detailsBtn: {
    flex: 1,
    background: "#0f172a",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "10px 14px",
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
  modalOverlay: {
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
  modalContent: {
    background: "#ffffff",
    width: "480px",
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
  modalCloseBtn: {
    width: "100%",
    background: "#0f172a",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  confirmDeleteBtn: {
    flex: 1,
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    background: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default EmergencyHistory;