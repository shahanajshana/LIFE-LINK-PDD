import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { getNearbyHospitals } from "../services/nearbyHospitals";

function Hospital() {
  const [search, setSearch]                 = useState("");
  const [hospitals, setHospitals]           = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [locationInfo, setLocationInfo]     = useState(null);   // { lat, lng, city }
  const [locationError, setLocationError]   = useState("");
  const [source, setSource]                 = useState("supabase"); // "osm" | "supabase"

  // ── load data ────────────────────────────────────────────────
  // ── load data ────────────────────────────────────────────────
  const fetchHospitals = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setLocationError("");

    try {
      // 1. Try real nearby hospitals via browser location / IP + OpenStreetMap / curated network
      const { hospitals: nearby, location } = await getNearbyHospitals(30000, forceRefresh);
      setLocationInfo(location);
      setHospitals(nearby);
      setSource(nearby[0]?.source || "osm");
    } catch (geoErr) {
      // 2. Fall back to registered hospitals API
      console.warn("Nearby fetch fallback:", geoErr);
      const data = await api.getHospitals(search);
      setHospitals(data || []);
      setSource("supabase");
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchHospitals(false);
  }, [fetchHospitals]);

  // ── client-side search filter (works for both sources) ───────
  const filtered = hospitals.filter((h) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      (h.city  || "").toLowerCase().includes(q) ||
      (h.type  || "").toLowerCase().includes(q) ||
      (h.address || "").toLowerCase().includes(q)
    );
  });

  // ── render ───────────────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏥 Nearby Hospitals</h1>
          <p style={styles.sub}>
            {locationInfo?.city
              ? `Real hospitals near ${locationInfo.city} — sorted by nearest distance`
              : "Find registered healthcare facilities, emergency contacts, and blood group stocks"}
          </p>
        </div>

        <div className="hospital-mobile-header-right" style={styles.headerRight}>
          <input
            className="hospital-mobile-search"
            type="text"
            placeholder="Search hospital or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
          <button style={styles.refreshBtn} onClick={() => fetchHospitals(true)} title="Refresh nearby hospitals">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Location banner ── */}
      {locationInfo && (
        <div style={styles.locationBanner}>
          <span>📍</span>
          <span>
            Showing <strong>{filtered.length}</strong> hospitals near your location
            {locationInfo.city ? ` in ${locationInfo.city}` : ""}
            {" "}· Radius 30 km · Sorted by distance
          </span>
        </div>
      )}

      {/* ── Location error / fallback notice ── */}
      {locationError && (
        <div style={styles.warnBanner}>
          <span>⚠️</span>
          <span>{locationError}</span>
          <button style={styles.retryBtn} onClick={() => fetchHospitals(true)}>Try Again</button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="hospital-mobile-stats" style={styles.stats}>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>24/7</h2>
          <p style={styles.statLabel}>Emergency Support Desk</p>
        </div>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>{filtered.length}+</h2>
          <p style={styles.statLabel}>{source === "osm" ? "Nearby Hospitals Found" : "Active Partner Hospitals"}</p>
        </div>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>8</h2>
          <p style={styles.statLabel}>Blood Groups Tracked</p>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>
            {source === "osm"
              ? "📍 Detecting your location and finding nearby hospitals..."
              : "Loading hospital directory..."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          {search
            ? `No hospitals found matching "${search}".`
            : "No hospitals found near your location. Try the Refresh button or allow location access."}
        </div>
      ) : (
        <div className="hospital-mobile-grid" style={styles.grid}>
          {filtered.map((hospital, index) => (
            <div key={hospital.id || index} style={styles.card}>

              <div style={styles.topRow}>
                <h3 style={styles.hospitalName}>{hospital.name}</h3>
                <span style={styles.badge}>{hospital.type || "General Hospital"}</span>
              </div>

              {/* Distance badge — only for OSM results */}
              {hospital.distLabel && (
                <span style={styles.distBadge}>📍 {hospital.distLabel}</span>
              )}

              <div style={styles.infoBox}>
                {hospital.address && <p>🏠 <strong>Address:</strong> {hospital.address}</p>}
                {hospital.city    && <p>📍 <strong>City:</strong> {hospital.city}</p>}
                <p>📞 <strong>Phone:</strong> {hospital.phone !== "N/A" ? hospital.phone : "Contact hospital"}</p>
                <p>🚨 <strong>Emergency Contact:</strong> {hospital.emergencyContact !== "N/A" ? hospital.emergencyContact : "Contact hospital"}</p>
                <p>🩸 <strong>Blood:</strong> {hospital.blood}</p>
                <p>🚑 <strong>Ambulance:</strong> {hospital.ambulance}</p>
                {hospital.openingHours && source === "osm" && (
                  <p>🕒 <strong>Hours:</strong> {hospital.openingHours}</p>
                )}
                {hospital.website && (
                  <p>🌐 <a href={hospital.website} target="_blank" rel="noreferrer" style={{ color: "#ef4444" }}>Visit Website</a></p>
                )}
              </div>

              <div style={styles.buttons}>
                <button style={styles.btn} onClick={() => setSelectedHospital(hospital)}>
                  View Details 👁️
                </button>
                <button
                  style={styles.outlineBtn}
                  onClick={() =>
                    hospital.phone !== "N/A"
                      ? alert(`Calling ${hospital.name}: ${hospital.emergencyContact || hospital.phone}`)
                      : alert("Phone number not available for this hospital.")
                  }
                >
                  Contact 📞
                </button>
              </div>

              {/* Open in Maps */}
              {hospital.lat && hospital.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.mapsLink}
                >
                  🗺️ Open in Google Maps
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Emergency helpline banner ── */}
      <div className="hospital-mobile-emergency" style={styles.emergencyBox}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "6px" }}>
            🚨 Need immediate emergency hospital dispatch?
          </h2>
          <p style={{ fontSize: "14px", opacity: 0.9 }}>
            Connect directly with our 24/7 LifeLink emergency desk for instant ambulance dispatch.
          </p>
        </div>
        <button
          style={styles.emergencyBtn}
          onClick={() => alert("Dialing 24/7 LifeLink Emergency Desk: 1800-123-BLOOD (25663)")}
        >
          Call Emergency Desk 📞
        </button>
      </div>

      {/* ── Details modal ── */}
      {selectedHospital && (
        <div style={styles.overlay} onClick={() => setSelectedHospital(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ color: "#0f172a", margin: 0, fontSize: "18px" }}>{selectedHospital.name}</h2>
              <span style={styles.badge}>{selectedHospital.type || "Hospital"}</span>
            </div>

            <div style={styles.modalBody}>
              {selectedHospital.distLabel && (
                <p><strong>Distance:</strong> {selectedHospital.distLabel}</p>
              )}
              <p><strong>Address:</strong> {selectedHospital.address || "—"}</p>
              <p><strong>City:</strong> {selectedHospital.city || "—"}</p>
              <p><strong>Phone:</strong> {selectedHospital.phone}</p>
              <p><strong>Email:</strong> {selectedHospital.email || "—"}</p>
              <p><strong>Emergency Contact:</strong> {selectedHospital.emergencyContact}</p>
              <p><strong>Blood Stock:</strong> {selectedHospital.blood}</p>
              <p><strong>Ambulance:</strong> {selectedHospital.ambulance}</p>
              {selectedHospital.openingHours && (
                <p><strong>Opening Hours:</strong> {selectedHospital.openingHours}</p>
              )}
              {selectedHospital.website && (
                <p><strong>Website:</strong>{" "}
                  <a href={selectedHospital.website} target="_blank" rel="noreferrer" style={{ color: "#ef4444" }}>
                    {selectedHospital.website}
                  </a>
                </p>
              )}
              {selectedHospital.lat && selectedHospital.lng && (
                <p><strong>Coordinates:</strong> {selectedHospital.lat.toFixed(5)}, {selectedHospital.lng.toFixed(5)}</p>
              )}
              {selectedHospital.source === "openstreetmap" && (
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
                  Data © OpenStreetMap contributors
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
              {selectedHospital.lat && selectedHospital.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedHospital.lat},${selectedHospital.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...styles.btn, textDecoration: "none", textAlign: "center" }}
                >
                  🗺️ Open in Maps
                </a>
              )}
              <button
                style={styles.btn}
                onClick={() => alert(`Calling: ${selectedHospital.emergencyContact || selectedHospital.phone}`)}
              >
                📞 Call
              </button>
              <button style={styles.closeBtn} onClick={() => setSelectedHospital(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", flexWrap: "wrap", gap: "16px",
  },
  headerRight: { display: "flex", gap: "10px", alignItems: "center" },
  title:  { fontSize: "26px", fontWeight: "800", color: "#0f172a" },
  sub:    { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  search: {
    width: "280px", padding: "12px 16px", borderRadius: "12px",
    border: "1px solid #cbd5e1", fontSize: "14px",
    background: "#ffffff", outline: "none",
  },
  refreshBtn: {
    padding: "10px 16px", borderRadius: "12px", border: "1px solid #e2e8f0",
    background: "#ffffff", cursor: "pointer", fontSize: "13px", fontWeight: "700",
    color: "#475569",
  },
  locationBanner: {
    display: "flex", gap: "10px", alignItems: "center",
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "12px", padding: "12px 18px",
    fontSize: "13px", color: "#166534",
  },
  warnBanner: {
    display: "flex", gap: "10px", alignItems: "center",
    background: "#fffbeb", border: "1px solid #fde68a",
    borderRadius: "12px", padding: "12px 18px",
    fontSize: "13px", color: "#92400e",
  },
  retryBtn: {
    marginLeft: "auto", padding: "6px 14px", borderRadius: "8px",
    background: "#f59e0b", color: "white", border: "none",
    fontWeight: "700", fontSize: "12px", cursor: "pointer",
  },
  stats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  statCard: {
    background: "#ffffff", padding: "24px", borderRadius: "18px",
    border: "1px solid #e2e8f0", textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  statNumber: { fontSize: "32px", fontWeight: "800", color: "#ef4444", margin: "0 0 4px 0" },
  statLabel:  { fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "600" },
  loadingBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "16px", padding: "60px 0",
  },
  spinner: {
    width: "36px", height: "36px", border: "4px solid #fee2e2",
    borderTop: "4px solid #ef4444", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#64748b", fontSize: "14px", textAlign: "center" },
  emptyState: {
    textAlign: "center", padding: "40px", background: "#ffffff",
    borderRadius: "16px", color: "#64748b",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" },
  card: {
    background: "#ffffff", padding: "24px", borderRadius: "20px",
    border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    display: "flex", flexDirection: "column", gap: "10px",
  },
  topRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", gap: "12px",
  },
  hospitalName: { fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 },
  badge: {
    background: "#fee2e2", color: "#991b1b",
    padding: "4px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "800", whiteSpace: "nowrap",
  },
  distBadge: {
    display: "inline-block", background: "#eff6ff", color: "#1d4ed8",
    borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: "700",
  },
  infoBox: {
    fontSize: "13px", color: "#475569",
    display: "flex", flexDirection: "column", gap: "4px",
  },
  buttons: { display: "flex", gap: "10px", marginTop: "4px" },
  btn: {
    flex: 1, background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white", border: "none", padding: "10px 16px",
    borderRadius: "12px", fontWeight: "700", fontSize: "13px", cursor: "pointer",
  },
  outlineBtn: {
    flex: 1, background: "#ffffff", color: "#ef4444",
    border: "1px solid #ef4444", padding: "10px 16px",
    borderRadius: "12px", fontWeight: "700", fontSize: "13px", cursor: "pointer",
  },
  mapsLink: {
    display: "block", textAlign: "center", fontSize: "12px",
    color: "#3b82f6", textDecoration: "none", fontWeight: "600",
  },
  emergencyBox: {
    background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    color: "white", padding: "32px", borderRadius: "20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 10px 25px rgba(239,68,68,0.25)",
  },
  emergencyBtn: {
    background: "#ffffff", color: "#ef4444", border: "none",
    padding: "14px 24px", borderRadius: "14px",
    fontWeight: "800", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
  },
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#ffffff", width: "500px", maxWidth: "95vw",
    padding: "28px", borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    maxHeight: "85vh", overflowY: "auto",
  },
  modalBody: {
    display: "flex", flexDirection: "column", gap: "8px",
    fontSize: "14px", color: "#334155",
  },
  closeBtn: {
    background: "#0f172a", color: "#ffffff", border: "none",
    padding: "10px 20px", borderRadius: "12px",
    fontWeight: "700", fontSize: "13px", cursor: "pointer",
  },
};

// inject keyframe and mobile responsive rules
if (!document.getElementById("hospital-spin-style")) {
  const style = document.createElement("style");
  style.id = "hospital-spin-style";
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      .hospital-mobile-stats {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      .hospital-mobile-grid {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }
      .hospital-mobile-search {
        width: 100% !important;
      }
      .hospital-mobile-header-right {
        width: 100% !important;
        display: flex !important;
      }
      .hospital-mobile-emergency {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 16px !important;
        padding: 20px !important;
      }
      .hospital-mobile-emergency button {
        width: 100% !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Hospital;
