import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ALL_BLOOD_GROUPS,
  BLOOD_GROUP_INFO,
  getCompatibleDonors,
  getCompatibleRecipients,
  isCompatible,
  getMatchBadge,
} from "../services/bloodCompatibility";
import "./FindBlood.css";

// Haversine distance calculator
function calcDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function FindBlood() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Search State ───────────────────────────────────────────────────────────
  const [bloodGroup, setBloodGroup] = useState("B+"); // User example default B+
  const [requiredUnits, setRequiredUnits] = useState(1);
  const [locationInput, setLocationInput] = useState("");
  const [maxDistance, setMaxDistance] = useState("25"); // 5, 10, 25, 50, 100, all
  const [urgency, setUrgency] = useState("Normal"); // Normal, Urgent, Emergency
  const [includeCompatible, setIncludeCompatible] = useState(true);
  const [sortBy, setSortBy] = useState("distance"); // distance, units, facility

  // ── Geolocation State ──────────────────────────────────────────────────────
  const [userCoords, setUserCoords] = useState(null);
  const [locDetecting, setLocDetecting] = useState(false);
  const [locStatusMsg, setLocStatusMsg] = useState("");

  // ── Data State ─────────────────────────────────────────────────────────────
  const [allStock, setAllStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modals State ───────────────────────────────────────────────────────────
  const [requestModal, setRequestModal] = useState(null);
  const [hospitalModal, setHospitalModal] = useState(null);
  const [contactModal, setContactModal] = useState(null);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // ── Request Form State ─────────────────────────────────────────────────────
  const [reqForm, setReqForm] = useState({
    patientName: "",
    age: "",
    gender: "Female",
    hospitalName: "",
    wardNumber: "",
    phone: "",
    urgency: "Urgent",
    reason: "Surgical Requirement / Low Hemoglobin",
  });
  const [submittingReq, setSubmittingReq] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  // ── Load Inventory on Mount ────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const stockRes = await api.getBloodStock().catch(() => []);
        setAllStock(stockRes || []);
      } catch (err) {
        console.error("Error loading inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Pre-fill user details if logged in
    if (user?.phone) {
      setReqForm((prev) => ({
        ...prev,
        phone: user.phone,
        patientName: user.name || "",
      }));
    }
    if (user?.city && !locationInput) {
      setLocationInput(user.city);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Auto-Detect Location Handler ───────────────────────────────────────────
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocStatusMsg("Geolocation is not supported by your browser.");
      return;
    }
    setLocDetecting(true);
    setLocStatusMsg("Detecting your GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let detectedCity = "";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.state_district ||
            "";
        } catch (e) {
          console.warn("Geocode lookup failed:", e);
        }

        setUserCoords({ lat, lng, city: detectedCity });
        if (detectedCity && !locationInput) {
          setLocationInput(detectedCity);
        }
        setLocDetecting(false);
        setLocStatusMsg(
          detectedCity
            ? `📍 Location detected: ${detectedCity}`
            : `📍 GPS coordinates pinned (${lat.toFixed(2)}, ${lng.toFixed(2)})`
        );
      },
      () => {
        setLocDetecting(false);
        setUserCoords({ lat: 13.0604, lng: 80.2496, city: "Chennai" });
        setLocStatusMsg("Using Chennai regional center.");
      },
      { timeout: 8000 }
    );
  }, [locationInput]);

  // ── Filter & Search Logic ──────────────────────────────────────────────────
  const filteredResults = useMemo(() => {
    if (!allStock || allStock.length === 0) return [];

    const refLat =
      userCoords?.lat ||
      (locationInput.toLowerCase().includes("bangalore")
        ? 12.9716
        : locationInput.toLowerCase().includes("hyderabad")
        ? 17.385
        : locationInput.toLowerCase().includes("delhi")
        ? 28.5603
        : locationInput.toLowerCase().includes("mumbai")
        ? 19.0028
        : 13.0604);

    const refLng =
      userCoords?.lng ||
      (locationInput.toLowerCase().includes("bangalore")
        ? 77.5946
        : locationInput.toLowerCase().includes("hyderabad")
        ? 78.4867
        : locationInput.toLowerCase().includes("delhi")
        ? 77.2798
        : locationInput.toLowerCase().includes("mumbai")
        ? 72.8423
        : 80.2496);

    let items = allStock.map((item) => {
      const stockGroup = item.bloodGroup || item.group || "";
      const isExact = stockGroup === bloodGroup;
      const isComp = bloodGroup ? isCompatible(stockGroup, bloodGroup) : true;
      const matchBadge = getMatchBadge(stockGroup, bloodGroup);

      let distanceKm = null;
      if (item.lat && item.lng && refLat && refLng) {
        distanceKm = calcDistanceKm(refLat, refLng, item.lat, item.lng);
      } else {
        distanceKm =
          item.city?.toLowerCase() === (locationInput || "chennai").toLowerCase()
            ? 3.2
            : 18.5;
      }

      return {
        ...item,
        stockGroup,
        isExact,
        isComp,
        matchBadge,
        distanceKm: distanceKm ? Number(distanceKm.toFixed(1)) : 5.0,
      };
    });

    // 1. Filter by Blood Group & Compatibility
    if (bloodGroup) {
      if (includeCompatible) {
        items = items.filter((i) => i.isComp);
      } else {
        items = items.filter((i) => i.isExact);
      }
    }

    // 2. Filter by Location
    if (locationInput.trim()) {
      const query = locationInput.toLowerCase();
      items = items.filter(
        (i) =>
          (i.city || "").toLowerCase().includes(query) ||
          (i.location || "").toLowerCase().includes(query) ||
          (i.facility || "").toLowerCase().includes(query) ||
          (i.address || "").toLowerCase().includes(query)
      );
    }

    // 3. Filter by Distance Radius
    if (maxDistance !== "all") {
      const maxKm = parseFloat(maxDistance);
      if (!isNaN(maxKm)) {
        items = items.filter((i) => (i.distanceKm ?? 0) <= maxKm);
      }
    }

    // 4. Sorting
    items.sort((a, b) => {
      if (sortBy === "distance") {
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      }
      if (sortBy === "units") {
        return (b.units ?? 0) - (a.units ?? 0);
      }
      if (sortBy === "facility") {
        return (a.facility || "").localeCompare(b.facility || "");
      }
      return 0;
    });

    return items;
  }, [allStock, bloodGroup, includeCompatible, locationInput, maxDistance, sortBy, userCoords]);

  // ── Open Request Modal ─────────────────────────────────────────────────────
  const handleOpenRequest = (item) => {
    setRequestModal(item);
    setSubmittedReceipt(null);
    setReqForm((prev) => ({
      ...prev,
      hospitalName: item.facility || "Regional Blood Bank",
      patientName: user?.name || prev.patientName || "",
      phone: user?.phone || prev.phone || "+91 9876543210",
      urgency:
        urgency === "Emergency"
          ? "Emergency"
          : urgency === "Urgent"
          ? "Urgent"
          : "Normal",
    }));
  };

  // ── Submit Blood Request ───────────────────────────────────────────────────
  const handleSubmitBloodRequest = async (e) => {
    e.preventDefault();
    if (!requestModal) return;
    setSubmittingReq(true);

    try {
      const generatedId = "REQ-" + Math.floor(1000 + Math.random() * 9000);
      const reqPayload = {
        patientName: reqForm.patientName || "Emergency Patient",
        bloodGroup: requestModal.stockGroup || requestModal.bloodGroup,
        units: Number(requiredUnits) || 1,
        hospital: requestModal.facility || "Blood Center",
        city: requestModal.city || locationInput || "Chennai",
        phone: reqForm.phone || "+91 9876543210",
        urgency: reqForm.urgency || urgency || "Urgent",
        notes: `Age: ${reqForm.age || "N/A"}, Gender: ${reqForm.gender}, Ward: ${
          reqForm.wardNumber || "General"
        }, Reason: ${reqForm.reason}`,
      };

      await api.createBloodRequest(reqPayload);

      setSubmittedReceipt({
        id: generatedId,
        patientName: reqForm.patientName,
        bloodGroup: requestModal.stockGroup,
        units: requiredUnits,
        facility: requestModal.facility,
        city: requestModal.city,
        phone: reqForm.phone,
        urgency: reqForm.urgency,
        timestamp: new Date().toLocaleString("en-IN"),
      });
    } catch (err) {
      console.error("Failed to submit blood request:", err);
      alert("Failed to submit request: " + err.message);
    } finally {
      setSubmittingReq(false);
    }
  };

  const activeCompatInfo = bloodGroup ? BLOOD_GROUP_INFO[bloodGroup] : null;
  const activeDonors = bloodGroup ? getCompatibleDonors(bloodGroup) : [];
  const activeRecipients = bloodGroup ? getCompatibleRecipients(bloodGroup) : [];

  return (
    <div className="fb-page-container">
      {/* ── 1. Hero Banner ──────────────────────────────────────────────────── */}
      <section className="fb-hero-banner">
        <div className="fb-hero-content">
          <div className="fb-hero-badge">
            <span>🩸</span>
            <span>Emergency Blood Sourcing &amp; Allocation</span>
          </div>
          <h1 className="fb-hero-title">Find Blood &amp; Hospital Reserves</h1>
          <p className="fb-hero-subtitle">
            Designed for patients in urgent need. Search verified blood banks and
            partner hospitals in real-time with medical blood compatibility
            matching and instant hospital dispatch.
          </p>
        </div>

        <div className="fb-hero-stats">
          <div className="fb-hero-stat-card">
            <h3 className="fb-stat-val">
              {filteredResults.reduce((acc, curr) => acc + (curr.units || 0), 0)}
            </h3>
            <p className="fb-stat-lbl">Units in Stock</p>
          </div>
          <div className="fb-hero-stat-card">
            <h3 className="fb-stat-val">{filteredResults.length}</h3>
            <p className="fb-stat-lbl">Verified Centers</p>
          </div>
          <div className="fb-hero-stat-card">
            <h3 className="fb-stat-val">
              {filteredResults.length > 0
                ? `${filteredResults[0].distanceKm} km`
                : "1.8 km"}
            </h3>
            <p className="fb-stat-lbl">Nearest Hub</p>
          </div>
        </div>
      </section>

      {/* ── 2. Urgent Emergency SOS Ribbon ─────────────────────────────────── */}
      <section className="fb-emergency-ribbon">
        <div className="fb-ribbon-text">
          <div className="fb-pulse-dot" />
          <span>
            <strong>Critical Patient Case?</strong> If surgery is within 2 hours
            or patient is in ICU, trigger 24/7 Priority Emergency SOS.
          </span>
        </div>
        <button
          className="fb-sos-btn"
          onClick={() => navigate("/emergency")}
        >
          🚨 Launch Emergency SOS Broadcast
        </button>
      </section>

      {/* ── 3. Search & Filter Control Card ─────────────────────────────────── */}
      <section className="fb-filter-card">
        <div className="fb-filter-section-title">
          <span>🔍 SEARCH ACTIVE BLOOD RESERVES</span>
          {locStatusMsg && (
            <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600" }}>
              {locStatusMsg}
            </span>
          )}
        </div>

        {/* Blood Group Selector (Pill Buttons) */}
        <div className="fb-input-group">
          <label className="fb-label">
            <span>1. PATIENT BLOOD GROUP</span>
            {bloodGroup && (
              <span style={{ color: "#ef4444" }}>
                Selected: <strong>{bloodGroup}</strong> (
                {includeCompatible
                  ? "Showing Compatible Donors"
                  : "Exact Match Only"}
                )
              </span>
            )}
          </label>
          <div className="fb-blood-group-selector">
            <button
              className={`fb-bg-btn ${bloodGroup === "" ? "active" : ""}`}
              onClick={() => setBloodGroup("")}
            >
              <span>All</span>
              <span className="fb-bg-sub">Any Type</span>
            </button>
            {ALL_BLOOD_GROUPS.map((grp) => (
              <button
                key={grp}
                className={`fb-bg-btn ${bloodGroup === grp ? "active" : ""}`}
                onClick={() => setBloodGroup(grp)}
              >
                <span>{grp}</span>
                <span className="fb-bg-sub">
                  {grp === "O-"
                    ? "Univ. Donor"
                    : grp === "AB+"
                    ? "Univ. Recip."
                    : "RBC Stock"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="fb-form-grid">
          {/* Required Units */}
          <div className="fb-input-group">
            <label className="fb-label">
              <span>2. REQUIRED UNITS</span>
              <span style={{ color: "#64748b" }}>{requiredUnits * 350} ml approx</span>
            </label>
            <div className="fb-units-stepper">
              <button
                type="button"
                className="fb-step-btn"
                onClick={() => setRequiredUnits((prev) => Math.max(1, prev - 1))}
              >
                −
              </button>
              <div className="fb-step-display">
                {requiredUnits} {requiredUnits === 1 ? "Unit" : "Units"}
              </div>
              <button
                type="button"
                className="fb-step-btn"
                onClick={() => setRequiredUnits((prev) => Math.min(20, prev + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Location & City */}
          <div className="fb-input-group">
            <label className="fb-label">
              <span>3. LOCATION / CITY / AREA</span>
              <span
                style={{ color: "#ef4444", cursor: "pointer", fontSize: "11px" }}
                onClick={handleDetectLocation}
              >
                {locDetecting ? "⏳ Locating..." : "📍 Use GPS"}
              </span>
            </label>
            <div className="fb-input-wrapper">
              <input
                type="text"
                className="fb-input"
                placeholder="e.g. Chennai, Greams Road, Bangalore..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
            </div>
          </div>

          {/* Distance / Radius */}
          <div className="fb-input-group">
            <label className="fb-label">
              <span>4. DISTANCE / RADIUS</span>
              <span style={{ color: "#64748b" }}>Max travel range</span>
            </label>
            <select
              className="fb-select"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
            >
              <option value="5">Within 5 km (Immediate Radius)</option>
              <option value="10">Within 10 km (City Local)</option>
              <option value="25">Within 25 km (Metropolitan Area)</option>
              <option value="50">Within 50 km (Regional Reach)</option>
              <option value="100">Within 100 km (State Boundary)</option>
              <option value="all">Any Distance (All Registered)</option>
            </select>
          </div>

          {/* Urgency */}
          <div className="fb-input-group">
            <label className="fb-label">
              <span>5. URGENCY LEVEL</span>
              <span
                style={{
                  color:
                    urgency === "Emergency"
                      ? "#dc2626"
                      : urgency === "Urgent"
                      ? "#d97706"
                      : "#16a34a",
                }}
              >
                ● {urgency}
              </span>
            </label>
            <select
              className="fb-select"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="Normal">🟢 Routine / Planned Surgery (Within 48h)</option>
              <option value="Urgent">🟡 Urgent Requirement (Within 12-24h)</option>
              <option value="Emergency">🔴 Critical Emergency (Immediate SOS)</option>
            </select>
          </div>
        </div>

        {/* Quick City Filters Chips */}
        <div className="fb-quick-chips">
          <span className="fb-chip-label">Quick City Filter:</span>
          {["Chennai", "Bangalore", "Hyderabad", "Delhi", "Mumbai"].map((city) => (
            <button
              key={city}
              type="button"
              className={`fb-chip ${
                locationInput.toLowerCase() === city.toLowerCase() ? "active" : ""
              }`}
              onClick={() =>
                setLocationInput(
                  locationInput.toLowerCase() === city.toLowerCase() ? "" : city
                )
              }
            >
              {city}
            </button>
          ))}
          {locationInput && (
            <button
              type="button"
              className="fb-chip"
              style={{ background: "#fee2e2", color: "#dc2626" }}
              onClick={() => setLocationInput("")}
            >
              ✕ Clear Location
            </button>
          )}
        </div>

        {/* Controls Footer */}
        <div className="fb-controls-footer">
          <label className="fb-toggle-label">
            <div className="fb-toggle-switch">
              <input
                type="checkbox"
                checked={includeCompatible}
                onChange={(e) => setIncludeCompatible(e.target.checked)}
              />
              <span className="fb-toggle-slider" />
            </div>
            <span>
              🧬 Include Compatible Blood Groups (e.g. {bloodGroup || "B+"} can receive
              from {activeDonors.join(", ")})
            </span>
          </label>

          <div className="fb-action-row">
            <button
              type="button"
              className={`fb-geo-btn ${userCoords ? "active" : ""}`}
              onClick={handleDetectLocation}
            >
              <span>{locDetecting ? "🔄 Locating..." : "📍 Detect Nearby"}</span>
            </button>
            <button
              type="button"
              className="fb-clear-btn"
              onClick={() => {
                setBloodGroup("");
                setRequiredUnits(1);
                setLocationInput("");
                setMaxDistance("all");
                setUrgency("Normal");
                setIncludeCompatible(true);
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. Interactive Blood Compatibility Panel ───────────────────────── */}
      {bloodGroup && (
        <section className="fb-compatibility-box">
          <div className="fb-compat-header">
            <h3 className="fb-compat-title">
              <span>🧬</span>
              <span>
                Blood Compatibility Matrix for Patient: <strong>{bloodGroup}</strong>
              </span>
            </h3>
            <button
              className="fb-compat-matrix-btn"
              onClick={() => setShowMatrixModal(true)}
            >
              📊 View Full 8×8 Compatibility Chart
            </button>
          </div>

          <div className="fb-compat-grid">
            {/* Can receive from (Donors) */}
            <div className="fb-compat-card">
              <h4 className="fb-compat-card-title">
                🩸 {bloodGroup} Patient CAN RECEIVE FROM (Compatible Donors):
              </h4>
              <div className="fb-compat-badges">
                {activeDonors.map((grp) => (
                  <span
                    key={grp}
                    className={`fb-compat-pill ${
                      grp === bloodGroup
                        ? "exact"
                        : grp === "O-"
                        ? "universal"
                        : "compatible"
                    }`}
                  >
                    {grp === bloodGroup ? "🎯" : grp === "O-" ? "⭐" : "✓"} {grp}
                    {grp === bloodGroup && " (Exact)"}
                    {grp === "O-" && " (Universal)"}
                  </span>
                ))}
              </div>
              <p className="fb-compat-desc">
                {bloodGroup === "B+" &&
                  "B+ patients can safely receive red blood cells from B+, B-, O+, and O- donors."}
                {bloodGroup === "O-" &&
                  "O- is the Universal Donor, but O- patients can ONLY receive O- blood."}
                {bloodGroup === "AB+" &&
                  "AB+ is the Universal Recipient and can safely receive any blood group."}
                {bloodGroup !== "B+" &&
                  bloodGroup !== "O-" &&
                  bloodGroup !== "AB+" &&
                  `Transfusions from ${activeDonors.join(
                    ", "
                  )} are compatible with ${bloodGroup} red blood cells.`}
              </p>
            </div>

            {/* Can donate to (Recipients) */}
            <div className="fb-compat-card">
              <h4 className="fb-compat-card-title">
                🎁 {bloodGroup} Patient CAN DONATE TO:
              </h4>
              <div className="fb-compat-badges">
                {activeRecipients.map((grp) => (
                  <span key={grp} className="fb-compat-pill compatible">
                    {grp === bloodGroup ? "🎯" : "✓"} {grp}
                  </span>
                ))}
              </div>
              <p className="fb-compat-desc">
                {activeCompatInfo?.role ||
                  `Clinical profile: Contains ${
                    activeCompatInfo?.antigens || "antigens"
                  } with ${activeCompatInfo?.antibodies || "antibodies"}.`}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Results Header & Sorting ─────────────────────────────────────── */}
      <div className="fb-results-header">
        <h2 className="fb-results-count">
          <span>🏥 Matching Blood Availability ({filteredResults.length})</span>
          {bloodGroup && (
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>
              for {requiredUnits} {requiredUnits === 1 ? "unit" : "units"} of{" "}
              {bloodGroup}
            </span>
          )}
        </h2>

        <div className="fb-results-tools">
          <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>
            SORT BY:
          </label>
          <select
            className="fb-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="distance">📍 Nearest Distance</option>
            <option value="units">📦 Highest Units Available</option>
            <option value="facility">🏥 Facility Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ── 6. Results List / Cards Grid ────────────────────────────────────── */}
      {loading ? (
        <div className="fb-empty-state">
          <div
            className="fb-pulse-dot"
            style={{ width: "24px", height: "24px", background: "#ef4444" }}
          />
          <h3 className="fb-empty-title">Scanning Hospital &amp; Blood Bank Inventory...</h3>
          <p className="fb-empty-desc">
            Querying real-time reserves across verified healthcare centers.
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="fb-empty-state">
          <div className="fb-empty-icon">🩸</div>
          <h3 className="fb-empty-title">No matching blood stock found in this area</h3>
          <p className="fb-empty-desc">
            No blood banks or hospitals match your criteria for{" "}
            <strong>{bloodGroup || "Selected Group"}</strong> within{" "}
            <strong>
              {maxDistance === "all" ? "the region" : `${maxDistance} km`}
            </strong>.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              className="fb-sos-btn"
              style={{ background: "#dc2626", color: "#ffffff" }}
              onClick={() => navigate("/emergency")}
            >
              🚨 Broadcast Emergency SOS to Donors
            </button>
            <button
              className="fb-chip"
              onClick={() => {
                setMaxDistance("all");
                setIncludeCompatible(true);
              }}
            >
              Expand Search Radius
            </button>
          </div>
        </div>
      ) : (
        <div className="fb-cards-grid">
          {filteredResults.map((item, idx) => {
            const isExactMatch = item.stockGroup === bloodGroup;

            return (
              <div key={item.id || idx} className="fb-card">
                <div
                  className={`fb-card-match-strip ${
                    isExactMatch
                      ? "exact"
                      : item.stockGroup === "O-"
                      ? "universal"
                      : "compatible"
                  }`}
                />

                {/* Card Top: Blood Badge & Facility Info */}
                <div className="fb-card-top">
                  <div
                    className={`fb-blood-badge-circle ${
                      isExactMatch ? "exact" : "compatible"
                    }`}
                  >
                    <span className="fb-bg-text">{item.stockGroup}</span>
                    <span className="fb-bg-subtext">
                      {isExactMatch ? "Exact" : "Compatible"}
                    </span>
                  </div>

                  <div className="fb-card-facility-info">
                    <h3 className="fb-facility-name">{item.facility || "Blood Bank"}</h3>
                    <div className="fb-facility-badges">
                      <span className="fb-type-tag">
                        {item.facilityType || "Regional Center"}
                      </span>
                      <span
                        className={`fb-match-tag ${
                          isExactMatch
                            ? "exact"
                            : item.stockGroup === "O-"
                            ? "universal"
                            : "compatible"
                        }`}
                      >
                        {item.matchBadge.icon} {item.matchBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Units & Availability Status Box */}
                <div className="fb-card-stock-box">
                  <div className="fb-stock-col">
                    <span className="fb-stock-label">AVAILABLE RESERVE</span>
                    <h3
                      className={`fb-stock-number ${
                        item.units < 3
                          ? "critical"
                          : item.units < 10
                          ? "low"
                          : "sufficient"
                      }`}
                    >
                      {item.units} <span className="fb-unit-word">Units in stock</span>
                    </h3>
                  </div>

                  <span
                    className={`fb-status-pill ${
                      item.units < 3
                        ? "critical"
                        : item.units < 10
                        ? "low"
                        : "available"
                    }`}
                  >
                    {item.indicator || "🟢"} {item.status || "Available"}
                  </span>
                </div>

                {/* Meta details */}
                <div className="fb-meta-list">
                  <div className="fb-meta-item">
                    <span className="fb-distance-badge">
                      📍 {item.distanceKm ? `${item.distanceKm} km away` : "Nearby"}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      • ~{Math.round((item.distanceKm || 3) * 2.5)} mins drive
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#166534",
                      }}
                    >
                      🕒 {item.openHours || "24/7 Supply"}
                    </span>
                  </div>

                  <div className="fb-meta-item">
                    <span>🏠</span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.address || item.location || item.city || "City Center"}
                    </span>
                  </div>

                  {item.phone && (
                    <div className="fb-meta-item">
                      <span>📞</span>
                      <span>{item.phone}</span>
                    </div>
                  )}

                  {item.components && item.components.length > 0 && (
                    <div className="fb-components-row">
                      {item.components.map((c) => (
                        <span key={c} className="fb-comp-chip">
                          + {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4 Action Buttons Required by User Request */}
                <div className="fb-card-actions">
                  {/* Action 1: Request Blood */}
                  <button
                    className="fb-btn-request"
                    onClick={() => handleOpenRequest(item)}
                  >
                    <span>🩸 Request Blood Units</span>
                    <span>
                      ({requiredUnits} {requiredUnits === 1 ? "Unit" : "Units"})
                    </span>
                  </button>

                  {/* Action 2: View Hospital */}
                  <button
                    className="fb-btn-view"
                    onClick={() => setHospitalModal(item)}
                  >
                    👁️ View Hospital
                  </button>

                  {/* Action 3: Contact Hospital */}
                  <button
                    className="fb-btn-contact"
                    onClick={() => setContactModal(item)}
                  >
                    📞 Contact
                  </button>

                  {/* Action 4: Get Directions */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      item.lat && item.lng
                        ? `${item.lat},${item.lng}`
                        : `${item.facility}, ${item.city}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="fb-btn-directions"
                  >
                    🗺️ Get Directions &amp; Navigation
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 7. Request Blood Modal ──────────────────────────────────────────── */}
      {requestModal && (
        <div className="fb-modal-overlay" onClick={() => setRequestModal(null)}>
          <div className="fb-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="fb-modal-header">
              <h3 className="fb-modal-title">
                <span>🩸</span>
                <span>Request Blood Allocation</span>
              </h3>
              <button
                className="fb-modal-close-btn"
                onClick={() => setRequestModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="fb-modal-body">
              {submittedReceipt ? (
                <div className="fb-success-receipt">
                  <span style={{ fontSize: "40px" }}>✅</span>
                  <h3
                    style={{
                      margin: "0",
                      color: "#166534",
                      fontSize: "20px",
                      fontWeight: "800",
                    }}
                  >
                    Blood Allocation Request Submitted!
                  </h3>
                  <p style={{ margin: "0", color: "#475569", fontSize: "14px" }}>
                    The blood bank dispatch team at{" "}
                    <strong>{submittedReceipt.facility}</strong> has been notified.
                  </p>

                  <div className="fb-receipt-meta">
                    <div>
                      <strong>Reference ID:</strong>{" "}
                      <span className="fb-receipt-id">{submittedReceipt.id}</span>
                    </div>
                    <div>
                      <strong>Patient:</strong> {submittedReceipt.patientName}
                    </div>
                    <div>
                      <strong>Blood Group:</strong> {submittedReceipt.bloodGroup} (
                      {submittedReceipt.units} Units)
                    </div>
                    <div>
                      <strong>Facility:</strong> {submittedReceipt.facility} (
                      {submittedReceipt.city})
                    </div>
                    <div>
                      <strong>Attendant Phone:</strong> {submittedReceipt.phone}
                    </div>
                    <div>
                      <strong>Urgency:</strong> {submittedReceipt.urgency}
                    </div>
                    <div>
                      <strong>Submitted At:</strong> {submittedReceipt.timestamp}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                    <button
                      className="fb-btn-request"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setRequestModal(null);
                        navigate("/request-status");
                      }}
                    >
                      Track in Request Status
                    </button>
                    <button
                      className="fb-btn-view"
                      onClick={() => window.print()}
                    >
                      🖨️ Print Slip
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitBloodRequest}
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <div
                    style={{
                      background: "#fef2f2",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <p style={{ margin: "0", fontSize: "13px", color: "#991b1b" }}>
                      Requesting <strong>{requiredUnits} units</strong> of{" "}
                      <strong>{requestModal.stockGroup}</strong> from{" "}
                      <strong>{requestModal.facility}</strong> ({requestModal.city}).
                    </p>
                  </div>

                  <div
                    className="fb-form-grid"
                    style={{ gridTemplateColumns: "1fr 1fr" }}
                  >
                    <div
                      className="fb-input-group"
                      style={{ gridColumn: "span 2" }}
                    >
                      <label className="fb-label">PATIENT FULL NAME *</label>
                      <input
                        type="text"
                        className="fb-input"
                        placeholder="e.g. Ramesh Gupta"
                        value={reqForm.patientName}
                        onChange={(e) =>
                          setReqForm({ ...reqForm, patientName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="fb-input-group">
                      <label className="fb-label">PATIENT AGE</label>
                      <input
                        type="number"
                        className="fb-input"
                        placeholder="e.g. 35"
                        value={reqForm.age}
                        onChange={(e) =>
                          setReqForm({ ...reqForm, age: e.target.value })
                        }
                      />
                    </div>

                    <div className="fb-input-group">
                      <label className="fb-label">GENDER</label>
                      <select
                        className="fb-select"
                        value={reqForm.gender}
                        onChange={(e) =>
                          setReqForm({ ...reqForm, gender: e.target.value })
                        }
                      >
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div
                      className="fb-input-group"
                      style={{ gridColumn: "span 2" }}
                    >
                      <label className="fb-label">ATTENDANT CONTACT NUMBER *</label>
                      <input
                        type="tel"
                        className="fb-input"
                        placeholder="+91 9876543210"
                        value={reqForm.phone}
                        onChange={(e) =>
                          setReqForm({ ...reqForm, phone: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="fb-input-group">
                      <label className="fb-label">HOSPITAL WARD / ROOM</label>
                      <input
                        type="text"
                        className="fb-input"
                        placeholder="e.g. ICU Bed 4 / Ward 3B"
                        value={reqForm.wardNumber}
                        onChange={(e) =>
                          setReqForm({ ...reqForm, wardNumber: e.target.value })
                        }
                      />
                    </div>

                    <div className="fb-input-group">
                      <label className="fb-label">URGENCY PRIORITY</label>
                      <select
                        className="fb-select"
                        value={reqForm.urgency}
                        onChange={(e) =>
                          setReqForm({ ...reqForm, urgency: e.target.value })
                        }
                      >
                        <option>Normal (Routine)</option>
                        <option>Urgent (Within 12h)</option>
                        <option>Emergency (Immediate SOS)</option>
                      </select>
                    </div>

                    <div
                      className="fb-input-group"
                      style={{ gridColumn: "span 2" }}
                    >
                      <label className="fb-label">CLINICAL REASON / DIAGNOSIS</label>
                      <input
                        type="text"
                        className="fb-input"
                        placeholder="e.g. Emergency surgery, trauma blood replacement, thalassemia"
                        value={reqForm.reason}
                        onChange={(e) =>
                          setReqForm({ ...reqForm, reason: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div
                    className="fb-modal-footer"
                    style={{ padding: "16px 0 0 0", background: "none", border: "none" }}
                  >
                    <button
                      type="button"
                      className="fb-btn-view"
                      onClick={() => setRequestModal(null)}
                      disabled={submittingReq}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="fb-btn-request"
                      style={{ flex: 1 }}
                      disabled={submittingReq}
                    >
                      {submittingReq
                        ? "Submitting Request..."
                        : "Confirm & Send Blood Request 🩸"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. View Hospital Modal ──────────────────────────────────────────── */}
      {hospitalModal && (
        <div className="fb-modal-overlay" onClick={() => setHospitalModal(null)}>
          <div
            className="fb-modal-box"
            style={{ maxWidth: "680px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fb-modal-header">
              <h3 className="fb-modal-title">
                <span>🏥</span>
                <span>{hospitalModal.facility} Profile</span>
              </h3>
              <button
                className="fb-modal-close-btn"
                onClick={() => setHospitalModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="fb-modal-body">
              {/* Facility Details Header */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <h4 style={{ margin: "0", fontSize: "18px", color: "#0f172a" }}>
                    {hospitalModal.facility}
                  </h4>
                  <span className="fb-type-tag">
                    {hospitalModal.facilityType || "Healthcare Partner"}
                  </span>
                </div>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#475569" }}>
                  📍 {hospitalModal.address || hospitalModal.location},{" "}
                  {hospitalModal.city}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "13px",
                    color: "#334155",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    📞 <strong>Main Hotline:</strong>{" "}
                    {hospitalModal.phone || "+91 44 2829 1100"}
                  </span>
                  <span>
                    🚨 <strong>Emergency Desk:</strong>{" "}
                    {hospitalModal.emergencyPhone || hospitalModal.phone}
                  </span>
                  <span>
                    🕒 <strong>Hours:</strong>{" "}
                    {hospitalModal.openHours || "Open 24/7"}
                  </span>
                </div>
              </div>

              {/* Complete 8-Group Inventory Matrix for this Hospital */}
              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0f172a",
                    marginBottom: "10px",
                  }}
                >
                  📦 Real-Time Blood Reserves Inventory Table:
                </h4>
                <table className="fb-hosp-table">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Units Available</th>
                      <th>Compatibility with {bloodGroup || "Patient"}</th>
                      <th>Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_BLOOD_GROUPS.map((grp) => {
                      const isCurrent = grp === hospitalModal.stockGroup;
                      const stockUnits = isCurrent
                        ? hospitalModal.units
                        : grp === "O+"
                        ? 28
                        : grp === "A+"
                        ? 20
                        : grp === "B+"
                        ? 18
                        : 6;
                      const isComp = bloodGroup ? isCompatible(grp, bloodGroup) : true;

                      return (
                        <tr
                          key={grp}
                          style={{
                            background: isCurrent ? "#fef2f2" : "transparent",
                          }}
                        >
                          <td>
                            <strong>{grp}</strong>
                            {isCurrent && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  fontSize: "10px",
                                  color: "#dc2626",
                                  fontWeight: "800",
                                }}
                              >
                                (Selected)
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: "800",
                                color:
                                  stockUnits < 3
                                    ? "#dc2626"
                                    : stockUnits < 10
                                    ? "#d97706"
                                    : "#166534",
                              }}
                            >
                              {stockUnits} Units
                            </span>
                          </td>
                          <td>
                            <span
                              className={`fb-compat-pill ${
                                isComp ? "exact" : "universal"
                              }`}
                              style={{ fontSize: "11px", padding: "2px 8px" }}
                            >
                              {isComp ? "Compatible" : "Incompatible"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "12px", fontWeight: "600" }}>
                              {stockUnits < 3
                                ? "🔴 Critical"
                                : stockUnits < 10
                                ? "🟡 Low"
                                : "🟢 Sufficient"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Lab & Storage Facilities */}
              <div
                style={{
                  background: "#f0fdf4",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "1px solid #bbf7d0",
                  fontSize: "13px",
                  color: "#166534",
                }}
              >
                <strong>🏥 Certified Standards:</strong> Verified NABH Blood Bank,
                -80°C Cryopreservation Unit, 24/7 Apheresis &amp; Platelet Agitator,
                Cross-Matching Lab On-Site.
              </div>
            </div>

            <div className="fb-modal-footer">
              <button
                className="fb-btn-contact"
                onClick={() => {
                  setHospitalModal(null);
                  setContactModal(hospitalModal);
                }}
              >
                📞 Contact Facility
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  hospitalModal.lat && hospitalModal.lng
                    ? `${hospitalModal.lat},${hospitalModal.lng}`
                    : `${hospitalModal.facility}, ${hospitalModal.city}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="fb-btn-directions"
                style={{ gridColumn: "auto" }}
              >
                🗺️ Get Directions
              </a>
              <button
                className="fb-btn-request"
                onClick={() => {
                  setHospitalModal(null);
                  handleOpenRequest(hospitalModal);
                }}
              >
                🩸 Request Blood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. Contact Hospital Modal ────────────────────────────────────────── */}
      {contactModal && (
        <div className="fb-modal-overlay" onClick={() => setContactModal(null)}>
          <div
            className="fb-modal-box"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fb-modal-header">
              <h3 className="fb-modal-title">
                <span>📞</span>
                <span>Contact {contactModal.facility}</span>
              </h3>
              <button
                className="fb-modal-close-btn"
                onClick={() => setContactModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="fb-modal-body" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "42px", margin: "10px 0" }}>🏥</div>
              <h3 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>
                {contactModal.facility}
              </h3>
              <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
                {contactModal.address || contactModal.location},{" "}
                {contactModal.city}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a
                  href={`tel:${
                    contactModal.emergencyPhone ||
                    contactModal.phone ||
                    "+914428290200"
                  }`}
                  className="fb-btn-request"
                  style={{ textDecoration: "none", fontSize: "15px", padding: "14px" }}
                >
                  🚨 Call Emergency Desk:{" "}
                  {contactModal.emergencyPhone ||
                    contactModal.phone ||
                    "+91 44 2829 0200"}
                </a>

                <a
                  href={`tel:${contactModal.phone || "+914428291100"}`}
                  className="fb-btn-view"
                  style={{ textDecoration: "none", fontSize: "14px", padding: "12px" }}
                >
                  📞 Blood Bank Reception:{" "}
                  {contactModal.phone || "+91 44 2829 1100"}
                </a>

                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hello, I need urgent ${
                      bloodGroup || "blood"
                    } units for a patient at ${
                      contactModal.facility
                    }. Please confirm availability.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="fb-btn-contact"
                  style={{ textDecoration: "none", fontSize: "14px", padding: "12px" }}
                >
                  💬 WhatsApp Blood Desk Dispatch
                </a>
              </div>
            </div>

            <div className="fb-modal-footer">
              <button
                className="fb-btn-view"
                style={{ width: "100%" }}
                onClick={() => setContactModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. Full 8x8 Blood Compatibility Matrix Modal ────────────────────── */}
      {showMatrixModal && (
        <div className="fb-modal-overlay" onClick={() => setShowMatrixModal(false)}>
          <div
            className="fb-modal-box"
            style={{ maxWidth: "720px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fb-modal-header">
              <h3 className="fb-modal-title">
                <span>📊</span>
                <span>Complete Blood Compatibility Matrix (RBC)</span>
              </h3>
              <button
                className="fb-modal-close-btn"
                onClick={() => setShowMatrixModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="fb-modal-body">
              <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "#64748b" }}>
                This medical matrix shows which donor blood groups (columns) can
                safely be received by each recipient blood group (rows).
              </p>

              <div style={{ overflowX: "auto" }}>
                <table className="fb-matrix-table">
                  <thead>
                    <tr>
                      <th>Recipient \ Donor</th>
                      {ALL_BLOOD_GROUPS.map((d) => (
                        <th key={d}>{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_BLOOD_GROUPS.map((recipient) => {
                      const isHighlighted = recipient === bloodGroup;
                      return (
                        <tr
                          key={recipient}
                          style={{
                            outline: isHighlighted ? "2px solid #ef4444" : "none",
                            background: isHighlighted ? "#fef2f2" : "inherit",
                          }}
                        >
                          <td
                            style={{
                              fontWeight: "900",
                              background: isHighlighted ? "#fee2e2" : "#f1f5f9",
                            }}
                          >
                            {recipient}
                            {isHighlighted && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "9px",
                                  color: "#dc2626",
                                }}
                              >
                                Current
                              </span>
                            )}
                          </td>
                          {ALL_BLOOD_GROUPS.map((donor) => {
                            const compatible = isCompatible(donor, recipient);
                            return (
                              <td
                                key={donor}
                                className={
                                  compatible
                                    ? "fb-matrix-cell-yes"
                                    : "fb-matrix-cell-no"
                                }
                              >
                                {compatible ? "✓ Yes" : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Key Notes */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "12px",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    background: "#fef9c3",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #fde047",
                    color: "#854d0e",
                  }}
                >
                  <strong>⭐ O- Universal Donor:</strong> Can give red blood cells
                  to any recipient of any blood group.
                </div>
                <div
                  style={{
                    background: "#dbeafe",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #bfdbfe",
                    color: "#1e40af",
                  }}
                >
                  <strong>🎯 AB+ Universal Recipient:</strong> Can safely receive
                  red blood cells from all 8 blood groups.
                </div>
              </div>
            </div>

            <div className="fb-modal-footer">
              <button
                className="fb-btn-request"
                onClick={() => setShowMatrixModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindBlood;
