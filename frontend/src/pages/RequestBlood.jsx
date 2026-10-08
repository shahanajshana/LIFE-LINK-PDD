import "./RequestBlood.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function RequestBlood() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    bloodGroup: "",
    hospital: "",
    city: "",
    phone: "",
    urgency: "Normal",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await api.createEmergencyRequest({
      patient: form.name,
      bloodGroup: form.bloodGroup,
      hospital: form.hospital,
      city: form.city,
      phone: form.phone,
      urgency: form.urgency,
    });

    setLoading(false);
    setSubmitted(true);

    setForm({
      name: "",
      bloodGroup: "",
      hospital: "",
      city: "",
      phone: "",
      urgency: "Normal",
    });

    setTimeout(() => {
      setSubmitted(false);
      navigate("/request-status");
    }, 1500);
  };

  return (
    <div className="request-page-wrapper">
      <div className="request-card">
        <div className="request-header">
          <span className="req-icon">🩸</span>
          <h2>Blood Request Portal</h2>
          <p>Submit a formal blood request for hospital patients</p>
        </div>

        {submitted && (
          <div className="alert-success-banner">
            ✅ Request Submitted Successfully! Redirecting to Request Status Tracker...
          </div>
        )}

        <form onSubmit={handleSubmit} className="req-form">
          <div className="input-group">
            <label>PATIENT FULL NAME</label>
            <input
              name="name"
              placeholder="e.g. Ramesh Gupta"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>BLOOD GROUP</label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="">Select Group</option>
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

            <div className="input-group">
              <label>URGENCY LEVEL</label>
              <select
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                required
              >
                <option>Normal</option>
                <option>Urgent</option>
                <option>Emergency</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>HOSPITAL NAME & LOCATION</label>
            <input
              name="hospital"
              placeholder="Hospital Name"
              value={form.hospital}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>CITY</label>
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>PHONE NUMBER</label>
              <input
                name="phone"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="req-submit-btn" disabled={loading}>
            {loading ? "Submitting Request..." : "Submit Blood Request 🩸"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestBlood;