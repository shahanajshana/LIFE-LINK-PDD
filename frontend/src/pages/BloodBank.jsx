import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function BloodBank() {
  const navigate = useNavigate();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const banksRes = await api.getBloodBanks();
    if (banksRes) setBloodBanks(banksRes);
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🩸 Blood Bank Inventory Module</h1>
          <p style={styles.sub}>Real-time stock availability matrix for registered blood banks</p>
        </div>
      </div>

      {/* Registered Blood Banks List */}
      <h2 style={styles.sectionTitle}>Registered Regional Blood Banks</h2>

      {loading ? (
        <div style={styles.loadingText}>Loading blood bank inventory...</div>
      ) : (
        <div style={styles.bankList}>
          {bloodBanks.map((bank) => (
            <div key={bank.id} style={styles.bankCard}>
              <div style={styles.bankHeader}>
                <div>
                  <h3 style={styles.bankName}>{bank.name}</h3>
                  <p style={styles.bankLoc}>📍 {bank.location}, {bank.city}</p>
                </div>
                <button
                  style={styles.contactBtn}
                  onClick={() => alert(`Dialing Blood Bank: ${bank.contact}`)}
                >
                  📞 {bank.contact}
                </button>
              </div>

              <h4 style={{ fontSize: "14px", color: "#475569", marginBottom: "12px" }}>
                Stock Availability Breakdown:
              </h4>

              <div style={styles.matrixGrid}>
                {Object.entries(bank.stock || {}).map(([grp, details]) => (
                  <div key={grp} style={styles.matrixItem}>
                    <strong>{grp}</strong>
                    <span>{details.indicator} {details.units} Units</span>
                    <small style={{ color: "#64748b" }}>{details.status}</small>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "18px", textAlign: "right" }}>
                <button
                  style={styles.requestMainBtn}
                  onClick={() => navigate("/request-blood")}
                >
                  Request Blood from Bank 🩸
                </button>
              </div>
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
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
  },
  stockGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
  },
  stockCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "18px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  indicatorBadge: {
    fontSize: "11px",
    fontWeight: "800",
    padding: "4px 8px",
    borderRadius: "20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "inline-block",
    marginBottom: "8px",
  },
  groupTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#ef4444",
    margin: "4px 0",
  },
  unitsText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "12px",
  },
  requestMiniBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    width: "100%",
  },
  bankList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  bankCard: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  bankHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  bankName: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  bankLoc: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
  },
  contactBtn: {
    background: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  matrixItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "12px",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "13px",
  },
  requestMainBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
};

export default BloodBank;