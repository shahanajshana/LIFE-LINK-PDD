const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "lifelink_super_secure_secret_key_2026";

app.use(cors());
app.use(express.json());

// ── Supabase Client Initialization ──────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

let isSupabaseOffline =
  !supabaseUrl ||
  supabaseUrl.includes("placeholder") ||
  supabaseUrl.includes("vrqtyzmuvibqcomznjbh");

console.log("🔗 Connecting LifeLink Backend to Supabase PostgreSQL...");

// ── Fallback In-Memory Seed Data ────────────────────────────────────────────
let memoryUsers = [
  {
    id: "usr-shahanaj-1",
    name: "Shahanaj Begum",
    email: "shahanaj1925@gmail.com",
    password: "Password@123",
    phone: "+91 9876543210",
    bloodGroup: "A+",
    dob: "1998-05-15",
    gender: "Female",
    city: "Chennai",
    address: "T. Nagar, Chennai",
    role: "user",
    status: "Active",
    donorStatus: "Eligible Donor",
    donationsCount: 4,
    livesHelped: 12,
    rewardPoints: 850,
    lastDonation: "12 Feb 2026",
    nextEligible: "12 May 2026",
  },
  {
    id: "usr-admin-1",
    name: "Antony Chandran",
    email: "admin@lifelink.com",
    password: "Admin@123",
    phone: "+91 9876543210",
    bloodGroup: "O+",
    dob: "1995-04-12",
    gender: "Male",
    city: "Chennai",
    address: "Anna Nagar, Chennai",
    role: "admin",
    status: "Active",
    donorStatus: "Eligible Donor",
    donationsCount: 12,
    livesHelped: 36,
    rewardPoints: 3600,
    lastDonation: "15 Jan 2026",
    nextEligible: "15 Apr 2026",
  },
];

let memoryHospitals = [
  {
    id: "h100",
    name: "Saveetha Medical College and Hospital",
    address: "Saveetha Nagar, NH 48, Bangalore Highway, Thandalam",
    city: "Chennai",
    phone: "+91 44 6672 6672",
    email: "emergency@saveetha.com",
    emergencyContact: "+91 44 6672 6672",
    blood: "All Blood Groups 24/7 Available",
    availableGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    ambulance: "Available (24/7 ICU Ambulance)",
    type: "Medical College & Super Speciality",
    lat: 13.0274,
    lng: 79.9885,
    status: "Active",
  },
  {
    id: "h101",
    name: "Apollo Hospital",
    address: "21 Greams Lane, Off Greams Road",
    city: "Chennai",
    phone: "+91 44 2829 0200",
    email: "emergency@apollo.com",
    emergencyContact: "+91 44 2829 0200",
    blood: "A+, O+, B+ Available",
    availableGroups: ["A+", "O+", "B+", "AB+"],
    ambulance: "Available",
    type: "Multi-speciality",
    lat: 13.0604,
    lng: 80.2496,
    status: "Active",
  },
  {
    id: "h102",
    name: "City Hospital",
    address: "88 MG Road, Indiranagar",
    city: "Bangalore",
    phone: "+91 80 2528 1122",
    email: "help@cityhospital.org",
    emergencyContact: "+91 80 2528 1122",
    blood: "AB+, O- Available",
    availableGroups: ["AB+", "O-", "A-", "B-"],
    ambulance: "Available",
    type: "Emergency Care",
    lat: 12.9716,
    lng: 77.5946,
    status: "Active",
  },
  {
    id: "h103",
    name: "Red Cross Blood Center",
    address: "4-1-825 Bank Street, Koti",
    city: "Hyderabad",
    phone: "+91 40 2475 3311",
    email: "info@redcrosshyd.org",
    emergencyContact: "+91 40 2475 3311",
    blood: "Emergency Blood Support",
    availableGroups: ["A+", "B+", "O+", "O-"],
    ambulance: "Not Available",
    type: "Blood Center",
    lat: 17.385,
    lng: 78.4867,
    status: "Active",
  },
];

let memoryDonors = [
  {
    id: "d101",
    name: "Rahul Kumar",
    bloodGroup: "A+",
    city: "Chennai",
    phone: "+91 9876543210",
    gender: "Male",
    age: 24,
    status: "Available",
    distance: "2.5 km",
    lastDonation: "12 March 2026",
    donationsCount: 8,
    isVerified: true,
  },
  {
    id: "d102",
    name: "Priya Sharma",
    bloodGroup: "O-",
    city: "Bangalore",
    phone: "+91 9988776655",
    gender: "Female",
    age: 22,
    status: "Available",
    distance: "3.2 km",
    lastDonation: "20 February 2026",
    donationsCount: 12,
    isVerified: true,
  },
  {
    id: "d103",
    name: "Arun Raj",
    bloodGroup: "B+",
    city: "Hyderabad",
    phone: "+91 8877665544",
    gender: "Male",
    age: 25,
    status: "Recently Donated",
    distance: "5.1 km",
    lastDonation: "05 May 2026",
    donationsCount: 5,
    isVerified: false,
  },
];

let memoryBloodBanks = [
  {
    id: "bb-1",
    name: "Central Blood Bank & Research Center",
    location: "Greams Road",
    city: "Chennai",
    address: "21 Greams Lane, Off Greams Road, Thousand Lights, Chennai",
    contact: "+91 44 2829 1100",
    emergencyPhone: "+91 44 2829 0200",
    email: "emergency@centralbloodbank.org",
    openHours: "Open 24/7",
    lat: 13.0604,
    lng: 80.2496,
    type: "Regional Blood Bank",
    isGovtCertified: true,
  },
  {
    id: "bb-2",
    name: "Rotary Lions Emergency Blood Bank",
    location: "Indiranagar",
    city: "Bangalore",
    address: "88 100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore",
    contact: "+91 80 2525 9900",
    emergencyPhone: "+91 80 2528 1122",
    email: "help@rotarybloodbank.org",
    openHours: "Open 24/7",
    lat: 12.9716,
    lng: 77.5946,
    type: "Charitable Blood Bank",
    isGovtCertified: true,
  },
  {
    id: "bb-3",
    name: "Red Cross Society Blood Center",
    location: "Koti",
    city: "Hyderabad",
    address: "4-1-825 Bank Street, Koti, Hyderabad",
    contact: "+91 40 2475 3311",
    emergencyPhone: "+91 40 2475 3399",
    email: "info@redcrosshyd.org",
    openHours: "Open 24/7",
    lat: 17.385,
    lng: 78.4867,
    type: "Red Cross Center",
    isGovtCertified: true,
  },
  {
    id: "bb-4",
    name: "Apollo Hospitals Blood Reserve Center",
    location: "Greams Road",
    city: "Chennai",
    address: "21 Greams Lane, Thousand Lights, Chennai",
    contact: "+91 44 2829 3333",
    emergencyPhone: "+91 44 2829 0200",
    email: "bloodbank@apollohospitals.com",
    openHours: "Open 24/7",
    lat: 13.058,
    lng: 80.251,
    type: "Hospital Blood Bank",
    isGovtCertified: true,
  },
  {
    id: "bb-5",
    name: "Fortis Escorts Blood Transfusion Center",
    location: "Okhla",
    city: "Delhi",
    address: "Okhla Road, Sukhdev Vihar, New Delhi",
    contact: "+91 11 4713 5000",
    emergencyPhone: "+91 11 4713 5555",
    email: "bloodbank@fortisescorts.com",
    openHours: "Open 24/7",
    lat: 28.5603,
    lng: 77.2798,
    type: "Super Speciality Blood Center",
    isGovtCertified: true,
  },
  {
    id: "bb-6",
    name: "KEM Hospital Blood Bank",
    location: "Parel",
    city: "Mumbai",
    address: "Acharya Donde Marg, Parel, Mumbai",
    contact: "+91 22 2410 7000",
    emergencyPhone: "+91 22 2413 6051",
    email: "bloodbank@kem.edu",
    openHours: "Open 24/7",
    lat: 19.0028,
    lng: 72.8423,
    type: "Government Medical College Blood Bank",
    isGovtCertified: true,
  }
];

let memoryBloodStock = [
  // Central Blood Bank (Chennai)
  { id: "bs-1", bankId: "bb-1", bloodGroup: "A+", units: 24, status: "Available", indicator: "🟢", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-2", bankId: "bb-1", bloodGroup: "A-", units: 4, status: "Low", indicator: "🟡", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-3", bankId: "bb-1", bloodGroup: "B+", units: 18, status: "Available", indicator: "🟢", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-4", bankId: "bb-1", bloodGroup: "B-", units: 5, status: "Low", indicator: "🟡", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-5", bankId: "bb-1", bloodGroup: "O+", units: 35, status: "Available", indicator: "🟢", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "PRBC", "Platelets", "FFP", "Cryo"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-6", bankId: "bb-1", bloodGroup: "O-", units: 2, status: "Critical", indicator: "🔴", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-7", bankId: "bb-1", bloodGroup: "AB+", units: 12, status: "Available", indicator: "🟢", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "Plasma", "Platelets"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-8", bankId: "bb-1", bloodGroup: "AB-", units: 3, status: "Low", indicator: "🟡", facility: "Central Blood Bank", facilityType: "Regional Blood Bank", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Thousand Lights, Chennai", phone: "+91 44 2829 1100", emergencyPhone: "+91 44 2829 0200", lat: 13.0604, lng: 80.2496, components: ["Whole Blood", "Plasma"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },

  // Apollo Hospitals Blood Reserve Center (Chennai)
  { id: "bs-9", bankId: "bb-4", bloodGroup: "B+", units: 22, status: "Available", indicator: "🟢", facility: "Apollo Hospital Blood Center", facilityType: "Super Speciality Hospital", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Off Greams Road, Chennai", phone: "+91 44 2829 3333", emergencyPhone: "+91 44 2829 0200", lat: 13.058, lng: 80.251, components: ["Whole Blood", "PRBC", "Platelets", "FFP", "Cryo"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-10", bankId: "bb-4", bloodGroup: "B-", units: 6, status: "Available", indicator: "🟢", facility: "Apollo Hospital Blood Center", facilityType: "Super Speciality Hospital", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Off Greams Road, Chennai", phone: "+91 44 2829 3333", emergencyPhone: "+91 44 2829 0200", lat: 13.058, lng: 80.251, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-11", bankId: "bb-4", bloodGroup: "O+", units: 40, status: "Available", indicator: "🟢", facility: "Apollo Hospital Blood Center", facilityType: "Super Speciality Hospital", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Off Greams Road, Chennai", phone: "+91 44 2829 3333", emergencyPhone: "+91 44 2829 0200", lat: 13.058, lng: 80.251, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-12", bankId: "bb-4", bloodGroup: "O-", units: 5, status: "Low", indicator: "🟡", facility: "Apollo Hospital Blood Center", facilityType: "Super Speciality Hospital", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Off Greams Road, Chennai", phone: "+91 44 2829 3333", emergencyPhone: "+91 44 2829 0200", lat: 13.058, lng: 80.251, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-13", bankId: "bb-4", bloodGroup: "A+", units: 30, status: "Available", indicator: "🟢", facility: "Apollo Hospital Blood Center", facilityType: "Super Speciality Hospital", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Off Greams Road, Chennai", phone: "+91 44 2829 3333", emergencyPhone: "+91 44 2829 0200", lat: 13.058, lng: 80.251, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-14", bankId: "bb-4", bloodGroup: "AB+", units: 14, status: "Available", indicator: "🟢", facility: "Apollo Hospital Blood Center", facilityType: "Super Speciality Hospital", city: "Chennai", location: "Greams Road, Chennai", address: "21 Greams Lane, Off Greams Road, Chennai", phone: "+91 44 2829 3333", emergencyPhone: "+91 44 2829 0200", lat: 13.058, lng: 80.251, components: ["Whole Blood", "Plasma"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },

  // Rotary Lions Emergency Blood Bank (Bangalore)
  { id: "bs-15", bankId: "bb-2", bloodGroup: "A+", units: 16, status: "Available", indicator: "🟢", facility: "Rotary Lions Blood Bank", facilityType: "Charitable Blood Bank", city: "Bangalore", location: "Indiranagar, Bangalore", address: "88 100 Feet Road, Indiranagar, Bangalore", phone: "+91 80 2525 9900", emergencyPhone: "+91 80 2528 1122", lat: 12.9716, lng: 77.5946, components: ["Whole Blood", "PRBC", "Platelets"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-16", bankId: "bb-2", bloodGroup: "B+", units: 20, status: "Available", indicator: "🟢", facility: "Rotary Lions Blood Bank", facilityType: "Charitable Blood Bank", city: "Bangalore", location: "Indiranagar, Bangalore", address: "88 100 Feet Road, Indiranagar, Bangalore", phone: "+91 80 2525 9900", emergencyPhone: "+91 80 2528 1122", lat: 12.9716, lng: 77.5946, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-17", bankId: "bb-2", bloodGroup: "B-", units: 4, status: "Low", indicator: "🟡", facility: "Rotary Lions Blood Bank", facilityType: "Charitable Blood Bank", city: "Bangalore", location: "Indiranagar, Bangalore", address: "88 100 Feet Road, Indiranagar, Bangalore", phone: "+91 80 2525 9900", emergencyPhone: "+91 80 2528 1122", lat: 12.9716, lng: 77.5946, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-18", bankId: "bb-2", bloodGroup: "O+", units: 28, status: "Available", indicator: "🟢", facility: "Rotary Lions Blood Bank", facilityType: "Charitable Blood Bank", city: "Bangalore", location: "Indiranagar, Bangalore", address: "88 100 Feet Road, Indiranagar, Bangalore", phone: "+91 80 2525 9900", emergencyPhone: "+91 80 2528 1122", lat: 12.9716, lng: 77.5946, components: ["Whole Blood", "PRBC", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-19", bankId: "bb-2", bloodGroup: "O-", units: 3, status: "Low", indicator: "🟡", facility: "Rotary Lions Blood Bank", facilityType: "Charitable Blood Bank", city: "Bangalore", location: "Indiranagar, Bangalore", address: "88 100 Feet Road, Indiranagar, Bangalore", phone: "+91 80 2525 9900", emergencyPhone: "+91 80 2528 1122", lat: 12.9716, lng: 77.5946, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-20", bankId: "bb-2", bloodGroup: "AB+", units: 9, status: "Available", indicator: "🟢", facility: "Rotary Lions Blood Bank", facilityType: "Charitable Blood Bank", city: "Bangalore", location: "Indiranagar, Bangalore", address: "88 100 Feet Road, Indiranagar, Bangalore", phone: "+91 80 2525 9900", emergencyPhone: "+91 80 2528 1122", lat: 12.9716, lng: 77.5946, components: ["Whole Blood", "Plasma"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },

  // Red Cross Society (Hyderabad)
  { id: "bs-21", bankId: "bb-3", bloodGroup: "B+", units: 15, status: "Available", indicator: "🟢", facility: "Red Cross Blood Center", facilityType: "Red Cross Center", city: "Hyderabad", location: "Koti, Hyderabad", address: "4-1-825 Bank Street, Koti, Hyderabad", phone: "+91 40 2475 3311", emergencyPhone: "+91 40 2475 3399", lat: 17.385, lng: 78.4867, components: ["Whole Blood", "PRBC", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-22", bankId: "bb-3", bloodGroup: "O+", units: 25, status: "Available", indicator: "🟢", facility: "Red Cross Blood Center", facilityType: "Red Cross Center", city: "Hyderabad", location: "Koti, Hyderabad", address: "4-1-825 Bank Street, Koti, Hyderabad", phone: "+91 40 2475 3311", emergencyPhone: "+91 40 2475 3399", lat: 17.385, lng: 78.4867, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-23", bankId: "bb-3", bloodGroup: "O-", units: 1, status: "Critical", indicator: "🔴", facility: "Red Cross Blood Center", facilityType: "Red Cross Center", city: "Hyderabad", location: "Koti, Hyderabad", address: "4-1-825 Bank Street, Koti, Hyderabad", phone: "+91 40 2475 3311", emergencyPhone: "+91 40 2475 3399", lat: 17.385, lng: 78.4867, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-24", bankId: "bb-3", bloodGroup: "A+", units: 19, status: "Available", indicator: "🟢", facility: "Red Cross Blood Center", facilityType: "Red Cross Center", city: "Hyderabad", location: "Koti, Hyderabad", address: "4-1-825 Bank Street, Koti, Hyderabad", phone: "+91 40 2475 3311", emergencyPhone: "+91 40 2475 3399", lat: 17.385, lng: 78.4867, components: ["Whole Blood", "PRBC", "Platelets"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },

  // Fortis Escorts (Delhi)
  { id: "bs-25", bankId: "bb-5", bloodGroup: "B+", units: 21, status: "Available", indicator: "🟢", facility: "Fortis Escorts Blood Center", facilityType: "Super Speciality Blood Center", city: "Delhi", location: "Okhla, New Delhi", address: "Okhla Road, Sukhdev Vihar, New Delhi", phone: "+91 11 4713 5000", emergencyPhone: "+91 11 4713 5555", lat: 28.5603, lng: 77.2798, components: ["Whole Blood", "PRBC", "Platelets", "FFP", "Cryo"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-26", bankId: "bb-5", bloodGroup: "O+", units: 32, status: "Available", indicator: "🟢", facility: "Fortis Escorts Blood Center", facilityType: "Super Speciality Blood Center", city: "Delhi", location: "Okhla, New Delhi", address: "Okhla Road, Sukhdev Vihar, New Delhi", phone: "+91 11 4713 5000", emergencyPhone: "+91 11 4713 5555", lat: 28.5603, lng: 77.2798, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-27", bankId: "bb-5", bloodGroup: "O-", units: 4, status: "Low", indicator: "🟡", facility: "Fortis Escorts Blood Center", facilityType: "Super Speciality Blood Center", city: "Delhi", location: "Okhla, New Delhi", address: "Okhla Road, Sukhdev Vihar, New Delhi", phone: "+91 11 4713 5000", emergencyPhone: "+91 11 4713 5555", lat: 28.5603, lng: 77.2798, components: ["Whole Blood", "PRBC"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },

  // KEM Hospital (Mumbai)
  { id: "bs-28", bankId: "bb-6", bloodGroup: "B+", units: 17, status: "Available", indicator: "🟢", facility: "KEM Hospital Blood Bank", facilityType: "Government Medical College Blood Bank", city: "Mumbai", location: "Parel, Mumbai", address: "Acharya Donde Marg, Parel, Mumbai", phone: "+91 22 2410 7000", emergencyPhone: "+91 22 2413 6051", lat: 19.0028, lng: 72.8423, components: ["Whole Blood", "PRBC", "Platelets", "FFP"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-29", bankId: "bb-6", bloodGroup: "O+", units: 29, status: "Available", indicator: "🟢", facility: "KEM Hospital Blood Bank", facilityType: "Government Medical College Blood Bank", city: "Mumbai", location: "Parel, Mumbai", address: "Acharya Donde Marg, Parel, Mumbai", phone: "+91 22 2410 7000", emergencyPhone: "+91 22 2413 6051", lat: 19.0028, lng: 72.8423, components: ["Whole Blood", "PRBC", "Platelets"], openHours: "Open 24/7", updatedAt: new Date().toISOString() },
  { id: "bs-30", bankId: "bb-6", bloodGroup: "AB-", units: 2, status: "Critical", indicator: "🔴", facility: "KEM Hospital Blood Bank", facilityType: "Government Medical College Blood Bank", city: "Mumbai", location: "Parel, Mumbai", address: "Acharya Donde Marg, Parel, Mumbai", phone: "+91 22 2410 7000", emergencyPhone: "+91 22 2413 6051", lat: 19.0028, lng: 72.8423, components: ["Whole Blood", "Plasma"], openHours: "Open 24/7", updatedAt: new Date().toISOString() }
];

let memoryEmergency = [
  {
    id: "EMG-1092",
    patient: "Ramesh Gupta",
    bloodGroup: "O-",
    unitsNeeded: 2,
    hospital: "Apollo Hospital",
    location: "Greams Road, Chennai",
    city: "Chennai",
    phone: "+91 9876500112",
    urgency: "Emergency",
    requiredDate: "2026-08-12",
    requiredTime: "10:30 AM",
    message: "Urgent surgery patient needs rare O- blood type immediately.",
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "EMG-1088",
    patient: "Ananya Roy",
    bloodGroup: "A+",
    unitsNeeded: 1,
    hospital: "City Hospital",
    location: "Indiranagar, Bangalore",
    city: "Bangalore",
    phone: "+91 9123411223",
    urgency: "Urgent",
    requiredDate: "2026-08-13",
    requiredTime: "04:15 PM",
    message: "Post-partum recovery assistance required.",
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
];

let memoryBloodRequests = [
  {
    id: "REQ-201",
    patientName: "Vikram Malhotra",
    bloodGroup: "B+",
    units: 2,
    hospital: "Apollo Hospital",
    city: "Chennai",
    phone: "+91 9887766554",
    urgency: "Normal",
    status: "Approved",
    createdAt: new Date().toISOString(),
  },
];

let memoryDonationHistory = [
  {
    id: "dh-1",
    date: "12 March 2026",
    hospital: "Apollo Hospital, Chennai",
    bloodGroup: "A+",
    units: 1,
    status: "Completed",
    livesHelped: 3,
  },
];

let memoryPledges = [];
let memoryNotifications = [
  {
    id: "notif-1",
    type: "Emergency",
    title: "Urgent O- Blood Needed",
    description: "Apollo Hospital in Chennai urgently requires 2 units of O- blood.",
    time: "10 mins ago",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

// Helper timeout wrapper
function withTimeout(promise, ms = 800) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase timeout")), ms)),
  ]);
}

// ── Auth Routes ─────────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!isSupabaseOffline) {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email: cleanEmail, password }),
        1000
      );
      if (!error && data?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
        const token = jwt.sign({ id: data.user.id, email: cleanEmail }, JWT_SECRET, { expiresIn: "7d" });
        return res.json({
          token,
          user: {
            id: data.user.id,
            name: profile?.name || cleanEmail.split("@")[0],
            email: cleanEmail,
            phone: profile?.phone || "+91 9876543210",
            bloodGroup: profile?.blood_group || "O+",
            dob: profile?.dob || "1998-05-15",
            gender: profile?.gender || "Male",
            city: profile?.city || "Chennai",
            address: profile?.address || "",
            role: profile?.role || (cleanEmail.includes("admin") ? "admin" : "user"),
            status: profile?.status || "Active",
            donorStatus: profile?.donor_status || "Eligible Donor",
            donationsCount: profile?.donations_count ?? 3,
            livesHelped: profile?.lives_helped ?? 9,
            rewardPoints: profile?.reward_points ?? 350,
            lastDonation: profile?.last_donation || "12 Jan 2026",
            nextEligible: profile?.next_eligible || "12 Apr 2026",
          },
        });
      }
    } catch (e) {
      isSupabaseOffline = true;
    }
  }

  // User verification
  let user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({ error: "No account found with this email. Please register or check your email." });
  }

  // Strict Password Verification
  if (user.password && user.password !== password) {
    return res.status(401).json({
      error: "Invalid password! Please enter your correct password or the new password you reset.",
    });
  }

  // If password was empty, store it
  if (!user.password) {
    user.password = password;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ token, user });
});

app.post("/api/auth/register", async (req, res) => {
  const userData = req.body;
  const cleanEmail = (userData.email || "").trim().toLowerCase();

  if (!isSupabaseOffline) {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: cleanEmail,
          password: userData.password,
          options: { data: { name: userData.name, phone: userData.phone, blood_group: userData.bloodGroup } },
        }),
        1000
      );
      if (!error && data?.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name: userData.name,
          email: cleanEmail,
          phone: userData.phone,
          blood_group: userData.bloodGroup || "A+",
          city: userData.city,
          role: cleanEmail.includes("admin") ? "admin" : "user",
          status: "Active",
        });
        return res.json({ message: "Account created successfully" });
      }
    } catch (e) {
      isSupabaseOffline = true;
    }
  }

  // Check if user already exists in memory
  let existingUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    existingUser.password = userData.password;
    existingUser.name = userData.name || existingUser.name;
    existingUser.phone = userData.phone || existingUser.phone;
    existingUser.bloodGroup = userData.bloodGroup || existingUser.bloodGroup;
    existingUser.city = userData.city || existingUser.city;
    return res.json({ message: "Account registered successfully" });
  }

  const newUser = {
    id: "usr-" + Math.random().toString(36).substr(2, 9),
    name: userData.name || cleanEmail.split("@")[0],
    email: cleanEmail,
    password: userData.password,
    phone: userData.phone || "",
    bloodGroup: userData.bloodGroup || "A+",
    city: userData.city || "Chennai",
    address: userData.address || "",
    role: cleanEmail.includes("admin") ? "admin" : "user",
    status: "Active",
    donorStatus: "Eligible Donor",
    donationsCount: 0,
    livesHelped: 0,
    rewardPoints: 100,
  };
  memoryUsers.push(newUser);
  return res.json({ message: "Account created successfully" });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  return res.json({
    message: "Account verified. You can now set your new password.",
    email: cleanEmail,
    name: user?.name || "User",
  });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required." });
  }

  // Update in memory users
  let user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    user = {
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      name: cleanEmail.split("@")[0],
      email: cleanEmail,
      phone: "+91 9876543210",
      bloodGroup: "O+",
      city: "Chennai",
      role: cleanEmail.includes("admin") ? "admin" : "user",
      status: "Active",
      donorStatus: "Eligible Donor",
      donationsCount: 3,
      livesHelped: 9,
      rewardPoints: 650,
    };
    memoryUsers.push(user);
  }
  user.password = newPassword;

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({
    message: "Password reset successfully! You can now log in with your new password.",
    success: true,
    token,
    user,
  });
});

app.put("/api/auth/change-password", (req, res) => {
  return res.json({ message: "Password changed successfully" });
});

app.put("/api/auth/profile", (req, res) => {
  const profileData = req.body;
  const user = memoryUsers.find((u) => u.email === profileData.email) || profileData;
  Object.assign(user, profileData);
  return res.json({ message: "Profile updated successfully", user });
});

// ── Hospital Routes ─────────────────────────────────────────────────────────
app.get("/api/hospitals", async (req, res) => {
  const search = (req.query.search || "").toLowerCase();
  if (!isSupabaseOffline) {
    try {
      const { data, error } = await withTimeout(supabase.from("hospitals").select("*").order("name"), 800);
      if (!error && data && data.length > 0) {
        let list = data.map((h) => ({
          id: h.id,
          name: h.name,
          address: h.address || "",
          city: h.city || "",
          phone: h.phone || "",
          email: h.email || "",
          emergencyContact: h.emergency_contact || h.phone,
          blood: h.blood || "Available on request",
          availableGroups: h.available_groups || ["A+", "O+", "B+"],
          ambulance: h.ambulance || "Available",
          type: h.type || "General Hospital",
          status: h.status || "Active",
        }));
        if (search) list = list.filter((h) => h.name.toLowerCase().includes(search));
        return res.json(list);
      }
    } catch (e) {
      isSupabaseOffline = true;
    }
  }

  let list = memoryHospitals;
  if (search) list = list.filter((h) => h.name.toLowerCase().includes(search));
  return res.json(list);
});

app.post("/api/hospitals", (req, res) => {
  const newHosp = { id: "h-" + Date.now(), ...req.body, status: "Active" };
  memoryHospitals.unshift(newHosp);
  return res.json(newHosp);
});

app.put("/api/hospitals/:id", (req, res) => {
  const index = memoryHospitals.findIndex((h) => h.id === req.params.id);
  if (index !== -1) Object.assign(memoryHospitals[index], req.body);
  return res.json(memoryHospitals[index] || req.body);
});

app.delete("/api/hospitals/:id", (req, res) => {
  memoryHospitals = memoryHospitals.filter((h) => h.id !== req.params.id);
  return res.json({ message: "Hospital deleted successfully" });
});

// ── Donor Routes ────────────────────────────────────────────────────────────
app.get("/api/donors", async (req, res) => {
  const { search, bloodGroup, city } = req.query;
  let list = memoryDonors;
  if (bloodGroup && bloodGroup !== "All") list = list.filter((d) => d.bloodGroup === bloodGroup);
  if (city && city !== "All") list = list.filter((d) => d.city.toLowerCase().includes(city.toLowerCase()));
  if (search) list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  return res.json(list);
});

app.post("/api/donors", (req, res) => {
  const newDonor = { id: "d-" + Date.now(), ...req.body, status: "Available", isVerified: true };
  memoryDonors.unshift(newDonor);
  return res.json(newDonor);
});

// ── Blood Banks & Stock ─────────────────────────────────────────────────────
app.get("/api/blood-banks", async (req, res) => {
  if (!isSupabaseOffline) {
    try {
      const { data, error } = await withTimeout(supabase.from("blood_banks").select("*"), 800);
      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    } catch (e) {
      isSupabaseOffline = true;
    }
  }
  return res.json(memoryBloodBanks);
});

app.get("/api/blood-bank/stock", async (req, res) => {
  if (!isSupabaseOffline) {
    try {
      const { data, error } = await withTimeout(supabase.from("blood_stock").select("*"), 800);
      if (!error && data && data.length > 0) {
        const list = data.map((s) => ({
          id: s.id,
          bankId: s.bank_id,
          bloodGroup: s.blood_group,
          units: s.units,
          status: s.status,
          indicator: s.indicator,
          facility: s.facility || "Blood Bank",
          facilityType: s.facility_type || "Regional Blood Bank",
          city: s.city,
          location: s.location,
          address: s.address || s.location,
          phone: s.phone,
          emergencyPhone: s.emergency_phone || s.phone,
          lat: s.lat || 13.0604,
          lng: s.lng || 80.2496,
          components: s.components || ["Whole Blood", "PRBC", "Platelets"],
          openHours: s.open_hours || "Open 24/7",
          updatedAt: s.updated_at,
        }));
        return res.json(list);
      }
    } catch (e) {
      isSupabaseOffline = true;
    }
  }
  return res.json(memoryBloodStock);
});

// ── Emergency Requests ──────────────────────────────────────────────────────
app.get("/api/emergency", (req, res) => res.json(memoryEmergency));

app.post("/api/emergency", (req, res) => {
  const newReq = {
    id: "EMG-" + Math.floor(1000 + Math.random() * 9000),
    ...req.body,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  memoryEmergency.unshift(newReq);
  return res.json(newReq);
});

app.put("/api/emergency/:id/status", (req, res) => {
  const reqItem = memoryEmergency.find((r) => r.id === req.params.id);
  if (reqItem) reqItem.status = req.body.status;
  return res.json(reqItem || { id: req.params.id, status: req.body.status });
});

app.delete("/api/emergency/:id", (req, res) => {
  memoryEmergency = memoryEmergency.filter((r) => r.id !== req.params.id);
  return res.json({ message: "Emergency request deleted" });
});

// ── Blood Requests ──────────────────────────────────────────────────────────
app.get("/api/blood-requests", (req, res) => res.json(memoryBloodRequests));

app.post("/api/blood-requests", (req, res) => {
  const newReq = {
    id: "REQ-" + Math.floor(100 + Math.random() * 900),
    ...req.body,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  memoryBloodRequests.unshift(newReq);
  return res.json(newReq);
});

// ── Donation History, Pledges & Appointments ────────────────────────────────
let memoryAppointments = [
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

app.get("/api/donation-history", (req, res) => res.json(memoryDonationHistory));

app.get("/api/donation-pledges", (req, res) => res.json(memoryPledges));

app.post("/api/donation-pledges", (req, res) => {
  const id = "PLG-" + Math.floor(1000 + Math.random() * 9000);
  const pledge = {
    id,
    pledgeId: id,
    ...req.body,
    status: req.body.status || "Pledged / Pending Verification",
    createdAt: new Date().toISOString(),
  };
  memoryPledges.unshift(pledge);
  return res.json(pledge);
});

// ── Donation Appointments API ───────────────────────────────────────────────
app.get("/api/appointments", (req, res) => {
  return res.json(memoryAppointments);
});

app.post("/api/appointments", (req, res) => {
  const appointmentId = "APT-" + Math.floor(10000 + Math.random() * 90000);
  const newAppointment = {
    id: appointmentId,
    appointmentId,
    hospitalName: req.body.hospitalName || "General Hospital",
    city: req.body.city || "",
    address: req.body.address || "",
    phone: req.body.phone || "",
    date: req.body.date,
    time: req.body.time || "10:00 AM",
    donationType: req.body.donationType || "Whole Blood",
    donorName: req.body.donorName,
    donorPhone: req.body.donorPhone,
    bloodGroup: req.body.bloodGroup || "A+",
    status: "Confirmed",
    eligibilityPassed: req.body.eligibilityPassed ?? true,
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
  };
  memoryAppointments.unshift(newAppointment);

  // Also add a confirmation notification
  memoryNotifications.unshift({
    id: "notif-" + Date.now(),
    type: "Appointment",
    title: "Donation Appointment Confirmed",
    description: `Your appointment at ${newAppointment.hospitalName} is scheduled for ${newAppointment.date} at ${newAppointment.time}. (ID: ${appointmentId})`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return res.json(newAppointment);
});

app.put("/api/appointments/:id/reschedule", (req, res) => {
  const { date, time } = req.body;
  const appt = memoryAppointments.find((a) => a.id === req.params.id || a.appointmentId === req.params.id);
  if (!appt) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  if (date) appt.date = date;
  if (time) appt.time = time;
  appt.status = "Rescheduled";
  appt.rescheduledAt = new Date().toISOString();

  memoryNotifications.unshift({
    id: "notif-" + Date.now(),
    type: "Appointment",
    title: "Appointment Rescheduled",
    description: `Your appointment at ${appt.hospitalName} has been rescheduled to ${appt.date} at ${appt.time}.`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return res.json(appt);
});

app.put("/api/appointments/:id/cancel", (req, res) => {
  const { reason } = req.body;
  const appt = memoryAppointments.find((a) => a.id === req.params.id || a.appointmentId === req.params.id);
  if (!appt) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  appt.status = "Cancelled";
  appt.cancelReason = reason || "Cancelled by donor";
  appt.cancelledAt = new Date().toISOString();

  memoryNotifications.unshift({
    id: "notif-" + Date.now(),
    type: "Appointment",
    title: "Appointment Cancelled",
    description: `Your donation appointment at ${appt.hospitalName} for ${appt.date} was cancelled.`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return res.json(appt);
});

// ── Notifications ───────────────────────────────────────────────────────────
app.get("/api/notifications", (req, res) => res.json(memoryNotifications));

app.put("/api/notifications/read-all", (req, res) => {
  memoryNotifications.forEach((n) => (n.read = true));
  return res.json({ notifications: memoryNotifications });
});

app.delete("/api/notifications", (req, res) => {
  memoryNotifications = [];
  return res.json([]);
});

// ── Admin ───────────────────────────────────────────────────────────────────
app.get("/api/admin/users", (req, res) => res.json(memoryUsers));

app.put("/api/admin/users/:id/block", (req, res) => {
  const user = memoryUsers.find((u) => u.id === req.params.id);
  if (user) user.status = user.status === "Blocked" ? "Active" : "Blocked";
  return res.json(user || { id: req.params.id, status: "Active" });
});

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 LifeLink Express Backend running on http://localhost:${PORT}`);
  console.log(`📦 Database: Supabase PostgreSQL (${supabaseUrl})`);
});
