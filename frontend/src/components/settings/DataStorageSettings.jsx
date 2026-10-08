function DataStorageSettings() {
  return (
    <div>

      <div style={styles.card}>
        <h2>Storage Usage</h2>

        <p style={styles.gray}>
          Manage your stored data
        </p>

        <div style={styles.storageBar}>
          <div style={styles.used}></div>
        </div>

        <p>7.5 GB used of 15 GB</p>
      </div>

      <div style={styles.card}>
        <h2>Data Backup</h2>

        <div style={styles.box}>
          <span>
            Automatic Cloud Backup
          </span>

          <input
            type="checkbox"
            defaultChecked
          />
        </div>

        <div style={styles.box}>
          <span>
            Download Medical Reports
          </span>

          <button style={styles.btn}>
            Download
          </button>
        </div>

        <div style={styles.box}>
          <span>
            Clear Cache Data
          </span>

          <button style={styles.deleteBtn}>
            Clear
          </button>
        </div>
      </div>

    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: "15px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  gray: {
    color: "gray",
    marginTop: "5px",
  },

  storageBar: {
    width: "100%",
    height: "20px",
    background: "#e5e7eb",
    borderRadius: "20px",
    marginTop: "20px",
    overflow: "hidden",
  },

  used: {
    width: "50%",
    height: "100%",
    background: "#ef4444",
  },

  box: {
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  btn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  deleteBtn: {
    background: "black",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default DataStorageSettings;