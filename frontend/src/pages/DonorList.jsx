import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

function DonorList() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [contactDonor, setContactDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    const query = {};
    if (selectedGroup) query.bloodGroup = selectedGroup;
    const res = await api.getDonors(query);
    if (res) setDonors(res);
    setLoading(false);
  }, [selectedGroup]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const filteredDonors = donors.filter((donor) => {
    const q = search.toLowerCase();
    const matchesSearch =
      donor.name.toLowerCase().includes(q) ||
      (donor.city && donor.city.toLowerCase().includes(q));
    return matchesSearch;
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Verified Donors Directory</h1>
          <p style={styles.subtitle}>Find and connect with active blood donors near your location</p>
        </div>

        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search donor name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={styles.selectInput}
          >
            <option value="">All Blood Groups</option>
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
      </div>

      {loading ? (
        <div style={styles.loadingText}>Loading verified donors...</div>
      ) : filteredDonors.length === 0 ? (
        <div style={styles.emptyState}>No donors match your search criteria.</div>
      ) : (
        <div style={styles.grid}>
          {filteredDonors.map((donor, index) => (
            <div key={donor.id || index} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.avatar}>
                  {donor.name ? donor.name.charAt(0).toUpperCase() : "D"}
                </div>
                <div>
                  <h3 style={styles.donorName}>{donor.name}</h3>
                  <p style={styles.cityText}>📍 {donor.city}</p>
                </div>
              </div>

              <div style={styles.infoRow}>
                <div>
                  <span style={styles.label}>Blood Group</span>
                  <h3 style={styles.bloodTag}>{donor.bloodGroup || donor.blood}</h3>
                </div>

                <div>
                  <span style={styles.label}>Distance</span>
                  <h4 style={styles.valueText}>{donor.distance || "3.0 km"}</h4>
                </div>
              </div>

              <div style={styles.phoneBox}>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Last Donation:</p>
                <strong>{donor.lastDonation || "12 March 2026"}</strong>
              </div>

              <span
                style={{
                  ...styles.statusBadge,
                  background: donor.status === "Available" ? "#dcfce7" : "#fee2e2",
                  color: donor.status === "Available" ? "#166534" : "#991b1b",
                }}
              >
                {donor.status || "Available"}
              </span>

              <div style={styles.buttonRow}>
                <button
                  style={styles.contactBtn}
                  onClick={() => setContactDonor(donor)}
                >
                  Contact 📞
                </button>
                <button
                  style={styles.detailsBtn}
                  onClick={() => setSelectedDonor(donor)}
                >
                  View Details 👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Info Modal */}
      {contactDonor && (
        <div style={styles.overlay} onClick={() => setContactDonor(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Donor Contact Information
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
              Reach out directly to emergency donor <strong>{contactDonor.name}</strong>.
            </p>

            <div style={styles.contactInfoBox}>
              <p>👤 <strong>Full Name:</strong> {contactDonor.name}</p>
              <p>🩸 <strong>Blood Group:</strong> {contactDonor.bloodGroup || contactDonor.blood}</p>
              <p>📞 <strong>Phone Number:</strong> {contactDonor.phone}</p>
              <p>📍 <strong>City:</strong> {contactDonor.city}</p>
              <p>📌 <strong>Distance:</strong> {contactDonor.distance || "2.5 km"}</p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                style={styles.contactBtn}
                onClick={() => window.location.href = `tel:${contactDonor.phone}`}
              >
                Call Phone Now 📞
              </button>
              <button
                style={styles.closeBtn}
                onClick={() => setContactDonor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete View Details Modal */}
      {selectedDonor && (
        <div style={styles.overlay} onClick={() => setSelectedDonor(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={styles.avatar}>
                {selectedDonor.name ? selectedDonor.name.charAt(0).toUpperCase() : "D"}
              </div>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  {selectedDonor.name}
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  Verified Donor Profile
                </p>
              </div>
            </div>

            <div style={styles.modalBody}>
              <p><strong>Full Name:</strong> {selectedDonor.name}</p>
              <p><strong>Blood Group:</strong> {selectedDonor.bloodGroup || selectedDonor.blood}</p>
              <p><strong>Age:</strong> {selectedDonor.age || 24} years old</p>
              <p><strong>Gender:</strong> {selectedDonor.gender || "Male"}</p>
              <p><strong>City Location:</strong> {selectedDonor.city}</p>
              <p><strong>Contact Phone:</strong> {selectedDonor.phone}</p>
              <p><strong>Donation History:</strong> {selectedDonor.donationsCount || 8} verified donations</p>
              <p><strong>Last Donation Date:</strong> {selectedDonor.lastDonation || "12 March 2026"}</p>
              <p><strong>Donor Availability:</strong> {selectedDonor.status || "Available"}</p>
              <p><strong>Distance to You:</strong> {selectedDonor.distance || "2.5 km"}</p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                style={styles.contactBtn}
                onClick={() => {
                  const d = selectedDonor;
                  setSelectedDonor(null);
                  setContactDonor(d);
                }}
              >
                Contact Donor
              </button>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedDonor(null)}
              >
                Close
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
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "4px",
  },
  controls: {
    display: "flex",
    gap: "12px",
  },
  searchInput: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    width: "280px",
    background: "#ffffff",
    outline: "none",
  },
  selectInput: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    background: "#ffffff",
    outline: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },
  donorName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  cityText: {
    fontSize: "13px",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    background: "#f8fafc",
    padding: "12px 16px",
    borderRadius: "14px",
    marginBottom: "12px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    display: "block",
  },
  bloodTag: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#ef4444",
    margin: "2px 0 0 0",
  },
  valueText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "4px 0 0 0",
  },
  phoneBox: {
    fontSize: "13px",
    color: "#334155",
    marginBottom: "12px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "16px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
  },
  contactBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  detailsBtn: {
    flex: 1,
    background: "#ffffff",
    color: "#ef4444",
    border: "1px solid #ef4444",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
    fontSize: "16px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    background: "#ffffff",
    borderRadius: "16px",
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
    width: "460px",
    padding: "28px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  contactInfoBox: {
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "16px",
    fontSize: "14px",
    color: "#334155",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#334155",
  },
  closeBtn: {
    background: "#0f172a",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default DonorList;