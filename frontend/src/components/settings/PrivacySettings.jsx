import { useState } from "react";
import { api } from "../../services/api";

function PrivacySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [tfaActive, setTfaActive] = useState(true);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    const res = await api.changePassword(currentPassword, newPassword);
    if (res && res.error) {
      setError(res.error);
    } else {
      setSuccess("✅ Password Updated Successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔒 Change Password</h2>
        <p style={styles.sub}>Update your account security credentials</p>

        {error && <div style={styles.errorAlert}>⚠️ {error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <form onSubmit={handleUpdatePassword}>
          <div style={styles.field}>
            <label style={styles.label}>CURRENT PASSWORD</label>
            <div style={styles.inputWrapper}>
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={styles.input}
                required
              />
              <span 
                style={styles.eyeIcon} 
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>NEW PASSWORD</label>
            <div style={styles.inputWrapper}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                required
              />
              <span 
                style={styles.eyeIcon} 
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>CONFIRM NEW PASSWORD</label>
            <div style={styles.inputWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
              <span 
                style={styles.eyeIcon} 
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
          </div>

          <button type="submit" style={styles.button}>
            Update Password 🔑
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>🛡️ Two-Factor Authentication (2FA)</h2>
        
        <div style={styles.box}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>2FA Status: {tfaActive ? "Enabled 🟢" : "Disabled 🔴"}</h4>
            <p style={styles.gray}>Extra layer of security for your account logins</p>
          </div>

          <button style={styles.manageBtn} onClick={() => setTfaActive(!tfaActive)}>
            {tfaActive ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>👁️ Privacy Controls</h2>

        {[
          "Share Location Data with Emergency Dispatches",
          "Public Donor Profile Visibility",
          "Allow Direct Messages from Requesters",
          "Anonymized Health Analytics Sharing",
        ].map((item, index) => (
          <div key={index} style={styles.box}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{item}</span>
            <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#ef4444" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  title: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  sub: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
    marginBottom: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
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
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "8px",
  },
  manageBtn: {
    border: "1px solid #cbd5e1",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#f1f5f9",
    fontWeight: "700",
    fontSize: "13px",
  },
  box: {
    background: "#f8fafc",
    padding: "16px 20px",
    borderRadius: "14px",
    marginTop: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #e2e8f0",
  },
  gray: {
    color: "#64748b",
    fontSize: "12px",
    margin: "2px 0 0 0",
  },
  errorAlert: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "14px",
  },
  successAlert: {
    background: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "14px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: "14px",
    cursor: "pointer",
    fontSize: "16px",
    userSelect: "none",
  }
};

export default PrivacySettings;