import { useState, useEffect } from "react";
import { api } from "../services/api";

function ManageHospitals() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    emergencyContact: "",
    blood: "",
    ambulance: "Available",
    type: "Multi-speciality",
    lat: "13.0827",
    lng: "80.2707",
  });

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editHospital, setEditHospital] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    const res = await api.getHospitals();
    if (res) setHospitals(res);
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addHospital = async (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.phone) {
      alert("Please fill in Hospital Name, City, and Phone Number!");
      return;
    }

    const created = await api.addHospital(form);
    if (created) {
      setHospitals((prev) => [created, ...prev]);
      alert("✅ Hospital added successfully!");
      setForm({
        name: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        emergencyContact: "",
        blood: "",
        ambulance: "Available",
        type: "Multi-speciality",
        lat: "13.0827",
        lng: "80.2707",
      });
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editHospital) return;
    const updated = await api.updateHospital(editHospital.id, editHospital);
    setHospitals((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    setEditHospital(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await api.deleteHospital(deleteId);
    setHospitals((prev) => prev.filter((h) => h.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Manage Hospitals (Admin Portal)</h1>
          <p style={styles.sub}>Add, edit, delete, and monitor healthcare facility registrations</p>
        </div>
      </div>

      {/* Add Hospital Form */}
      <form onSubmit={addHospital} style={styles.form}>
        <h3 style={styles.formTitle}>+ Add New Hospital Facility</h3>

        <div style={styles.formGrid}>
          <input
            name="name"
            placeholder="Hospital Name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="address"
            placeholder="Street Address / Location"
            value={form.address}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number (+91 ...)"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="emergencyContact"
            placeholder="Emergency Direct Contact Desk"
            value={form.emergencyContact}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="blood"
            placeholder="Available Blood Groups (e.g. A+, O+, B+ Available)"
            value={form.blood}
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="ambulance"
            value={form.ambulance}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="Available">Ambulance: Available</option>
            <option value="Not Available">Ambulance: Not Available</option>
          </select>

          <input
            name="type"
            placeholder="Category (e.g. Multi-speciality, Emergency Care)"
            value={form.type}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input
              name="lat"
              placeholder="Latitude (13.0827)"
              value={form.lat}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="lng"
              placeholder="Longitude (80.2707)"
              value={form.lng}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" style={styles.btn}>
          Add Hospital to System Database
        </button>
      </form>

      {/* Hospitals List */}
      <h2 style={styles.sectionTitle}>Registered Healthcare Facilities ({hospitals.length})</h2>

      {loading ? (
        <div style={styles.loadingText}>Loading hospital records...</div>
      ) : (
        <div style={styles.grid}>
          {hospitals.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.hospitalName}>{item.name}</h3>
                <span style={styles.badge}>{item.type || "Hospital"}</span>
              </div>
              <p>📍 <strong>Address:</strong> {item.address || item.city}</p>
              <p>📍 <strong>City:</strong> {item.city}</p>
              <p>📞 <strong>Phone:</strong> {item.phone}</p>
              <p>🚨 <strong>Emergency Desk:</strong> {item.emergencyContact || item.phone}</p>
              <p>🩸 <strong>Stock:</strong> {item.blood}</p>
              <p>🚑 <strong>Ambulance:</strong> {item.ambulance}</p>

              <div style={styles.cardActions}>
                <button
                  style={styles.editBtn}
                  onClick={() => setEditHospital({ ...item })}
                >
                  ✏️ Edit
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => setDeleteId(item.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Hospital Modal */}
      {editHospital && (
        <div style={styles.overlay} onClick={() => setEditHospital(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
              Edit Hospital Facility
            </h3>

            <form onSubmit={saveEdit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                value={editHospital.name}
                onChange={(e) => setEditHospital({ ...editHospital, name: e.target.value })}
                placeholder="Hospital Name"
                style={styles.input}
                required
              />
              <input
                value={editHospital.city}
                onChange={(e) => setEditHospital({ ...editHospital, city: e.target.value })}
                placeholder="City"
                style={styles.input}
                required
              />
              <input
                value={editHospital.phone}
                onChange={(e) => setEditHospital({ ...editHospital, phone: e.target.value })}
                placeholder="Phone"
                style={styles.input}
                required
              />
              <input
                value={editHospital.blood}
                onChange={(e) => setEditHospital({ ...editHospital, blood: e.target.value })}
                placeholder="Blood Availability"
                style={styles.input}
              />

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button type="submit" style={styles.btn}>Save Changes</button>
                <button type="button" style={styles.closeBtn} onClick={() => setEditHospital(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={styles.overlay} onClick={() => setDeleteId(null)}>
          <div style={{ ...styles.modal, width: "400px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Delete Hospital Record
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
              Are you sure you want to delete this hospital record from the database?
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button style={styles.confirmDeleteBtn} onClick={confirmDelete}>
                Delete
              </button>
              <button style={styles.closeBtn} onClick={() => setDeleteId(null)}>
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
  formTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "16px",
  },
  form: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    background: "#f8fafc",
    outline: "none",
  },
  btn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px 28px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
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
    marginBottom: "12px",
  },
  hospitalName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  badge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },
  editBtn: {
    flex: 1,
    background: "#f1f5f9",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
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
  closeBtn: {
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
};

export default ManageHospitals;