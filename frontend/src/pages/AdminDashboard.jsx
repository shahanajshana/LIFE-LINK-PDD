import { useState, useEffect } from "react";
import { api } from "../services/api";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    const [uData, dData, hData, eData] = await Promise.all([
      api.getAdminUsers(),
      api.getDonors(),
      api.getHospitals(),
      api.getEmergencyRequests(),
    ]);
    if (uData) setUsers(uData);
    if (dData) setDonors(dData);
    if (hData) setHospitals(hData);
    if (eData) setEmergencies(eData);
    setLoading(false);
  };

  const handleToggleBlock = async (id) => {
    const updated = await api.toggleBlockUser(id);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setEmergencies((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🛡️ Admin Control Module</h1>
          <p style={styles.sub}>Master control panel for users, verified donors, hospitals, and emergency dispatches</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={styles.tabsRow}>
        {["users", "donors", "hospitals", "emergencies"].map((t) => (
          <button
            key={t}
            style={{
              ...styles.tabBtn,
              background: activeTab === t ? "#ef4444" : "#f1f5f9",
              color: activeTab === t ? "#ffffff" : "#475569",
            }}
            onClick={() => setActiveTab(t)}
          >
            {t === "users" && "👥 Users Management"}
            {t === "donors" && "🩸 Donors Verification"}
            {t === "hospitals" && "🏥 Hospital Network"}
            {t === "emergencies" && "🚨 Emergency Requests"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingText}>Loading admin database records...</div>
      ) : (
        <div>
          {/* TAB 1: USERS */}
          {activeTab === "users" && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>User Accounts Directory</h2>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Blood Group</th>
                    <th style={styles.th}>City</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={styles.tdRow}>
                      <td style={styles.td}><strong>{u.name}</strong></td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.bloodGroup}</td>
                      <td style={styles.td}>{u.city}</td>
                      <td style={styles.td}>{u.role || "User"}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background: u.status === "Blocked" ? "#fee2e2" : "#dcfce7",
                            color: u.status === "Blocked" ? "#991b1b" : "#166534",
                          }}
                        >
                          {u.status || "Active"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.blockBtn}
                          onClick={() => handleToggleBlock(u.id)}
                        >
                          {u.status === "Blocked" ? "Unblock User" : "Block User"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: DONORS */}
          {activeTab === "donors" && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Donor Verification List</h2>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Donor Name</th>
                    <th style={styles.th}>Blood Group</th>
                    <th style={styles.th}>City</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Verification</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((d) => (
                    <tr key={d.id} style={styles.tdRow}>
                      <td style={styles.td}><strong>{d.name}</strong></td>
                      <td style={styles.td}>{d.bloodGroup || d.blood}</td>
                      <td style={styles.td}>{d.city}</td>
                      <td style={styles.td}>{d.phone}</td>
                      <td style={styles.td}>
                        <span style={styles.badgeGreen}>Verified Donor ✅</span>
                      </td>
                      <td style={styles.td}>{d.status || "Available"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: HOSPITALS */}
          {activeTab === "hospitals" && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Hospital Facilities Directory</h2>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Hospital Name</th>
                    <th style={styles.th}>City</th>
                    <th style={styles.th}>Emergency Contact</th>
                    <th style={styles.th}>Ambulance</th>
                    <th style={styles.th}>Blood Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((h) => (
                    <tr key={h.id} style={styles.tdRow}>
                      <td style={styles.td}><strong>{h.name}</strong></td>
                      <td style={styles.td}>{h.city}</td>
                      <td style={styles.td}>{h.emergencyContact || h.phone}</td>
                      <td style={styles.td}>{h.ambulance}</td>
                      <td style={styles.td}>{h.blood}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: EMERGENCIES */}
          {activeTab === "emergencies" && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Emergency SOS Monitor</h2>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Request ID</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Blood Needed</th>
                    <th style={styles.th}>Hospital</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencies.map((e) => (
                    <tr key={e.id} style={styles.tdRow}>
                      <td style={styles.td}><strong>{e.id}</strong></td>
                      <td style={styles.td}>{e.patient}</td>
                      <td style={styles.td}>{e.bloodGroup} ({e.unitsNeeded || 1} units)</td>
                      <td style={styles.td}>{e.hospital}</td>
                      <td style={styles.td}>
                        <span style={styles.badge}>{e.status || "Pending"}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={styles.approveBtn}
                            onClick={() => handleUpdateStatus(e.id, "Accepted")}
                          >
                            Approve
                          </button>
                          <button
                            style={styles.rejectBtn}
                            onClick={() => handleUpdateStatus(e.id, "Cancelled")}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  tabsRow: {
    display: "flex",
    gap: "12px",
  },
  tabBtn: {
    padding: "12px 20px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  card: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "18px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thRow: {
    background: "#f8fafc",
    textAlign: "left",
  },
  th: {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "800",
    color: "#475569",
    borderBottom: "2px solid #e2e8f0",
  },
  tdRow: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#334155",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
  },
  badgeGreen: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
  },
  blockBtn: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  approveBtn: {
    background: "#dcfce7",
    color: "#166534",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  rejectBtn: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
};

export default AdminDashboard;
