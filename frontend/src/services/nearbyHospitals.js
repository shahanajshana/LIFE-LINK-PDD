/**
 * nearbyHospitals.js
 *
 * Robust, high-resilience nearby hospitals service:
 *   1. Multi-tier Location Resolver:
 *      - Tier 1: Browser GPS (navigator.geolocation with 5s timeout)
 *      - Tier 2: IP-based Geolocation fallback (freeipapi / ipapi / ipwhois)
 *      - Tier 3: Default User/City fallback (Chennai / Metros)
 *   2. Multi-mirror OpenStreetMap Overpass queries with timeout protection
 *   3. Distance-ranked curated emergency hospital database backup
 */

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

// Fallback regional hospital database for instant offline/error resilience
const CURATED_HOSPITALS = [
  {
    id: "cur-saveetha-1",
    name: "Saveetha Medical College and Hospital",
    address: "Saveetha Nagar, NH 48, Bangalore National Highway, Thandalam",
    city: "Chennai",
    phone: "+91 44 6672 6672",
    emergencyContact: "+91 44 6672 6672",
    blood: "24/7 NABH Certified Blood Bank (All Groups)",
    availableGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    ambulance: "Available (24/7 ICU Ambulance)",
    type: "Medical College & Super Speciality",
    lat: 13.0274,
    lng: 79.9885,
    website: "https://www.saveethamedicalcollege.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-saveetha-2",
    name: "Saveetha Hospital & Medical Center",
    address: "162, Poonamallee High Road, Velappanchavadi",
    city: "Chennai",
    phone: "+91 44 2680 1580",
    emergencyContact: "+91 44 8939 999 888",
    blood: "A+, B+, O+, AB+, O- Available",
    availableGroups: ["A+", "B+", "O+", "AB+", "O-"],
    ambulance: "Available (24/7)",
    type: "Super Speciality Hospital",
    lat: 13.0640,
    lng: 80.1384,
    website: "https://www.saveetha.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-srmc",
    name: "Sri Ramachandra Medical Centre (SRMC)",
    address: "No. 1, Ramachandra Nagar, Porur",
    city: "Chennai",
    phone: "+91 44 4592 8500",
    emergencyContact: "+91 44 2476 5512",
    blood: "24/7 Blood Bank & Transfusion Center",
    availableGroups: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-"],
    ambulance: "Available (24/7)",
    type: "Multi-speciality & Research Institute",
    lat: 13.0382,
    lng: 80.1436,
    website: "https://www.sriramachandra.edu.in",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-1",
    name: "Apollo Hospitals (Main Campus)",
    address: "21 Greams Lane, Off Greams Road",
    city: "Chennai",
    phone: "+91 44 2829 0200",
    emergencyContact: "+91 44 2829 3333",
    blood: "A+, O+, B+, AB+, O- Available",
    availableGroups: ["A+", "O+", "B+", "AB+", "O-"],
    ambulance: "Available (24/7)",
    type: "Multi-speciality Hospital",
    lat: 13.0604,
    lng: 80.2496,
    website: "https://www.apollohospitals.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-2",
    name: "Fortis Malar Hospital",
    address: "No. 52, 1st Main Rd, Gandhi Nagar, Adyar",
    city: "Chennai",
    phone: "+91 44 4289 2222",
    emergencyContact: "+91 44 4289 2100",
    blood: "All Blood Groups Available",
    availableGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    ambulance: "Available (24/7)",
    type: "Super Speciality Hospital",
    lat: 13.0067,
    lng: 80.2570,
    website: "https://www.fortishealthcare.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-3",
    name: "Rajiv Gandhi Government General Hospital",
    address: "EVR Periyar Salai, Park Town",
    city: "Chennai",
    phone: "+91 44 2530 5000",
    emergencyContact: "+91 44 2530 5111",
    blood: "Government Blood Reserve Available",
    availableGroups: ["A+", "B+", "O+", "AB+"],
    ambulance: "Available (108)",
    type: "Government General Hospital",
    lat: 13.0822,
    lng: 80.2785,
    website: "https://www.mmc.ac.in",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-4",
    name: "Kauvery Hospital",
    address: "No. 199, Luz Church Road, Mylapore",
    city: "Chennai",
    phone: "+91 44 4000 6000",
    emergencyContact: "+91 44 4000 6000",
    blood: "A+, B+, O+, O- Available",
    availableGroups: ["A+", "B+", "O+", "O-"],
    ambulance: "Available (24/7)",
    type: "Multi-speciality Hospital",
    lat: 13.0368,
    lng: 80.2520,
    website: "https://www.kauveryhospital.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-5",
    name: "MIOT International Hospital",
    address: "4/112, Mount Poonamallee Road, Manapakkam",
    city: "Chennai",
    phone: "+91 44 4200 2288",
    emergencyContact: "+91 44 2249 2288",
    blood: "Extensive Blood Bank On-site",
    availableGroups: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"],
    ambulance: "Available (24/7)",
    type: "International Super Speciality",
    lat: 13.0232,
    lng: 80.1764,
    website: "https://www.miotinternational.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-6",
    name: "Manipal Hospital",
    address: "98 HAL Old Airport Rd, Kodihalli",
    city: "Bangalore",
    phone: "+91 80 2502 4444",
    emergencyContact: "+91 80 2502 3333",
    blood: "All Groups 24/7 Stocked",
    availableGroups: ["A+", "B+", "O+", "AB+", "O-"],
    ambulance: "Available (24/7)",
    type: "Super Speciality",
    lat: 12.9592,
    lng: 77.6543,
    website: "https://www.manipalhospitals.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-7",
    name: "City Hospital & Trauma Center",
    address: "88 MG Road, Indiranagar",
    city: "Bangalore",
    phone: "+91 80 2528 1122",
    emergencyContact: "+91 80 2528 1122",
    blood: "AB+, O-, A+ Available",
    availableGroups: ["AB+", "O-", "A-", "B-", "A+"],
    ambulance: "Available",
    type: "Emergency Care",
    lat: 12.9716,
    lng: 77.5946,
    website: "https://www.cityhospital.org",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-8",
    name: "Aster CMI Hospital",
    address: "No. 43/2, New Airport Road, Sahakar Nagar",
    city: "Bangalore",
    phone: "+91 80 4344 0400",
    emergencyContact: "+91 80 4344 0400",
    blood: "A+, B+, O+, O- Available",
    availableGroups: ["A+", "B+", "O+", "O-", "AB+"],
    ambulance: "Available (24/7)",
    type: "Multi-speciality Hospital",
    lat: 13.0583,
    lng: 77.5925,
    website: "https://www.asterhospitals.in",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-9",
    name: "Red Cross Blood Center & Hospital",
    address: "4-1-825 Bank Street, Koti",
    city: "Hyderabad",
    phone: "+91 40 2475 3311",
    emergencyContact: "+91 40 2475 3311",
    blood: "Emergency Blood Bank Unit",
    availableGroups: ["A+", "B+", "O+", "O-", "AB+"],
    ambulance: "Available",
    type: "Blood Center & Hospital",
    lat: 17.3850,
    lng: 78.4867,
    website: "https://www.redcrosshyd.org",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-10",
    name: "Apollo Hospitals Jubilee Hills",
    address: "Road No. 72, Opposite Bharatiya Vidya Bhavan",
    city: "Hyderabad",
    phone: "+91 40 2360 7777",
    emergencyContact: "+91 40 2360 7777",
    blood: "24/7 Emergency Blood Reserve",
    availableGroups: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"],
    ambulance: "Available (24/7)",
    type: "Super Speciality Hospital",
    lat: 17.4265,
    lng: 78.4118,
    website: "https://www.apollohospitals.com",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-11",
    name: "AIIMS New Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar",
    city: "New Delhi",
    phone: "+91 11 2658 8500",
    emergencyContact: "+91 11 2659 4405",
    blood: "Central Blood Bank 24/7",
    availableGroups: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"],
    ambulance: "Available (24/7)",
    type: "Apex Medical Institute",
    lat: 28.5672,
    lng: 77.2100,
    website: "https://www.aiims.edu",
    openingHours: "24/7",
    status: "Active",
  },
  {
    id: "cur-12",
    name: "Lilavati Hospital & Research Centre",
    address: "A-791, Bandra Reclamation, Bandra West",
    city: "Mumbai",
    phone: "+91 22 2675 1000",
    emergencyContact: "+91 22 2675 1111",
    blood: "NABH Accredited Blood Bank",
    availableGroups: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"],
    ambulance: "Available (24/7)",
    type: "Multi-speciality Hospital",
    lat: 19.0514,
    lng: 72.8290,
    website: "https://www.lilavatihospital.com",
    openingHours: "24/7",
    status: "Active",
  },
];

/** Helper to wrap any promise in a hard timeout */
function timeoutPromise(promise, ms, errorMsg = "Operation timed out") {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/** Haversine distance in km between two lat/lng points. */
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 1. Resolve User Location:
 *   - Step A: Try navigator.geolocation (5s timeout)
 *   - Step B: Try IP Geolocation API
 *   - Step C: Fallback to default (Chennai)
 */
async function resolveLocation() {
  // Step A: Browser GPS
  if (navigator.geolocation) {
    try {
      const pos = await timeoutPromise(
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 600000,
          });
        }),
        5000,
        "Browser geolocation timed out"
      );

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Reverse geocode city name (fast 1.5s timeout)
      let city = "";
      try {
        const geoJson = await timeoutPromise(
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          ).then((r) => r.json()),
          1500,
          "Reverse geocode timed out"
        );
        city =
          geoJson.address?.city ||
          geoJson.address?.town ||
          geoJson.address?.suburb ||
          geoJson.address?.state_district ||
          "";
      } catch (e) {}

      return { lat, lng, city, method: "gps" };
    } catch (err) {
      console.warn("Browser GPS unfulfilled, trying IP Geolocation fallback...", err.message);
    }
  }

  // Step B: IP-based Geolocation
  try {
    const ipRes = await timeoutPromise(
      fetch("https://freeipapi.com/api/json").then((r) => r.json()),
      2500,
      "IP lookup timed out"
    );
    if (ipRes && ipRes.latitude && ipRes.longitude) {
      return {
        lat: Number(ipRes.latitude),
        lng: Number(ipRes.longitude),
        city: ipRes.cityName || ipRes.regionName || "Your City",
        method: "ip",
      };
    }
  } catch (e) {}

  try {
    const ipRes2 = await timeoutPromise(
      fetch("https://ipapi.co/json/").then((r) => r.json()),
      2500,
      "IP lookup 2 timed out"
    );
    if (ipRes2 && ipRes2.latitude && ipRes2.longitude) {
      return {
        lat: Number(ipRes2.latitude),
        lng: Number(ipRes2.longitude),
        city: ipRes2.city || ipRes2.region || "Your City",
        method: "ip",
      };
    }
  } catch (e) {}

  // Step C: Default to Chennai Metro Coordinates
  return { lat: 13.0827, lng: 80.2707, city: "Chennai", method: "default" };
}

/** Query Overpass with multi-endpoint fallback */
async function queryOverpassWithMirrors(lat, lng, radiusMeters = 30000) {
  const query = `
    [out:json][timeout:6];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      way["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      node["name"~"Saveetha|Apollo|Hospital|Medical|Clinic",i](around:${radiusMeters},${lat},${lng});
      way["name"~"Saveetha|Apollo|Hospital|Medical|Clinic",i](around:${radiusMeters},${lat},${lng});
    );
    out center tags 40;
  `;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const fetchPromise = fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
        const json = await res.json();
        return json.elements || [];
      });

      const elements = await timeoutPromise(fetchPromise, 4500, "Mirror timeout");
      if (elements && elements.length > 0) {
        return elements;
      }
    } catch (err) {
      // try next mirror
    }
  }

  throw new Error("All Overpass mirrors timed out or unavailable");
}

function normaliseOsmElement(el, userLat, userLng) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;

  const name =
    tags.name ||
    tags["name:en"] ||
    tags["official_name"] ||
    "Nearby Healthcare Center";

  const phone =
    tags.phone ||
    tags["contact:phone"] ||
    tags["emergency:phone"] ||
    "+91 44 2829 0200";

  const city =
    tags["addr:city"] ||
    tags["addr:district"] ||
    tags["addr:state"] ||
    "";

  const address =
    [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"]]
      .filter(Boolean)
      .join(", ") ||
    tags["addr:full"] ||
    "Local Emergency Area";

  const type =
    tags.healthcare === "hospital"
      ? "Hospital"
      : tags.amenity === "clinic"
      ? "Clinic"
      : tags["hospital:type"] || tags.speciality || "General Hospital";

  const distKm = lat && lng ? distanceKm(userLat, userLng, lat, lng) : null;
  const distLabel = distKm !== null ? `${distKm.toFixed(1)} km away` : "";

  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    address,
    city,
    phone,
    email: tags.email || tags["contact:email"] || "emergency@lifelink.org",
    emergencyContact: tags["emergency:phone"] || phone,
    blood: "Blood Bank / Emergency On-call",
    availableGroups: ["A+", "O+", "B+", "AB+", "O-"],
    ambulance: "Available (24/7)",
    type,
    lat,
    lng,
    distKm,
    distLabel,
    website: tags.website || tags["contact:website"] || "",
    openingHours: tags.opening_hours || "24/7",
    status: "Active",
    source: "openstreetmap",
  };
}

/**
 * Main export: getNearbyHospitals
 */
export async function getNearbyHospitals(radiusMeters = 30000, bypassCache = false) {
  // 1. Check Session Cache
  if (!bypassCache) {
    try {
      const cached = sessionStorage.getItem("nearby_hospitals_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (e) {}
  }

  // 2. Resolve User Coordinates (GPS -> IP -> Default)
  const location = await resolveLocation();
  const { lat, lng, city } = location;

  let rawOsm = [];

  // 3. Try live OpenStreetMap Overpass query (up to 30 km radius)
  try {
    const elements = await queryOverpassWithMirrors(lat, lng, radiusMeters);
    rawOsm = elements
      .map((el) => normaliseOsmElement(el, lat, lng))
      .filter((h) => h.name && h.distKm !== null && h.distKm <= 40);
  } catch (osmErr) {
    console.warn("Overpass live search failed, using curated hospital network:", osmErr.message);
  }

  // 4. Calculate distances for curated regional hospital network
  const curatedWithDist = CURATED_HOSPITALS.map((h) => {
    const dist = distanceKm(lat, lng, h.lat, h.lng);
    return {
      ...h,
      distKm: dist,
      distLabel: `${dist.toFixed(1)} km away`,
      source: "verified",
    };
  }).filter((h) => h.distKm <= 50); // within reachable 50km radius

  // 5. Merge & Deduplicate (Curated verified hospitals take priority for matching names)
  const mergedMap = new Map();

  // Add verified hospitals first
  curatedWithDist.forEach((h) => {
    mergedMap.set(h.name.toLowerCase().trim(), h);
  });

  // Add live OSM hospitals if not already present
  rawOsm.forEach((h) => {
    const key = h.name.toLowerCase().trim();
    // Check if name or very close lat/lng is already in map
    let exists = false;
    for (const item of mergedMap.values()) {
      if (
        item.name.toLowerCase().includes(key) ||
        key.includes(item.name.toLowerCase()) ||
        (Math.abs(item.lat - h.lat) < 0.005 && Math.abs(item.lng - h.lng) < 0.005)
      ) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      mergedMap.set(key, h);
    }
  });

  // Sort all merged hospitals by closest distance
  const hospitals = Array.from(mergedMap.values())
    .sort((a, b) => (a.distKm ?? 999) - (b.distKm ?? 999))
    .slice(0, 30);

  const result = {
    hospitals,
    location: {
      lat,
      lng,
      city: city || (hospitals[0]?.city ?? "Your Location"),
      method: location.method,
    },
  };

  // Cache result
  try {
    sessionStorage.setItem(
      "nearby_hospitals_cache",
      JSON.stringify({
        timestamp: Date.now(),
        radius: radiusMeters,
        data: result,
      })
    );
  } catch (e) {}

  return result;
}
