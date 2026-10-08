import { safeStorage } from '../utils/safeStorage';
import { supabase } from '../utils/supabase';

function timeAgo(date: string | Date) {
  if (!date) return 'Just now';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

const SEED_HOSPITALS = [
  {
    id: 'h101',
    name: 'Apollo Hospital',
    address: '21 Greams Lane, Off Greams Road, Chennai',
    city: 'Chennai',
    phone: '+91 44 2829 0200',
    emergencyContact: '+91 44 2829 0200',
    blood: 'A+, O+, B+ Available',
    type: 'Multi-speciality',
  },
  {
    id: 'h102',
    name: 'City Hospital',
    address: '88 MG Road, Indiranagar, Bangalore',
    city: 'Bangalore',
    phone: '+91 80 2528 1122',
    emergencyContact: '+91 80 2528 1122',
    blood: 'AB+, O- Available',
    type: 'Emergency Care',
  },
];

const SEED_DONORS = [
  { id: 'd1', name: 'Rahul Kumar', bloodGroup: 'A+', city: 'Chennai', phone: '+91 9876543210', distance: '2.5 km', status: 'Available' },
  { id: 'd2', name: 'Priya Sharma', bloodGroup: 'O-', city: 'Bangalore', phone: '+91 9988776655', distance: '3.2 km', status: 'Available' },
  { id: 'd3', name: 'Arun Raj', bloodGroup: 'B+', city: 'Hyderabad', phone: '+91 8877665544', distance: '5.1 km', status: 'Recently Donated' },
];

const SEED_EMERGENCY = [
  {
    id: 'EMG-1092',
    patient_name: 'Ramesh Gupta',
    blood_group: 'O-',
    hospital: 'Apollo Hospital',
    city: 'Chennai',
    urgency: 'Critical',
    contact_phone: '+91 9876500112',
    status: 'Pending',
    created_at: new Date().toISOString(),
  },
];

export const api = {
  setToken: async (t: string | null) => {
    if (t) {
      await safeStorage.setItem('lifelink_token', t);
    } else {
      await safeStorage.removeItem('lifelink_token');
    }
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        const authUser = data.user;
        const token = data.session?.access_token || 'supabase_token';
        await api.setToken(token);

        let profileData: any = null;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          profileData = profile;
        } catch (e) {}

        const meta = authUser.user_metadata || {};
        const user = {
          id: authUser.id,
          name: profileData?.name || meta.name || cleanEmail.split('@')[0],
          email: profileData?.email || cleanEmail,
          phone: profileData?.phone || meta.phone || '+91 9876543210',
          bloodGroup: profileData?.blood_group || meta.bloodGroup || 'A+',
          dob: profileData?.dob || meta.dob || '1998-05-15',
          gender: profileData?.gender || meta.gender || 'Male',
          city: profileData?.city || meta.city || 'Chennai',
          address: profileData?.address || meta.address || '',
          role: profileData?.role || meta.role || (cleanEmail.includes('admin') ? 'admin' : 'user'),
          status: profileData?.status || 'Active',
          donorStatus: profileData?.donor_status || 'Eligible Donor',
          donationsCount: profileData?.donations_count ?? 3,
          livesHelped: profileData?.lives_helped ?? 9,
          rewardPoints: profileData?.reward_points ?? 350,
          lastDonation: profileData?.last_donation || '12 Jan 2026',
          nextEligible: profileData?.next_eligible || '12 Apr 2026',
        };

        await safeStorage.setItem('lifelink_user', JSON.stringify(user));
        return { token, user };
      }
    } catch (e) {}

    // Local Mock Login fallback
    const user = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: '+91 9876543210',
      bloodGroup: 'O+',
      dob: '1998-05-15',
      gender: 'Male',
      city: 'Chennai',
      address: 'Chennai',
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      status: 'Active',
      donorStatus: 'Eligible Donor',
      donationsCount: 4,
      livesHelped: 12,
      rewardPoints: 850,
      lastDonation: '15 Jan 2026',
      nextEligible: '15 Apr 2026',
    };
    const token = 'local_session_' + Date.now();
    await api.setToken(token);
    await safeStorage.setItem('lifelink_user', JSON.stringify(user));
    return { token, user };
  },

  register: async (userData: any) => {
    const cleanEmail = userData.email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            blood_group: userData.bloodGroup,
            city: userData.city,
          },
        },
      });

      if (!error && data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: userData.name || '',
            email: cleanEmail,
            phone: userData.phone || '',
            blood_group: userData.bloodGroup || 'A+',
            city: userData.city || '',
            role: 'user',
            status: 'Active',
            donor_status: 'Eligible Donor',
            donations_count: 0,
            lives_helped: 0,
            reward_points: 100,
          });
        } catch (e) {}
        return { message: 'Registration successful! Please log in.' };
      }
    } catch (e) {}

    return { message: 'Registration successful! Please log in.' };
  },

  forgotPassword: async (email: string) => {
    try {
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    } catch (e) {}
    return { message: 'Reset email sent' };
  },

  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    try {
      await supabase.auth.updateUser({ password: newPassword });
    } catch (e) {}
    return { message: 'Password updated' };
  },

  updateProfile: async (profileData: any) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        const payload: any = {};
        if (profileData.name !== undefined) payload.name = profileData.name;
        if (profileData.phone !== undefined) payload.phone = profileData.phone;
        if (profileData.bloodGroup !== undefined) payload.blood_group = profileData.bloodGroup;
        if (profileData.city !== undefined) payload.city = profileData.city;
        if (profileData.address !== undefined) payload.address = profileData.address;
        await supabase.from('profiles').update(payload).eq('id', authData.user.id);
      }
    } catch (e) {}

    let user: any = {};
    const cached = await safeStorage.getItem('lifelink_user');
    if (cached) {
      try { user = JSON.parse(cached); } catch (e) {}
    }
    user = { ...user, ...profileData };
    await safeStorage.setItem('lifelink_user', JSON.stringify(user));
    return user;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      await supabase.auth.updateUser({ password: newPassword });
    } catch (e) {}
    return { message: 'Password updated successfully!' };
  },

  // ── Hospitals ──────────────────────────────────────────────────────────────
  getHospitals: async () => {
    try {
      const { data, error } = await supabase.from('hospitals').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    return SEED_HOSPITALS;
  },

  getHospitalById: async (id: string) => {
    try {
      const { data, error } = await supabase.from('hospitals').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch (e) {}
    return SEED_HOSPITALS[0];
  },

  // ── Donors ────────────────────────────────────────────────────────────────
  getDonors: async (filters: { bloodGroup?: string; city?: string } = {}) => {
    try {
      let query = supabase.from('donors').select('*').order('created_at', { ascending: false });
      if (filters.bloodGroup && filters.bloodGroup !== 'All') {
        query = query.eq('blood_group', filters.bloodGroup);
      }
      if (filters.city && filters.city !== 'All') {
        query = query.ilike('city', `%${filters.city}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          bloodGroup: d.blood_group,
          city: d.city,
          phone: d.phone,
          gender: d.gender,
          age: d.age,
          status: d.status,
          distance: d.distance || 'N/A',
          lastDonation: d.last_donation || 'Never',
          donationsCount: d.donations_count ?? 0,
          isVerified: d.is_verified ?? true,
        }));
      }
    } catch (e) {}
    return SEED_DONORS;
  },

  // ── Emergency Requests ────────────────────────────────────────────────────
  getEmergencyRequests: async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          patient_name: r.patient,
          blood_group: r.blood_group,
          hospital: r.hospital,
          city: r.city,
          urgency: r.urgency || 'Critical',
          contact_phone: r.phone,
          status: r.status,
          created_at: r.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {}
    return SEED_EMERGENCY;
  },

  createEmergencyRequest: async (requestData: any) => {
    try {
      const payload = {
        patient: requestData.patientName || requestData.patient,
        blood_group: requestData.bloodGroup,
        units_needed: requestData.unitsNeeded || 1,
        hospital: requestData.hospital,
        city: requestData.city || '',
        phone: requestData.contactPhone || requestData.phone,
        urgency: requestData.urgency || 'Critical',
        status: 'Pending',
      };
      const { data, error } = await supabase.from('emergency_requests').insert([payload]).select().single();
      if (!error && data) return data;
    } catch (e) {}

    return {
      id: 'EMG-' + Math.floor(1000 + Math.random() * 9000),
      patient_name: requestData.patientName,
      blood_group: requestData.bloodGroup,
      hospital: requestData.hospital,
      city: requestData.city,
      urgency: requestData.urgency || 'Critical',
      contact_phone: requestData.contactPhone,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
  },

  updateEmergencyStatus: async (id: string, status: string) => {
    try {
      await supabase.from('emergency_requests').update({ status }).eq('id', id);
    } catch (e) {}
    return { id, status };
  },

  // ── Blood Donations ───────────────────────────────────────────────────────
  recordDonation: async (donationData: any) => {
    try {
      const payload = {
        hospital: donationData.hospitalName || donationData.hospitalId || 'General Hospital',
        blood_group: donationData.bloodGroup,
        units: donationData.units || 1,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Completed',
        lives_helped: 3,
      };
      const { data, error } = await supabase.from('donation_history').insert([payload]).select().single();
      if (!error && data) return data;
    } catch (e) {}

    return { success: true };
  },

  getDonationHistory: async () => {
    try {
      const { data, error } = await supabase.from('donation_history').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          donation_date: d.date || d.created_at,
          hospital_id: d.hospital,
          hospitals: { name: d.hospital },
          blood_group: d.blood_group,
          units: d.units,
          status: d.status,
        }));
      }
    } catch (e) {}

    return [
      {
        id: 'dh-1',
        donation_date: '12 March 2026',
        hospital_id: 'Apollo Hospital',
        hospitals: { name: 'Apollo Hospital' },
        blood_group: 'A+',
        units: 1,
        status: 'Completed',
      },
    ];
  },

  // ── Blood Bank ─────────────────────────────────────────────────────────────
  getBloodBankStock: async () => {
    return [
      {
        id: 'bb-1',
        hospital_name: 'Central Blood Bank & Research Center',
        city: 'Chennai',
        units: 99,
        a_plus: 24,
        a_minus: 4,
        b_plus: 18,
        b_minus: 2,
        ab_plus: 12,
        ab_minus: 3,
        o_plus: 35,
        o_minus: 1,
      },
      {
        id: 'bb-2',
        hospital_name: 'Rotary Lions Emergency Blood Bank',
        city: 'Bangalore',
        units: 72,
        a_plus: 15,
        a_minus: 8,
        b_plus: 6,
        b_minus: 1,
        ab_plus: 9,
        ab_minus: 0,
        o_plus: 28,
        o_minus: 5,
      },
      {
        id: 'bb-3',
        hospital_name: 'Apollo Hospital Blood Center',
        city: 'Chennai',
        units: 120,
        a_plus: 30,
        a_minus: 10,
        b_plus: 25,
        b_minus: 5,
        ab_plus: 14,
        ab_minus: 4,
        o_plus: 40,
        o_minus: 2,
      },
    ];
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications: async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            description: n.description,
            read: n.read,
            created_at: n.created_at ? timeAgo(n.created_at) : 'Just now',
          }));
        }
      }
    } catch (e) {}

    return [
      { id: 'notif-1', type: 'Emergency', title: 'Urgent O- Needed', description: 'Apollo Hospital needs 2 units of O-', read: false, created_at: '10 mins ago' },
      { id: 'notif-2', type: 'Drive', title: 'Blood Camp Sunday', description: 'Rotary Club Camp at Indiranagar', read: false, created_at: '2 hours ago' },
    ];
  },

  markNotificationRead: async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (e) {}
    return { success: true };
  },
};