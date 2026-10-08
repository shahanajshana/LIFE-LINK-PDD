import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Emergency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hospitals, setHospitals] = useState([]);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentTimeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const [form, setForm] = useState({
    patient: "",
    bloodGroup: "A+",
    unitsNeeded: 1,
    hospital: "",
    location: "",
    phone: "",
    urgency: "Emergency",
    requiredDate: todayStr,
    requiredTime: currentTimeStr,
    message: "",
  });

  useEffect(() => {
    api.getHospitals().then((data) => {
      if (data) setHospitals(data);
    });
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.hospital || !form.phone) {
      alert("Please fill in Patient Name, Hospital, and Contact Number!");
      return;
    }

    setLoading(true);
    const created = await api.createEmergencyRequest(form);
    setLoading(false);

    if (created) {
      setSuccess(true);
      setForm({
        patient: "",
        bloodGroup: "A+",
        unitsNeeded: 1,
        hospital: "",
        location: "",
        phone: "",
        urgency: "Emergency",
        requiredDate: todayStr,
        requiredTime: currentTimeStr,
        message: "",
      });
    }
  };

  return (
    <div style={styles.page}>
      <div className="emergency-mobile-box" style={styles.box}>
        <div style={styles.badgeHeader}>
          <span style={styles.sosIcon}>🚨</span>
          <div>
            <h1 style={styles.title}>🚨 Emergency Blood Request</h1>
            <p style={styles.subtitle}>Broadcast urgent blood requests to nearby verified donors & hospitals</p>
          </div>
        </div>

        {success ? (
          <div style={styles.successCard}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🚨</div>
            <h3 style={{ color: "#166534", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
              Emergency Request Submitted Successfully 🚨
            </h3>
            <p style={{ color: "#475569", fontSize: "14px", marginBottom: "24px" }}>
              Your request has been broadcasted across the LifeLink network with real-time timestamps.
            </p>
            
            <div className="emergency-mobile-btnrow" style={styles.btnRow}>
              <button
                style={styles.viewDetailsBtn}
                onClick={() => navigate("/emergency-history")}
              >
                View Request Details 📋
              </button>
              
              <button
                style={styles.backDashBtn}
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard 🏠
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>PATIENT NAME</label>
              <input
                type="text"
                name="patient"
                placeholder="e.g. Ramesh Gupta"
                value={form.patient}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div className="emergency-mobile-row" style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>BLOOD GROUP</label>
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>REQUIRED UNITS</label>
                <input
                  type="number"
                  name="unitsNeeded"
                  min="1"
                  max="10"
                  value={form.unitsNeeded}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div className="emergency-mobile-row" style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>SELECT HOSPITAL</label>
                <select
                  name="hospital"
                  value={form.hospital}
                  onChange={(e) => {
                    const selected = hospitals.find((h) => h.name === e.target.value);
                    setForm({
                      ...form,
                      hospital: e.target.value,
                      location: selected ? selected.address : form.location,
                    });
                  }}
                  style={styles.input}
                  required
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((h, i) => (
                    <option key={i} value={h.name}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                  <option value="Other Hospital">Other Hospital</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>HOSPITAL LOCATION</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Ward 402, Greams Road"
                  value={form.location}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div className="emergency-mobile-row" style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>CONTACT NUMBER</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>EMERGENCY LEVEL</label>
                <select
                  name="urgency"
                  value={form.urgency}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option>Normal</option>
                  <option>Urgent</option>
                  <option>Emergency</option>
                </select>
              </div>
            </div>

            <div className="emergency-mobile-row" style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>REQUIRED DATE</label>
                <input
                  type="date"
                  name="requiredDate"
                  value={form.requiredDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>REQUIRED TIME</label>
                <input
                  type="text"
                  name="requiredTime"
                  placeholder="e.g. 10:30 AM"
                  value={form.requiredTime}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>ADDITIONAL MESSAGE</label>
              <textarea
                name="message"
                placeholder="Specify condition or medical notes..."
                value={form.message}
                onChange={handleChange}
                style={{ ...styles.input, height: "80px", resize: "none" }}
              />
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Broadcasting SOS..." : "Submit Emergency Request 🚨"}
            </button>
          </form>
        )}

        <button
          className="emergency-history-btn"
          style={styles.historyBtn}
          onClick={() => navigate("/emergency-history")}
        >
          Previous Emergency Requests 📋
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "6px 0",
    width: "100%",
  },
  box: {
    width: "100%",
    maxWidth: "640px",
    background: "#ffffff",
    padding: "28px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  badgeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  sosIcon: {
    fontSize: "32px",
    background: "#fee2e2",
    padding: "12px",
    borderRadius: "16px",
    flexShrink: 0,
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "12.5px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  successCard: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    padding: "24px",
    borderRadius: "20px",
    textAlign: "center",
    margin: "16px 0",
  },
  btnRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  viewDetailsBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },
  backDashBtn: {
    background: "#0f172a",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
    width: "100%",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#475569",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    background: "#f8fafc",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
    marginTop: "8px",
  },
  historyBtn: {
    width: "100%",
    padding: "14px",
    marginTop: "14px",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
};

// Responsive mobile styles for emergency form
if (!document.getElementById("emergency-mobile-style")) {
  const style = document.createElement("style");
  style.id = "emergency-mobile-style";
  style.textContent = `
    @media (max-width: 600px) {
      .emergency-mobile-box {
        padding: 18px !important;
        border-radius: 18px !important;
      }
      .emergency-mobile-row {
        grid-template-columns: 1fr !important;
        gap: 0px !important;
      }
      .emergency-mobile-btnrow {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Emergency;