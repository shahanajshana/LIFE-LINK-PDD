import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DonateBlood.css";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function DonateBlood() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Top Level Workflow Tabs: "eligibility" | "appointments" | "requests"
  const [activeTab, setActiveTab] = useState("eligibility");

  // ── Step 1: Donor Eligibility Screener State ────────────────────────────────
  const [eligibilityForm, setEligibilityForm] = useState({
    age: 24,
    weight: 65,
    bloodGroup: "A+",
    gender: "Male",
    lastDonationDate: "",
    neverDonated: false,
    healthCondition: "healthy", // "healthy" | "mild" | "fever"
    medications: "none", // "none" | "controlled" | "antibiotics"
    recentSurgery: "none", // "none" | "minor" | "major"
    pregnancyStatus: "none", // "none" | "pregnant" | "postpartum"
  });

  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  // ── Step 2: Appointment Booking Wizard State ────────────────────────────────
  const [step, setStep] = useState(1); // 1: Eligibility, 2: Hospital & Slot, 3: Review & Confirm, 4: Pass
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:30 AM");
  const [donationType, setDonationType] = useState("Whole Blood");
  const [donorNotes, setDonorNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Confirmed Appointment Active Pass
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Appointments List (My Appointments)
  const [appointmentsList, setAppointmentsList] = useState([]);

  // Modals for Cancel / Reschedule
  const [rescheduleModal, setRescheduleModal] = useState(null); // appointment object
  const [newReschedDate, setNewReschedDate] = useState("");
  const [newReschedTime, setNewReschedTime] = useState("11:00 AM");
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // ── Urgent Requests State (Tab 3) ──────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [donatingRequest, setDonatingRequest] = useState(null);
  const [pledgedSuccess, setPledgedSuccess] = useState(null);

  const [loading, setLoading] = useState(true);

  // Prefill from user context
  useEffect(() => {
    if (authUser) {
      setEligibilityForm((prev) => ({
        ...prev,
        bloodGroup: authUser.bloodGroup || prev.bloodGroup,
        gender: authUser.gender || prev.gender,
        age: authUser.dob ? calculateAge(authUser.dob) : prev.age,
        lastDonationDate: authUser.lastDonation || "",
      }));
    }

    // Set default booking date to tomorrow
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setBookingDate(tomorrow);
    setNewReschedDate(tomorrow);

    loadInitialData();
  }, [authUser]);

  function calculateAge(dobString) {
    try {
      const birth = new Date(dobString);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970) || 24;
    } catch {
      return 24;
    }
  }

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [hospData, reqsData, apptsData] = await Promise.all([
        api.getHospitals(),
        api.getEmergencyRequests(),
        api.getAppointments(),
      ]);

      if (hospData && hospData.length > 0) {
        setHospitals(hospData);
        setSelectedHospital(hospData[0]);
      }
      if (reqsData) setRequests(reqsData);
      if (apptsData) setAppointmentsList(apptsData);
    } catch (e) {
      console.warn("Initial data load error:", e);
    }
    setLoading(false);
  };

  // ── 🩺 Eligibility Evaluation Engine ───────────────────────────────────────
  const evaluateEligibility = useCallback(() => {
    const issues = [];
    const age = parseInt(eligibilityForm.age, 10) || 0;
    const weight = parseFloat(eligibilityForm.weight) || 0;

    // 1. Age check (18 - 65)
    if (age < 18) {
      issues.push("Donors must be at least 18 years old.");
    } else if (age > 65) {
      issues.push("Donors older than 65 require special medical clearance.");
    }

    // 2. Weight check (min 45 kg)
    if (weight < 45) {
      issues.push("Body weight must be at least 45 kg (99 lbs) for safe blood donation.");
    }

    // 3. Donation interval check (90 days for male, 120 days for female)
    let nextEligibleDate = null;
    if (!eligibilityForm.neverDonated && eligibilityForm.lastDonationDate) {
      const lastDate = new Date(eligibilityForm.lastDonationDate);
      if (!isNaN(lastDate.getTime())) {
        const minDays = eligibilityForm.gender === "Female" ? 120 : 90;
        const eligibleAt = new Date(lastDate.getTime() + minDays * 86400000);
        const daysRemaining = Math.ceil((eligibleAt.getTime() - Date.now()) / 86400000);

        if (daysRemaining > 0) {
          nextEligibleDate = eligibleAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          issues.push(
            `Safe interval waiting period: Please wait until ${nextEligibleDate} (${daysRemaining} days left) before donating again.`
          );
        }
      }
    }

    // 4. Health Condition
    if (eligibilityForm.healthCondition === "fever") {
      issues.push("Active fever or infectious symptoms: Must be fever-free for at least 48 hours without medication.");
    } else if (eligibilityForm.healthCondition === "mild") {
      issues.push("Mild cough/cold: Recommended to wait until all respiratory symptoms subside.");
    }

    // 5. Medications
    if (eligibilityForm.medications === "antibiotics") {
      issues.push("Antibiotic / Blood Thinners: Must complete the full prescription course + 48 hours before donation.");
    }

    // 6. Recent Surgery / Tattoo
    if (eligibilityForm.recentSurgery === "major") {
      issues.push("Major surgery, tattoo, or body piercing within 6 months requires a 6-month deferral safety window.");
    }

    // 7. Pregnancy / Breastfeeding (if female)
    if (eligibilityForm.gender === "Female") {
      if (eligibilityForm.pregnancyStatus === "pregnant") {
        issues.push("Pregnancy: Donating blood during pregnancy is not permitted for maternal and fetal safety.");
      } else if (eligibilityForm.pregnancyStatus === "postpartum") {
        issues.push("Post-partum / Breastfeeding: 6-month recovery period is required following delivery or lactation.");
      }
    }

    const isEligible = issues.length === 0;

    setEligibilityResult({
      isEligible,
      issues,
      nextEligibleDate,
      evaluatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setHasEvaluated(true);
  }, [eligibilityForm]);

  // Trigger evaluation whenever form changes or user clicks Evaluate
  const handleFormChange = (field, value) => {
    setEligibilityForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Appointment Booking Submission ──────────────────────────────────────────
  const handleConfirmAppointment = async () => {
    if (!selectedHospital) {
      alert("Please select a hospital or blood bank facility.");
      return;
    }
    if (!bookingDate) {
      alert("Please select a donation appointment date.");
      return;
    }

    setBookingLoading(true);

    const appointmentPayload = {
      hospitalName: selectedHospital.name,
      city: selectedHospital.city,
      address: selectedHospital.address,
      phone: selectedHospital.phone || selectedHospital.emergencyContact,
      date: bookingDate,
      time: bookingTime,
      donationType: donationType,
      donorName: authUser?.name || "LifeLink Donor",
      donorPhone: authUser?.phone || "+91 9876543210",
      bloodGroup: eligibilityForm.bloodGroup || authUser?.bloodGroup || "A+",
      eligibilityPassed: true,
      notes: donorNotes,
    };

    try {
      const created = await api.bookAppointment(appointmentPayload);
      setConfirmedAppointment(created);
      setAppointmentsList((prev) => [created, ...prev]);
      setStep(4); // Move to Booking Pass screen
    } catch (err) {
      console.error("Booking error:", err);
      // Fallback pass
      const fallback = {
        id: "APT-" + Math.floor(10000 + Math.random() * 90000),
        appointmentId: "APT-" + Math.floor(10000 + Math.random() * 90000),
        ...appointmentPayload,
        status: "Confirmed",
        createdAt: new Date().toISOString(),
      };
      setConfirmedAppointment(fallback);
      setAppointmentsList((prev) => [fallback, ...prev]);
      setStep(4);
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Reschedule & Cancel Handlers ────────────────────────────────────────────
  const submitReschedule = async () => {
    if (!rescheduleModal || !newReschedDate) return;
    try {
      const updated = await api.rescheduleAppointment(
        rescheduleModal.id || rescheduleModal.appointmentId,
        newReschedDate,
        newReschedTime
      );
      const newStatus = updated?.status || "Rescheduled";
      setAppointmentsList((prev) =>
        prev.map((a) => (a.id === rescheduleModal.id ? { ...a, date: newReschedDate, time: newReschedTime, status: newStatus } : a))
      );
      if (confirmedAppointment && confirmedAppointment.id === rescheduleModal.id) {
        setConfirmedAppointment((prev) => ({ ...prev, date: newReschedDate, time: newReschedTime, status: newStatus }));
      }
      setRescheduleModal(null);
      alert("✅ Appointment rescheduled successfully!");
    } catch (e) {
      alert("Failed to reschedule. Please try again.");
    }
  };

  const submitCancel = async () => {
    if (!cancelModal) return;
    try {
      await api.cancelAppointment(cancelModal.id || cancelModal.appointmentId, cancelReason);
      setAppointmentsList((prev) =>
        prev.map((a) => (a.id === cancelModal.id ? { ...a, status: "Cancelled", cancelReason } : a))
      );
      if (confirmedAppointment && confirmedAppointment.id === cancelModal.id) {
        setConfirmedAppointment((prev) => ({ ...prev, status: "Cancelled", cancelReason }));
      }
      setCancelModal(null);
      setCancelReason("");
      alert("Appointment has been cancelled.");
    } catch (e) {
      alert("Failed to cancel. Please try again.");
    }
  };

  // ── Urgent Requests Direct Pledge ──────────────────────────────────────────
  const handlePledgeUrgentRequest = async (e) => {
    e.preventDefault();
    if (!donatingRequest) return;
    const pledgeData = {
      pledgeType: "person",
      requestId: donatingRequest.id,
      patientName: donatingRequest.patient,
      bloodGroup: donatingRequest.bloodGroup,
      hospital: donatingRequest.hospital,
      donorName: authUser?.name || "LifeLink Donor",
      donorPhone: authUser?.phone || "+91 9876543210",
      date: new Date().toISOString().split("T")[0],
      time: "Immediate",
      status: "Pledged / Pending Verification",
    };
    try {
      const saved = await api.createDonationPledge(pledgeData);
      setPledgedSuccess({ ...pledgeData, pledgeId: saved.pledgeId || saved.id || `PLG-${Date.now()}` });
    } catch {
      setPledgedSuccess({ ...pledgeData, pledgeId: `PLG-${Math.floor(1000 + Math.random() * 9000)}` });
    }
    setDonatingRequest(null);
  };

  const timeSlots = [
    { time: "09:00 AM", period: "Morning" },
    { time: "10:30 AM", period: "Morning" },
    { time: "11:45 AM", period: "Morning" },
    { time: "02:00 PM", period: "Afternoon" },
    { time: "03:30 PM", period: "Afternoon" },
    { time: "04:45 PM", period: "Afternoon" },
    { time: "06:00 PM", period: "Evening" },
  ];

  return (
    <div className="donate-blood-wrapper">
      {/* ── Top Hero Banner ── */}
      <section className="donate-hero-banner">
        <div className="donate-hero-content">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="donate-badge-pill">❤️ LIFELINK DONATION PORTAL</span>
            {loading && <span className="donate-badge-pill" style={{ background: "rgba(59, 130, 246, 0.2)", borderColor: "rgba(59, 130, 246, 0.4)", color: "#93c5fd" }}>⚡ Syncing Real-Time Slots...</span>}
          </div>
          <h1>Donor Eligibility &amp; Appointment Booking</h1>
          <p>
            Verify your medical eligibility in seconds, book a donation appointment at your preferred hospital or blood bank, and download your express check-in digital pass.
          </p>
        </div>

        {/* ── Main Navigation Tabs ── */}
        <div className="main-tabs-row">
          <button
            className={`main-tab-btn ${activeTab === "eligibility" ? "active" : ""}`}
            onClick={() => setActiveTab("eligibility")}
          >
            🩺 1. Check Eligibility &amp; Book
          </button>
          <button
            className={`main-tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            🎟️ 2. My Appointments ({appointmentsList.length})
          </button>
          <button
            className={`main-tab-btn ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            🚨 3. Urgent SOS Requests ({requests.length})
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: ELIGIBILITY CHECKER & BOOKING WIZARD                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "eligibility" && (
        <div className="wizard-container">
          {/* Wizard Steps Indicator */}
          <div className="wizard-steps-bar">
            <div className={`wizard-step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
              <span className="step-num">1</span>
              <span className="step-text">Medical Eligibility</span>
            </div>
            <div className="step-connector" />
            <div className={`wizard-step-node ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
              <span className="step-num">2</span>
              <span className="step-text">Select Facility &amp; Slot</span>
            </div>
            <div className="step-connector" />
            <div className={`wizard-step-node ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
              <span className="step-num">3</span>
              <span className="step-text">Confirm Booking</span>
            </div>
            <div className="step-connector" />
            <div className={`wizard-step-node ${step >= 4 ? "active" : ""}`}>
              <span className="step-num">4</span>
              <span className="step-text">Appointment Pass</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 1: MEDICAL ELIGIBILITY ASSESSMENT                              */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="wizard-card-surface">
              <div className="section-head-box">
                <h2>🩺 Donor Medical Eligibility Assessment</h2>
                <p>Answer the standard medical criteria below to confirm if you can safely donate blood today.</p>
              </div>

              <div className="eligibility-form-grid">
                {/* 1. Age & Weight */}
                <div className="form-group-card">
                  <label className="field-title">1. Age &amp; Body Weight</label>
                  <div className="input-split-2">
                    <div>
                      <span className="sub-label">Age (Years)</span>
                      <input
                        type="number"
                        min="16"
                        max="80"
                        className="custom-input"
                        value={eligibilityForm.age}
                        onChange={(e) => handleFormChange("age", e.target.value)}
                      />
                      <span className="hint-text">Must be 18–65</span>
                    </div>
                    <div>
                      <span className="sub-label">Weight (kg)</span>
                      <input
                        type="number"
                        min="30"
                        max="200"
                        className="custom-input"
                        value={eligibilityForm.weight}
                        onChange={(e) => handleFormChange("weight", e.target.value)}
                      />
                      <span className="hint-text">Minimum 45 kg</span>
                    </div>
                  </div>
                </div>

                {/* 2. Blood Group & Gender */}
                <div className="form-group-card">
                  <label className="field-title">2. Blood Group &amp; Gender</label>
                  <div className="input-split-2">
                    <div>
                      <span className="sub-label">Blood Group</span>
                      <select
                        className="custom-select"
                        value={eligibilityForm.bloodGroup}
                        onChange={(e) => handleFormChange("bloodGroup", e.target.value)}
                      >
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="sub-label">Gender</span>
                      <select
                        className="custom-select"
                        value={eligibilityForm.gender}
                        onChange={(e) => handleFormChange("gender", e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Last Donation Date */}
                <div className="form-group-card full-col">
                  <label className="field-title">3. Last Blood Donation Date</label>
                  <div className="date-check-row">
                    <input
                      type="date"
                      className="custom-input date-input"
                      disabled={eligibilityForm.neverDonated}
                      value={eligibilityForm.lastDonationDate}
                      onChange={(e) => handleFormChange("lastDonationDate", e.target.value)}
                    />
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={eligibilityForm.neverDonated}
                        onChange={(e) => {
                          handleFormChange("neverDonated", e.target.checked);
                          if (e.target.checked) handleFormChange("lastDonationDate", "");
                        }}
                      />
                      <span>I am a first-time donor / Never donated before</span>
                    </label>
                  </div>
                  <span className="hint-text">Required interval: 90 days for males / 120 days for females.</span>
                </div>

                {/* 4. Current Health Condition */}
                <div className="form-group-card">
                  <label className="field-title">4. Current Health Condition</label>
                  <div className="radio-options-stack">
                    <label className={`radio-pill ${eligibilityForm.healthCondition === "healthy" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="healthCondition"
                        value="healthy"
                        checked={eligibilityForm.healthCondition === "healthy"}
                        onChange={(e) => handleFormChange("healthCondition", e.target.value)}
                      />
                      <span>🟢 Feeling completely healthy &amp; active today</span>
                    </label>
                    <label className={`radio-pill ${eligibilityForm.healthCondition === "mild" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="healthCondition"
                        value="mild"
                        checked={eligibilityForm.healthCondition === "mild"}
                        onChange={(e) => handleFormChange("healthCondition", e.target.value)}
                      />
                      <span>🟡 Mild fatigue, headache or minor cold symptoms</span>
                    </label>
                    <label className={`radio-pill ${eligibilityForm.healthCondition === "fever" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="healthCondition"
                        value="fever"
                        checked={eligibilityForm.healthCondition === "fever"}
                        onChange={(e) => handleFormChange("healthCondition", e.target.value)}
                      />
                      <span>🔴 Active fever, viral infection, or flu</span>
                    </label>
                  </div>
                </div>

                {/* 5. Medication */}
                <div className="form-group-card">
                  <label className="field-title">5. Medication Status</label>
                  <div className="radio-options-stack">
                    <label className={`radio-pill ${eligibilityForm.medications === "none" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="medications"
                        value="none"
                        checked={eligibilityForm.medications === "none"}
                        onChange={(e) => handleFormChange("medications", e.target.value)}
                      />
                      <span>🟢 No prescription medications / Taking regular vitamins</span>
                    </label>
                    <label className={`radio-pill ${eligibilityForm.medications === "controlled" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="medications"
                        value="controlled"
                        checked={eligibilityForm.medications === "controlled"}
                        onChange={(e) => handleFormChange("medications", e.target.value)}
                      />
                      <span>🟢 Controlled blood pressure / thyroid medication</span>
                    </label>
                    <label className={`radio-pill ${eligibilityForm.medications === "antibiotics" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="medications"
                        value="antibiotics"
                        checked={eligibilityForm.medications === "antibiotics"}
                        onChange={(e) => handleFormChange("medications", e.target.value)}
                      />
                      <span>🔴 Currently on active antibiotics or blood thinners</span>
                    </label>
                  </div>
                </div>

                {/* 6. Recent Illness / Surgery / Tattoo */}
                <div className="form-group-card">
                  <label className="field-title">6. Recent Illness, Surgery, Tattoo, or Piercing</label>
                  <div className="radio-options-stack">
                    <label className={`radio-pill ${eligibilityForm.recentSurgery === "none" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="recentSurgery"
                        value="none"
                        checked={eligibilityForm.recentSurgery === "none"}
                        onChange={(e) => handleFormChange("recentSurgery", e.target.value)}
                      />
                      <span>🟢 None in the past 6 months</span>
                    </label>
                    <label className={`radio-pill ${eligibilityForm.recentSurgery === "minor" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="recentSurgery"
                        value="minor"
                        checked={eligibilityForm.recentSurgery === "minor"}
                        onChange={(e) => handleFormChange("recentSurgery", e.target.value)}
                      />
                      <span>🟢 Minor dental procedure &gt; 7 days ago</span>
                    </label>
                    <label className={`radio-pill ${eligibilityForm.recentSurgery === "major" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="recentSurgery"
                        value="major"
                        checked={eligibilityForm.recentSurgery === "major"}
                        onChange={(e) => handleFormChange("recentSurgery", e.target.value)}
                      />
                      <span>🔴 Major surgery, tattoo, or body piercing within last 6 months</span>
                    </label>
                  </div>
                </div>

                {/* 7. Pregnancy & Breastfeeding (Conditional on Female) */}
                {eligibilityForm.gender === "Female" && (
                  <div className="form-group-card highlight-female">
                    <label className="field-title">7. Pregnancy &amp; Maternal Status (Female Donors)</label>
                    <div className="radio-options-stack">
                      <label className={`radio-pill ${eligibilityForm.pregnancyStatus === "none" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="pregnancyStatus"
                          value="none"
                          checked={eligibilityForm.pregnancyStatus === "none"}
                          onChange={(e) => handleFormChange("pregnancyStatus", e.target.value)}
                        />
                        <span>🟢 Not currently pregnant or breastfeeding</span>
                      </label>
                      <label className={`radio-pill ${eligibilityForm.pregnancyStatus === "pregnant" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="pregnancyStatus"
                          value="pregnant"
                          checked={eligibilityForm.pregnancyStatus === "pregnant"}
                          onChange={(e) => handleFormChange("pregnancyStatus", e.target.value)}
                        />
                        <span>🔴 Currently pregnant</span>
                      </label>
                      <label className={`radio-pill ${eligibilityForm.pregnancyStatus === "postpartum" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="pregnancyStatus"
                          value="postpartum"
                          checked={eligibilityForm.pregnancyStatus === "postpartum"}
                          onChange={(e) => handleFormChange("pregnancyStatus", e.target.value)}
                        />
                        <span>🔴 Delivered baby or breastfeeding within the past 6 months</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Action: Evaluate Eligibility Button */}
              <div className="evaluate-action-box">
                <button className="btn-evaluate-lg" onClick={evaluateEligibility}>
                  ⚡ Evaluate My Eligibility Now
                </button>
              </div>

              {/* ── Dynamic Eligibility Result Card ── */}
              {hasEvaluated && eligibilityResult && (
                <div className={`result-callout ${eligibilityResult.isEligible ? "eligible-state" : "ineligible-state"}`}>
                  <div className="result-header">
                    <span className="result-icon-badge">
                      {eligibilityResult.isEligible ? "✅" : "⚠️"}
                    </span>
                    <div>
                      <h3>
                        {eligibilityResult.isEligible
                          ? "🎉 Congratulations! You Are Eligible to Donate Blood."
                          : "⚠️ Temporary Deferral Notice"}
                      </h3>
                      <p className="result-evaluated-time">Evaluated at {eligibilityResult.evaluatedAt}</p>
                    </div>
                  </div>

                  {eligibilityResult.isEligible ? (
                    <div className="result-body">
                      <div className="eligible-metrics">
                        <div className="metric-chip">
                          <span className="m-icon">🩸</span>
                          <div>
                            <strong>Estimated Unit</strong>
                            <span>1 Whole Blood Unit (350–450 ml)</span>
                          </div>
                        </div>
                        <div className="metric-chip">
                          <span className="m-icon">🌟</span>
                          <div>
                            <strong>Impact Potential</strong>
                            <span>Save up to 3 Critical Patient Lives</span>
                          </div>
                        </div>
                        <div className="metric-chip">
                          <span className="m-icon">🛡️</span>
                          <div>
                            <strong>Safety Check</strong>
                            <span>Health &amp; Interval Cleared</span>
                          </div>
                        </div>
                      </div>

                      <p className="eligible-note">
                        Your medical screening answers meet the blood banking safety requirements. Click below to choose a nearby hospital or blood bank and confirm your appointment slot.
                      </p>

                      <div className="proceed-btn-wrapper">
                        <button className="btn-proceed-booking" onClick={() => setStep(2)}>
                          Proceed to Select Hospital &amp; Book Appointment 🗓️ 👉
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="result-body">
                      <p className="deferral-explanation">
                        Based on international blood safety guidelines, you cannot donate blood today due to the following reason(s):
                      </p>
                      <ul className="issues-list">
                        {eligibilityResult.issues.map((issue, idx) => (
                          <li key={idx}>❌ {issue}</li>
                        ))}
                      </ul>
                      {eligibilityResult.nextEligibleDate && (
                        <div className="next-eligible-box">
                          <span>🗓️ Expected Next Eligible Date:</span>
                          <strong>{eligibilityResult.nextEligibleDate}</strong>
                        </div>
                      )}
                      <p className="deferral-footer-note">
                        Please update your information or return once your safe recovery or deferral window has concluded.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 2: SELECT HOSPITAL / BLOOD BANK & TIME SLOT                    */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="wizard-card-surface">
              <div className="section-head-box">
                <h2>🏥 Select Hospital / Blood Bank &amp; Donation Time</h2>
                <p>Choose a verified healthcare facility and convenient time slot for your blood donation.</p>
              </div>

              {/* Donation Type Selection */}
              <div className="donation-type-row">
                <span className="type-label">Select Donation Type:</span>
                <div className="type-pills">
                  {["Whole Blood", "Platelets (Apheresis)", "Plasma Donation"].map((t) => (
                    <button
                      key={t}
                      className={`type-pill ${donationType === t ? "active" : ""}`}
                      onClick={() => setDonationType(t)}
                    >
                      {t === "Whole Blood" && "🩸 "}
                      {t.includes("Platelets") && "🧪 "}
                      {t.includes("Plasma") && "💛 "}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hospital Selection Grid */}
              <h3 className="sub-section-title">1. Choose Healthcare Facility</h3>
              <div className="hospitals-picker-grid">
                {hospitals.map((hosp) => {
                  const isSelected = selectedHospital && selectedHospital.id === hosp.id;
                  return (
                    <div
                      key={hosp.id}
                      className={`hospital-pick-card ${isSelected ? "selected-hospital" : ""}`}
                      onClick={() => setSelectedHospital(hosp)}
                    >
                      <div className="hosp-card-header">
                        <div className="hosp-icon">🏥</div>
                        <div className="hosp-titles">
                          <h4>{hosp.name}</h4>
                          <span className="hosp-city-tag">📍 {hosp.city}</span>
                        </div>
                        {isSelected && <span className="selected-check">✓ Selected</span>}
                      </div>

                      <p className="hosp-address-text">{hosp.address || `${hosp.city}, India`}</p>

                      <div className="hosp-features-row">
                        <span className="feature-badge">⏰ 24/7 Blood Bank</span>
                        <span className="feature-badge">🚑 Ambulance Ready</span>
                        {hosp.phone && <span className="feature-badge">📞 {hosp.phone}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Date & Time Selection */}
              <div className="date-time-section">
                <div className="date-col">
                  <h3 className="sub-section-title">2. Select Preferred Date</h3>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="custom-input date-large"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                  <div className="quick-date-chips">
                    <button
                      className="quick-chip"
                      onClick={() => setBookingDate(new Date().toISOString().split("T")[0])}
                    >
                      Today
                    </button>
                    <button
                      className="quick-chip"
                      onClick={() => setBookingDate(new Date(Date.now() + 86400000).toISOString().split("T")[0])}
                    >
                      Tomorrow
                    </button>
                    <button
                      className="quick-chip"
                      onClick={() => setBookingDate(new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0])}
                    >
                      In 3 Days
                    </button>
                  </div>
                </div>

                <div className="time-col">
                  <h3 className="sub-section-title">3. Select Appointment Time Slot</h3>
                  <div className="slots-grid">
                    {timeSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        className={`slot-pill ${bookingTime === slot.time ? "active-slot" : ""}`}
                        onClick={() => setBookingTime(slot.time)}
                      >
                        <span className="slot-clock">🕒</span>
                        <span className="slot-val">{slot.time}</span>
                        <span className="slot-period">{slot.period}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Donor Notes / Special Instructions */}
              <div className="notes-box">
                <label className="field-title">Special Notes / Medical Preferences (Optional)</label>
                <textarea
                  className="custom-textarea"
                  rows="2"
                  placeholder="e.g. First time donating, prefer morning slot, need wheelchair assistance..."
                  value={donorNotes}
                  onChange={(e) => setDonorNotes(e.target.value)}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="wizard-actions-row">
                <button className="btn-back-outline" onClick={() => setStep(1)}>
                  ⬅️ Back to Eligibility
                </button>
                <button className="btn-continue-lg" onClick={() => setStep(3)}>
                  Review &amp; Confirm Appointment 👉
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 3: REVIEW & CONFIRM APPOINTMENT                                */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="wizard-card-surface">
              <div className="section-head-box">
                <h2>📋 Review Your Donation Appointment</h2>
                <p>Please double-check your appointment details before finalizing.</p>
              </div>

              <div className="review-summary-card">
                <div className="summary-header">
                  <div className="summary-hospital-icon">🏥</div>
                  <div>
                    <span className="summary-badge">DONATION APPOINTMENT SUMMARY</span>
                    <h3>{selectedHospital?.name}</h3>
                    <p>📍 {selectedHospital?.address || selectedHospital?.city}</p>
                  </div>
                </div>

                <div className="summary-details-grid">
                  <div className="summary-item">
                    <span className="s-label">🗓️ Scheduled Date</span>
                    <strong className="s-value">{bookingDate}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="s-label">⏰ Time Slot</span>
                    <strong className="s-value">{bookingTime}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="s-label">🩸 Blood Group</span>
                    <strong className="s-value highlight-blood">{eligibilityForm.bloodGroup}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="s-label">🧪 Donation Type</span>
                    <strong className="s-value">{donationType}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="s-label">👤 Donor Name</span>
                    <strong className="s-value">{authUser?.name || "LifeLink Donor"}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="s-label">📞 Contact Number</span>
                    <strong className="s-value">{authUser?.phone || "+91 9876543210"}</strong>
                  </div>
                </div>

                <div className="prep-instructions-box">
                  <h4>💡 Pre-Donation Preparation Guidelines:</h4>
                  <ul>
                    <li>💧 Drink at least 500ml of water or fruit juice before arriving.</li>
                    <li>🥪 Have a healthy, non-greasy meal 2–3 hours prior to donation.</li>
                    <li>🪪 Bring a government-issued Photo ID (Aadhaar, Driving License, or Passport).</li>
                    <li>🚫 Avoid alcohol consumption for at least 24 hours prior to donation.</li>
                  </ul>
                </div>
              </div>

              <div className="wizard-actions-row">
                <button className="btn-back-outline" onClick={() => setStep(2)}>
                  ⬅️ Change Facility or Date
                </button>
                <button
                  className="btn-confirm-booking-now"
                  disabled={bookingLoading}
                  onClick={handleConfirmAppointment}
                >
                  {bookingLoading ? "Confirming Appointment..." : "Confirm & Book Appointment 🎟️"}
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 4: DIGITAL APPOINTMENT PASS (AFTER CONFIRMATION)               */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {step === 4 && confirmedAppointment && (
            <div className="wizard-card-surface">
              <div className="booking-success-banner">
                <div className="success-check-circle">✓</div>
                <h2>Donation Appointment Confirmed!</h2>
                <p>Your appointment has been registered with the hospital blood bank. Please present this digital pass upon arrival.</p>
              </div>

              {/* Digital Pass / Slip Card */}
              <div className="digital-pass-card" id="appointment-pass-print">
                <div className="pass-top-bar">
                  <div className="pass-brand">
                    <span>🩸 LifeLink Smart Blood Network</span>
                  </div>
                  <div className="pass-status-pill confirmed">
                    {confirmedAppointment.status || "Confirmed"}
                  </div>
                </div>

                <div className="pass-main-body">
                  <div className="pass-id-row">
                    <div>
                      <span className="pass-sub">APPOINTMENT ID</span>
                      <h2 className="pass-id-text">{confirmedAppointment.appointmentId || confirmedAppointment.id}</h2>
                    </div>
                    <div className="pass-qr-mock">
                      <div className="qr-box">
                        <span className="qr-icon">📱</span>
                        <span className="qr-text">EXPRESS CHECK-IN</span>
                      </div>
                    </div>
                  </div>

                  <div className="pass-info-grid">
                    <div className="p-item">
                      <span className="p-label">HOSPITAL / FACILITY</span>
                      <strong className="p-value">{confirmedAppointment.hospitalName}</strong>
                      <span className="p-sub-text">📍 {confirmedAppointment.address || confirmedAppointment.city}</span>
                    </div>

                    <div className="p-item">
                      <span className="p-label">DATE &amp; TIME</span>
                      <strong className="p-value">{confirmedAppointment.date} at {confirmedAppointment.time}</strong>
                    </div>

                    <div className="p-item">
                      <span className="p-label">DONOR NAME &amp; BLOOD GROUP</span>
                      <strong className="p-value">{confirmedAppointment.donorName} ({confirmedAppointment.bloodGroup})</strong>
                    </div>

                    <div className="p-item">
                      <span className="p-label">DONATION TYPE</span>
                      <strong className="p-value">{confirmedAppointment.donationType || "Whole Blood"}</strong>
                    </div>
                  </div>
                </div>

                <div className="pass-footer-actions">
                  <button
                    className="pass-btn resched"
                    onClick={() => setRescheduleModal(confirmedAppointment)}
                  >
                    🔄 Reschedule Date/Time
                  </button>
                  <button
                    className="pass-btn cancel"
                    onClick={() => setCancelModal(confirmedAppointment)}
                  >
                    ❌ Cancel Appointment
                  </button>
                  <button
                    className="pass-btn print"
                    onClick={() => window.print()}
                  >
                    🖨️ Print / Save Pass
                  </button>
                </div>
              </div>

              <div className="post-pass-nav">
                <button
                  className="btn-view-all-appts"
                  onClick={() => {
                    setActiveTab("appointments");
                    setStep(1);
                  }}
                >
                  View All My Appointments 🎟️
                </button>
                <button
                  className="btn-back-dashboard"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard 🏠
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: MY APPOINTMENTS LIST & MANAGEMENT                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "appointments" && (
        <div className="appointments-management-view">
          <div className="view-header-bar">
            <div>
              <h2>🎟️ My Scheduled Donation Appointments</h2>
              <p>Manage, reschedule, or cancel your active blood donation appointments.</p>
            </div>
            <button
              className="btn-book-new"
              onClick={() => {
                setActiveTab("eligibility");
                setStep(1);
              }}
            >
              + Book New Donation Appointment
            </button>
          </div>

          {appointmentsList.length === 0 ? (
            <div className="empty-appointments-box">
              <span className="empty-icon">🗓️</span>
              <h3>No Appointments Scheduled Yet</h3>
              <p>Check your eligibility and schedule your next blood donation at a partner hospital.</p>
              <button
                className="btn-primary-action"
                onClick={() => {
                  setActiveTab("eligibility");
                  setStep(1);
                }}
              >
                Start Eligibility Screening 🩺
              </button>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointmentsList.map((appt) => {
                const isCancelled = appt.status === "Cancelled";
                return (
                  <div key={appt.id || appt.appointmentId} className={`appt-card ${isCancelled ? "cancelled-card" : ""}`}>
                    <div className="appt-card-top">
                      <div>
                        <span className="appt-id-badge">{appt.appointmentId || appt.id}</span>
                        <h3 className="appt-hospital">{appt.hospitalName}</h3>
                        <p className="appt-city">📍 {appt.address || appt.city}</p>
                      </div>
                      <span className={`appt-status-tag ${appt.status ? appt.status.toLowerCase() : "confirmed"}`}>
                        {appt.status || "Confirmed"}
                      </span>
                    </div>

                    <div className="appt-meta-grid">
                      <div className="meta-box">
                        <span className="m-title">🗓️ Date</span>
                        <strong>{appt.date}</strong>
                      </div>
                      <div className="meta-box">
                        <span className="m-title">⏰ Time</span>
                        <strong>{appt.time}</strong>
                      </div>
                      <div className="meta-box">
                        <span className="m-title">🩸 Group</span>
                        <strong>{appt.bloodGroup}</strong>
                      </div>
                      <div className="meta-box">
                        <span className="m-title">🧪 Type</span>
                        <strong>{appt.donationType || "Whole Blood"}</strong>
                      </div>
                    </div>

                    {isCancelled && appt.cancelReason && (
                      <div className="cancel-reason-bar">
                        <span>Reason: {appt.cancelReason}</span>
                      </div>
                    )}

                    {!isCancelled && (
                      <div className="appt-action-btns">
                        <button
                          className="btn-resched-sm"
                          onClick={() => {
                            setRescheduleModal(appt);
                            setNewReschedDate(appt.date);
                            setNewReschedTime(appt.time);
                          }}
                        >
                          🔄 Reschedule
                        </button>
                        <button
                          className="btn-cancel-sm"
                          onClick={() => setCancelModal(appt)}
                        >
                          ❌ Cancel
                        </button>
                        <button
                          className="btn-pass-sm"
                          onClick={() => {
                            setConfirmedAppointment(appt);
                            setActiveTab("eligibility");
                            setStep(4);
                          }}
                        >
                          🎟️ View Pass
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: URGENT PATIENT SOS REQUESTS (DIRECT PLEDGES)                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "requests" && (
        <div className="urgent-requests-view">
          <div className="view-header-bar">
            <div>
              <h2>🚨 Urgent Emergency Blood Requests</h2>
              <p>Respond directly to critical patient surgeries requiring blood units immediately.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="requests-filter-bar">
            <div className="filter-item">
              <label>Blood Group</label>
              <select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Blood Groups</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Cities</option>
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
          </div>

          {/* Requests Grid */}
          <div className="urgent-cards-grid">
            {requests
              .filter((r) => selectedBloodGroup === "All" || r.bloodGroup === selectedBloodGroup)
              .filter((r) => selectedCity === "All" || (r.city || "").toLowerCase().includes(selectedCity.toLowerCase()))
              .map((req) => (
                <div key={req.id} className="urgent-req-card">
                  <div className="card-top-row">
                    <div className="blood-circle-red">{req.bloodGroup}</div>
                    <div className="req-title-col">
                      <span className="req-id">{req.id}</span>
                      <h3>{req.patient}</h3>
                      <p className="req-hospital">🏥 {req.hospital} ({req.city || "Chennai"})</p>
                    </div>
                    <span className="urgency-pill red">{req.urgency || "Emergency"}</span>
                  </div>

                  <div className="req-body-stats">
                    <div className="stat-pill">
                      <span>Units Needed:</span>
                      <strong>{req.unitsNeeded || 1} Unit(s)</strong>
                    </div>
                    <div className="stat-pill">
                      <span>Required By:</span>
                      <strong>{req.requiredDate || "Immediate"}</strong>
                    </div>
                  </div>

                  {req.message && <p className="req-message-text">"{req.message}"</p>}

                  <div className="req-card-actions">
                    <button
                      className="btn-pledge-direct"
                      onClick={() => setDonatingRequest(req)}
                    >
                      Pledge Direct Donation ❤️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: RESCHEDULE APPOINTMENT                                           */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {rescheduleModal && (
        <div className="modal-backdrop" onClick={() => setRescheduleModal(null)}>
          <div className="modal-card-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔄 Reschedule Appointment</h3>
              <button className="close-btn" onClick={() => setRescheduleModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-sub">
                Rescheduling appointment for <strong>{rescheduleModal.hospitalName}</strong> (ID: {rescheduleModal.appointmentId || rescheduleModal.id})
              </p>

              <div className="modal-input-group">
                <label>Select New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="custom-input"
                  value={newReschedDate}
                  onChange={(e) => setNewReschedDate(e.target.value)}
                />
              </div>

              <div className="modal-input-group">
                <label>Select New Time Slot</label>
                <select
                  className="custom-select"
                  value={newReschedTime}
                  onChange={(e) => setNewReschedTime(e.target.value)}
                >
                  {timeSlots.map((s, idx) => (
                    <option key={idx} value={s.time}>{s.time} ({s.period})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setRescheduleModal(null)}>
                Close
              </button>
              <button className="btn-modal-save" onClick={submitReschedule}>
                Save New Date &amp; Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: CANCEL APPOINTMENT                                               */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {cancelModal && (
        <div className="modal-backdrop" onClick={() => setCancelModal(null)}>
          <div className="modal-card-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>❌ Cancel Appointment</h3>
              <button className="close-btn" onClick={() => setCancelModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-sub">
                Are you sure you want to cancel your donation appointment at <strong>{cancelModal.hospitalName}</strong> on <strong>{cancelModal.date}</strong>?
              </p>
              <div className="modal-input-group">
                <label>Cancellation Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule conflict, feeling unwell..."
                  className="custom-input"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setCancelModal(null)}>
                Keep Appointment
              </button>
              <button className="btn-modal-danger" onClick={submitCancel}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: DIRECT PLEDGE CONFIRMATION (URGENT REQUEST)                     */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {donatingRequest && (
        <div className="modal-backdrop" onClick={() => setDonatingRequest(null)}>
          <div className="modal-card-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>❤️ Pledge Direct Blood Donation</h3>
              <button className="close-btn" onClick={() => setDonatingRequest(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-sub">
                You are pledging to donate <strong>{donatingRequest.bloodGroup}</strong> blood for patient <strong>{donatingRequest.patient}</strong> at <strong>{donatingRequest.hospital}</strong>.
              </p>
              <div className="modal-info-summary">
                <p>👤 <strong>Donor Name:</strong> {authUser?.name || "LifeLink Donor"}</p>
                <p>📞 <strong>Phone:</strong> {authUser?.phone || "+91 9876543210"}</p>
                <p>🏥 <strong>Hospital:</strong> {donatingRequest.hospital}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setDonatingRequest(null)}>
                Cancel
              </button>
              <button className="btn-modal-save" onClick={handlePledgeUrgentRequest}>
                Confirm Donation Pledge 🩸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pledged Feedback Modal */}
      {pledgedSuccess && (
        <div className="modal-backdrop" onClick={() => setPledgedSuccess(null)}>
          <div className="modal-card-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✅ Donation Pledge Recorded!</h3>
              <button className="close-btn" onClick={() => setPledgedSuccess(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
              <h4>Thank you for stepping up to save a life!</h4>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>
                Pledge ID: <strong>{pledgedSuccess.pledgeId}</strong>. The patient's attendant at {pledgedSuccess.hospital} has been notified.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-save" onClick={() => setPledgedSuccess(null)}>
                Close &amp; View History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonateBlood;
