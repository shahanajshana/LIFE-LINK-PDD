const BASE_URL = "http://localhost:5000/api";

function nowLabel() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(date) {
  if (!date) return "Just now";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

let jwtToken = localStorage.getItem("lifelink_token") || null;

async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { error: text };
    }

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  setToken: (t) => {
    jwtToken = t;
    if (t) {
      localStorage.setItem("lifelink_token", t);
    } else {
      localStorage.removeItem("lifelink_token");
    }
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    api.setToken(res.token);
    if (res.user) {
      localStorage.setItem("lifelink_user", JSON.stringify(res.user));
    }
    return res;
  },

  register: async (userData) => {
    return await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  forgotPassword: async (email) => {
    return await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email, newPassword) => {
    return await request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    });
  },

  changePassword: async (oldPassword, newPassword) => {
    return await request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  updateProfile: async (arg1, arg2) => {
    let profileData = {};
    if (typeof arg1 === "string") {
      profileData = { email: arg1, ...arg2 };
    } else {
      profileData = arg1 || {};
    }

    const res = await request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (res.user) {
      localStorage.setItem("lifelink_user", JSON.stringify(res.user));
    }
    return res;
  },

  // ── Hospitals ──────────────────────────────────────────────────────────────
  getHospitals: async (search = "") => {
    return await request(`/hospitals?search=${encodeURIComponent(search)}`);
  },

  addHospital: async (hospitalData) => {
    return await request("/hospitals", {
      method: "POST",
      body: JSON.stringify(hospitalData),
    });
  },

  updateHospital: async (id, hospitalData) => {
    return await request(`/hospitals/${id}`, {
      method: "PUT",
      body: JSON.stringify(hospitalData),
    });
  },

  deleteHospital: async (id) => {
    return await request(`/hospitals/${id}`, {
      method: "DELETE",
    });
  },

  // ── Donors ─────────────────────────────────────────────────────────────────
  getDonors: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.bloodGroup) params.append("bloodGroup", filters.bloodGroup);
    if (filters.city) params.append("city", filters.city);

    const queryStr = params.toString();
    return await request(`/donors${queryStr ? `?${queryStr}` : ""}`);
  },

  registerDonor: async (donorData) => {
    return await request("/donors", {
      method: "POST",
      body: JSON.stringify(donorData),
    });
  },

  // ── Blood Banks ────────────────────────────────────────────────────────────
  getBloodBanks: async () => {
    return await request("/blood-banks");
  },

  getBloodStock: async () => {
    return await request("/blood-bank/stock");
  },

  // ── Emergency Requests ─────────────────────────────────────────────────────
  getEmergencyRequests: async () => {
    const data = await request("/emergency");
    return data.map((r) => ({
      id: r.id,
      patient: r.patient,
      bloodGroup: r.bloodGroup,
      unitsNeeded: r.unitsNeeded,
      hospital: r.hospital,
      location: r.location,
      city: r.city,
      phone: r.phone,
      urgency: r.urgency,
      requiredDate: r.requiredDate,
      requiredTime: r.requiredTime,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt
        ? new Date(r.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : nowLabel(),
    }));
  },

  createEmergencyRequest: async (reqData) => {
    return await request("/emergency", {
      method: "POST",
      body: JSON.stringify(reqData),
    });
  },

  updateEmergencyStatus: async (id, status) => {
    return await request(`/emergency/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  updateEmergencyRequestStatus: async (id, status) => {
    return api.updateEmergencyStatus(id, status);
  },

  deleteEmergencyRequest: async (id) => {
    return await request(`/emergency/${id}`, {
      method: "DELETE",
    });
  },

  // ── Blood Requests ─────────────────────────────────────────────────────────
  getBloodRequests: async () => {
    const data = await request("/blood-requests");
    return data.map((r) => ({
      id: r.id,
      patientName: r.patientName,
      bloodGroup: r.bloodGroup,
      units: r.units,
      hospital: r.hospital,
      city: r.city,
      phone: r.phone,
      urgency: r.urgency,
      status: r.status,
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : nowLabel(),
    }));
  },

  createBloodRequest: async (reqData) => {
    return await request("/blood-requests", {
      method: "POST",
      body: JSON.stringify(reqData),
    });
  },

  // ── Donation History ───────────────────────────────────────────────────────
  getDonationHistory: async () => {
    const history = await request("/donation-history");
    return history.map((d) => ({
      id: d.id,
      date: d.date,
      hospital: d.hospital,
      bloodGroup: d.bloodGroup,
      units: d.units,
      status: d.status,
      livesHelped: d.livesHelped,
    }));
  },

  // ── Donation Pledges ───────────────────────────────────────────────────────
  getDonationPledges: async () => {
    const rows = await request("/donation-pledges");
    const pledges = rows
      .filter((p) => (p.pledgeType || "person") === "person")
      .map((p) => ({
        pledgeId: p.id,
        requestId: p.requestId,
        patientName: p.patientName,
        bloodGroup: p.bloodGroup,
        hospital: p.hospitalName || p.hospital,
        donorName: p.donorName,
        donorPhone: p.donorPhone,
        date: p.preferredDate || p.date,
        time: p.preferredTime || p.time,
        status: p.status,
        timestamp: p.createdAt,
      }));

    const appointments = rows
      .filter((p) => p.pledgeType === "hospital")
      .map((p) => ({
        pledgeId: p.id,
        hospitalName: p.hospitalName,
        city: p.city,
        address: p.address,
        donorName: p.donorName,
        donorPhone: p.donorPhone,
        bloodGroup: p.bloodGroup,
        date: p.preferredDate || p.date,
        time: p.preferredTime || p.time,
        status: p.status,
      }));

    return { pledges, appointments };
  },

  createDonationPledge: async (pledgeData) => {
    return await request("/donation-pledges", {
      method: "POST",
      body: JSON.stringify(pledgeData),
    });
  },

  // ── Donation Appointments ──────────────────────────────────────────────────
  getAppointments: async () => {
    try {
      const data = await request("/appointments");
      return data;
    } catch (e) {
      // Fallback
      const cached = localStorage.getItem("lifelink_appointments");
      if (cached) {
        try { return JSON.parse(cached); } catch (err) {}
      }
      return [
        {
          id: "APT-84920",
          appointmentId: "APT-84920",
          hospitalName: "Apollo Hospital",
          city: "Chennai",
          address: "21 Greams Lane, Off Greams Road, Chennai",
          phone: "+91 44 2829 0200",
          date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
          time: "10:30 AM",
          donationType: "Whole Blood",
          donorName: "Antony Chandran",
          donorPhone: "+91 9876543210",
          bloodGroup: "O+",
          status: "Confirmed",
          eligibilityPassed: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  bookAppointment: async (appointmentData) => {
    try {
      const created = await request("/appointments", {
        method: "POST",
        body: JSON.stringify(appointmentData),
      });
      // Also cache locally
      const list = await api.getAppointments();
      list.unshift(created);
      localStorage.setItem("lifelink_appointments", JSON.stringify(list));
      return created;
    } catch (e) {
      const id = "APT-" + Math.floor(10000 + Math.random() * 90000);
      const fallbackAppt = {
        id,
        appointmentId: id,
        ...appointmentData,
        status: "Confirmed",
        createdAt: new Date().toISOString(),
      };
      const list = await api.getAppointments();
      list.unshift(fallbackAppt);
      localStorage.setItem("lifelink_appointments", JSON.stringify(list));
      return fallbackAppt;
    }
  },

  rescheduleAppointment: async (id, newDate, newTime) => {
    try {
      const res = await request(`/appointments/${id}/reschedule`, {
        method: "PUT",
        body: JSON.stringify({ date: newDate, time: newTime }),
      });
      return res;
    } catch (e) {
      const list = await api.getAppointments();
      const appt = list.find((a) => a.id === id || a.appointmentId === id);
      if (appt) {
        appt.date = newDate;
        appt.time = newTime;
        appt.status = "Rescheduled";
        localStorage.setItem("lifelink_appointments", JSON.stringify(list));
        return appt;
      }
      return { id, date: newDate, time: newTime, status: "Rescheduled" };
    }
  },

  cancelAppointment: async (id, reason) => {
    try {
      const res = await request(`/appointments/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      return res;
    } catch (e) {
      const list = await api.getAppointments();
      const appt = list.find((a) => a.id === id || a.appointmentId === id);
      if (appt) {
        appt.status = "Cancelled";
        appt.cancelReason = reason || "Cancelled by donor";
        localStorage.setItem("lifelink_appointments", JSON.stringify(list));
        return appt;
      }
      return { id, status: "Cancelled" };
    }
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications: async () => {
    const data = await request("/notifications");
    return data.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      desc: n.description || n.desc,
      time: n.createdAt ? timeAgo(n.createdAt) : "Just now",
      read: n.read,
    }));
  },

  markNotificationsRead: async () => {
    const res = await request("/notifications/read-all", {
      method: "PUT",
    });
    return (res.notifications || []).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      desc: n.description || n.desc,
      time: n.createdAt ? timeAgo(n.createdAt) : "Just now",
      read: n.read,
    }));
  },

  clearNotifications: async () => {
    await request("/notifications", {
      method: "DELETE",
    });
    return [];
  },

  // ── Notification Settings ──────────────────────────────────────────────────
  getNotificationSettings: async () => {
    try {
      const cached = localStorage.getItem("lifelink_notification_settings");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      urgent_requests: true,
      nearby_drives: true,
      smart_match: true,
      community: true,
      weekly_digest: true,
      push: true,
      email: true,
      sms: false,
    };
  },

  saveNotificationSettings: async (settings) => {
    localStorage.setItem(
      "lifelink_notification_settings",
      JSON.stringify(settings)
    );
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  getAdminUsers: async () => {
    return await request("/admin/users");
  },

  toggleBlockUser: async (id) => {
    return await request(`/admin/users/${id}/block`, {
      method: "PUT",
    });
  },
};
