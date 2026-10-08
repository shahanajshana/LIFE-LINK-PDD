import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ProfileSettings() {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "A+",
    city: "",
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Populate from auth context whenever user changes
  useEffect(() => {
    if (user) {
      setProfile({
        name:       user.name       || "",
        email:      user.email      || "",
        phone:      user.phone      || "",
        bloodGroup: user.bloodGroup || "A+",
        city:       user.city       || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.updateProfile(profile);
      if (refreshUser) await refreshUser(); // re-hydrate auth context
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Personal Profile Settings</h2>
      <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Update your contact information &amp; blood donor details</p>

      {saved && (
        <div style={styles.savedAlert}>✅ Profile updated &amp; synced to LifeLink network!</div>
      )}
      {error && (
        <div style={{ ...styles.savedAlert, background: "#fee2e2", color: "#991b1b" }}>⚠️ {error}</div>
      )}

      <div style={styles.profileRow}>
        <div style={styles.avatar}>
          {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>{profile.name || "Your Name"}</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>{profile.bloodGroup} Donor</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>FULL NAME</label>
            <input type="text" name="name" placeholder="Full Name" value={profile.name} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL ADDRESS</label>
            <input type="email" name="email" placeholder="Email" value={profile.email} onChange={handleChange} style={{ ...styles.input, background: "#f1f5f9", color: "#94a3b8" }} readOnly />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>PHONE NUMBER</label>
            <input type="text" name="phone" placeholder="Phone Number" value={profile.phone} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>BLOOD GROUP</label>
            <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} style={styles.input}>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>CITY / LOCATION</label>
            <input type="text" name="city" placeholder="City" value={profile.city} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <button type="submit" style={styles.saveBtn}>Save &amp; Sync Profile 💾</button>
      </form>
    </div>
  );
}

const styles = {
  card: { background: "#ffffff", borderRadius: "20px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  savedAlert: { background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "700", marginTop: "16px" },
  profileRow: { display: "flex", gap: "16px", alignItems: "center", margin: "24px 0" },
  avatar: { width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px", fontWeight: "800" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", fontWeight: "800", color: "#475569", letterSpacing: "0.5px" },
  input: { padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#f8fafc", outline: "none" },
  saveBtn: { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "700", fontSize: "14px", cursor: "pointer" },
};

export default ProfileSettings;
