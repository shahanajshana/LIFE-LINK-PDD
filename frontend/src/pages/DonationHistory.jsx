import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

// Badge logic
function getBadge(count) {
  if (count >= 20) return { label: "Platinum Life Saver", color: "#7c3aed", bg: "#ede9fe", points: count * 250 };
  if (count >= 10) return { label: "Gold Life Saver",     color: "#d97706", bg: "#fef3c7", points: count * 200 };
  if (count >= 5)  return { label: "Silver Donor",        color: "#475569", bg: "#f1f5f9", points: count * 150 };
  return              { label: "Bronze Donor",             color: "#92400e", bg: "#fef3c7", points: count * 100 };
}

function getMilestone(count) {
  if (count < 5)  return { next: 5,  label: "Silver Donor" };
  if (count < 10) return { next: 10, label: "Gold Life Saver" };
  if (count < 20) return { next: 20, label: "Platinum Life Saver" };
  return { next: count, label: "Max Level!" };
}

function DonationHistory() {
  const { user } = useAuth();
  const [history, setHistory]               = useState([]);
  const [personPledges, setPersonPledges]   = useState([]);
  const [hospitalAppts, setHospitalAppts]   = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);

    const [histData, pledgeData] = await Promise.all([
      api.getDonationHistory(),
      api.getDonationPledges(),
    ]);

    if (histData)   setHistory(histData);
    if (pledgeData) {
      setPersonPledges(pledgeData.pledges       || []);
      setHospitalAppts(pledgeData.appointments  || []);
    }

    setLoading(false);
  };

  const totalDonations  = history.length;
  const estimatedLives  = totalDonations * 3;
  const badge           = getBadge(totalDonations);
  const milestone       = getMilestone(totalDonations);
  const progressPercent = milestone.next > 0
    ? Math.min(100, Math.round((totalDonations / milestone.next) * 100))
    : 100;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>❤️ Personal Donation History</h1>
          <p style={styles.sub}>Track your verified blood donations, total units, and lives saved</p>
        </div>
      </div>

      {/* Impact Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={{ fontSize: "28px" }}>🩸</span>
          <p style={styles.statLabel}>Total Donations</p>
          <h2 style={styles.statVal}>{totalDonations}</h2>
          <span style={{ color: "#16a34a", fontSize: "12px", fontWeight: "700" }}>Verified Donor</span>
        </div>

        <div style={styles.statCard}>
          <span style={{ fontSize: "28px" }}>🌟</span>
          <p style={styles.statLabel}>Estimated Lives Helped</p>
          <h2 style={styles.statVal}>{estimatedLives} Lives</h2>
          <span style={{ color: "#16a34a", fontSize: "12px", fontWeight: "700" }}>Community Impact</span>
        </div>

        <div style={styles.statCard}>
          <span style={{ fontSize: "28px" }}>🏆</span>
          <p style={styles.statLabel}>Current Badge Level</p>
          <h2 style={{ ...styles.statVal, color: badge.color }}>{badge.label}</h2>
          <span style={{ color: badge.color, fontSize: "12px", fontWeight: "700" }}>{badge.points.toLocaleString()} Reward Points</span>
        </div>
      </div>

      {/* Progress Milestone */}
      <div style={styles.milestoneCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Milestone Progress: {milestone.label}
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
              {progressPercent < 100
                ? `${milestone.next - totalDonations} more donation${milestone.next - totalDonations !== 1 ? "s" : ""} to unlock ${milestone.label}`
                : "🎉 Maximum milestone reached!"}
            </p>
          </div>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444" }}>{progressPercent}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Active Pledges & Appointments */}
      {(personPledges.length > 0 || hospitalAppts.length > 0) && (
        <div>
          <h2 style={styles.sectionTitle}>📋 Active Pledges &amp; Appointments</h2>
          <div style={{ ...styles.grid, marginBottom: "16px", marginTop: "12px" }}>
            {personPledges.map((pledge) => (
              <div key={pledge.pledgeId} style={{ ...styles.card, borderColor: "#fca5a5" }}>
                <div style={styles.cardTop}>
                  <div>
                    <span style={{ ...styles.idBadge, background: "#fee2e2", color: "#dc2626" }}>Pledge: {pledge.pledgeId}</span>
                    <h3 style={styles.hospitalName}>Patient: {pledge.patientName}</h3>
                  </div>
                  <span style={{ ...styles.completedBadge, background: "#fef3c7", color: "#92400e" }}>🟡 {pledge.status}</span>
                </div>
                <div style={styles.detailsList}>
                  <p>🏥 <strong>Hospital:</strong> {pledge.hospital}</p>
                  <p>🩸 <strong>Blood Group:</strong> {pledge.bloodGroup}</p>
                  <p>📅 <strong>Scheduled:</strong> {pledge.date} at {pledge.time}</p>
                  <p>👤 <strong>Donor:</strong> {pledge.donorName} ({pledge.donorPhone})</p>
                </div>
              </div>
            ))}

            {hospitalAppts.map((hosp) => (
              <div key={hosp.pledgeId} style={{ ...styles.card, borderColor: "#bfdbfe" }}>
                <div style={styles.cardTop}>
                  <div>
                    <span style={{ ...styles.idBadge, background: "#dbeafe", color: "#1e40af" }}>Appt: {hosp.pledgeId}</span>
                    <h3 style={styles.hospitalName}>🏥 {hosp.hospitalName}</h3>
                  </div>
                  <span style={{ ...styles.completedBadge, background: "#dcfce7", color: "#166534" }}>🟢 {hosp.status}</span>
                </div>
                <div style={styles.detailsList}>
                  <p>📍 <strong>Address:</strong> {hosp.address}, {hosp.city}</p>
                  <p>🩸 <strong>Blood Group:</strong> {hosp.bloodGroup}</p>
                  <p>📅 <strong>Slot:</strong> {hosp.date} at {hosp.time}</p>
                  <p>👤 <strong>Donor:</strong> {hosp.donorName} ({hosp.donorPhone})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Records */}
      <h2 style={styles.sectionTitle}>Donation Log Records</h2>

      {loading ? (
        <div style={styles.loadingText}>Loading donation records...</div>
      ) : history.length === 0 ? (
        <div style={styles.emptyState}>
          No donation history logged yet.
          {user && <p style={{ marginTop: "8px", fontSize: "13px" }}>Your completed donations will appear here once recorded in the system.</p>}
        </div>
      ) : (
        <div style={styles.grid}>
          {history.map((item, index) => (
            <div key={item.id || index} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <span style={styles.idBadge}>{item.id}</span>
                  <h3 style={styles.hospitalName}>{item.hospital}</h3>
                </div>
                <span style={styles.completedBadge}>✅ {item.status || "Completed"}</span>
              </div>
              <div style={styles.detailsList}>
                <p>📅 <strong>Date:</strong> {item.date}</p>
                <p>🩸 <strong>Blood Group:</strong> {item.bloodGroup}</p>
                <p>📦 <strong>Units Donated:</strong> {item.units || 1} Unit(s)</p>
                <p>🌟 <strong>Lives Impacted:</strong> {item.livesHelped || 3} Lives</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: "26px", fontWeight: "800", color: "#0f172a" },
  sub: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  statCard: { background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  statLabel: { fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", margin: "8px 0 4px 0" },
  statVal: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "4px 0" },
  milestoneCard: { background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  progressBar: { height: "10px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #ef4444, #f87171)", borderRadius: "10px", transition: "width 0.4s ease" },
  sectionTitle: { fontSize: "20px", fontWeight: "800", color: "#0f172a" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  card: { background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "14px" },
  idBadge: { background: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", display: "inline-block", marginBottom: "4px" },
  hospitalName: { fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 },
  completedBadge: { background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" },
  detailsList: { fontSize: "13px", color: "#475569", display: "flex", flexDirection: "column", gap: "6px" },
  loadingText: { textAlign: "center", padding: "40px", color: "#64748b" },
  emptyState: { textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", color: "#64748b" },
};

export default DonationHistory;
