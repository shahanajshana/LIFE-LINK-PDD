function IntegrationSettings() {
  const apps = [
    {
      name: "Apple Health",
      status: "Syncing data",
      button: "Disconnect",
    },
    {
      name: "Fitbit",
      status: "Not connected",
      button: "Connect",
    },
    {
      name: "Google Fit",
      status: "Not connected",
      button: "Connect",
    },
  ];

  return (
    <div>

      <div style={styles.card}>
        <h2>Wearable Integrations</h2>

        <p style={styles.gray}>
          Connect your health tracking devices
        </p>

        {apps.map((app, index) => (
          <div
            key={index}
            style={styles.box}
          >
            <div>
              <h3>{app.name}</h3>

              <p style={styles.gray}>
                {app.status}
              </p>
            </div>

            <button style={styles.btn}>
              {app.button}
            </button>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2>API Access</h2>

        <p style={styles.gray}>
          Generate API keys for integrations
        </p>

        <div style={styles.apiBox}>
          llk_prod_a3f8c9d2e1b4f7a6
        </div>

        <button style={styles.generateBtn}>
          + Generate New API Key
        </button>
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

  apiBox: {
    background: "#f3f4f6",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  generateBtn: {
    width: "100%",
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    border: "2px dashed #d1d5db",
    background: "white",
    cursor: "pointer",
  },
};

export default IntegrationSettings;