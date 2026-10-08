/**
 * bloodCompatibility.js
 * Medical Blood Group Compatibility System (Red Blood Cells / Whole Blood)
 */

export const ALL_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/**
 * RBC Transfusion Compatibility:
 * Who can each blood group RECEIVE from?
 */
export const RECEIVER_COMPATIBILITY = {
  "B+":  ["B+", "B-", "O+", "O-"],
  "B-":  ["B-", "O-"],
  "A+":  ["A+", "A-", "O+", "O-"],
  "A-":  ["A-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal Recipient
  "AB-": ["AB-", "A-", "B-", "O-"],
  "O+":  ["O+", "O-"],
  "O-":  ["O-"], // Universal Donor can only receive O-
};

/**
 * Who can each blood group DONATE to?
 */
export const DONOR_COMPATIBILITY = {
  "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal Donor
  "O+":  ["O+", "A+", "B+", "AB+"],
  "A-":  ["A-", "A+", "AB-", "AB+"],
  "A+":  ["A+", "AB+"],
  "B-":  ["B-", "B+", "AB-", "AB+"],
  "B+":  ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // Universal Recipient only gives to AB+
};

/**
 * Antigen and Rh Factor Details
 */
export const BLOOD_GROUP_INFO = {
  "B+": {
    antigens: "B and Rh (D) antigens",
    antibodies: "Anti-A antibodies",
    rhFactor: "Positive (+)",
    canReceiveFrom: ["B+", "B-", "O+", "O-"],
    canDonateTo: ["B+", "AB+"],
    rarity: "~10% of global population (very common in South Asia ~33%)",
    role: "Third most common blood group globally; high demand for emergency surgeries.",
  },
  "B-": {
    antigens: "B antigen only",
    antibodies: "Anti-A and Anti-Rh antibodies",
    rhFactor: "Negative (-)",
    canReceiveFrom: ["B-", "O-"],
    canDonateTo: ["B-", "B+", "AB-", "AB+"],
    rarity: "Rare (~2% of global population)",
    role: "Critical rare blood group. Always in urgent need at regional blood banks.",
  },
  "A+": {
    antigens: "A and Rh (D) antigens",
    antibodies: "Anti-B antibodies",
    rhFactor: "Positive (+)",
    canReceiveFrom: ["A+", "A-", "O+", "O-"],
    canDonateTo: ["A+", "AB+"],
    rarity: "Second most common globally (~34%)",
    role: "High clinical demand for trauma, cancer treatments, and major surgeries.",
  },
  "A-": {
    antigens: "A antigen only",
    antibodies: "Anti-B and Anti-Rh antibodies",
    rhFactor: "Negative (-)",
    canReceiveFrom: ["A-", "O-"],
    canDonateTo: ["A-", "A+", "AB-", "AB+"],
    rarity: "Relatively rare (~6%)",
    role: "Can donate red blood cells to any A or AB patient.",
  },
  "O+": {
    antigens: "Rh (D) antigen only (No A or B)",
    antibodies: "Anti-A and Anti-B antibodies",
    rhFactor: "Positive (+)",
    canReceiveFrom: ["O+", "O-"],
    canDonateTo: ["O+", "A+", "B+", "AB+"],
    rarity: "Most common blood group globally (~38%)",
    role: "Essential frontline blood supply used in 80% of emergency transfusions.",
  },
  "O-": {
    antigens: "None (Universal Red Blood Cell Donor)",
    antibodies: "Anti-A, Anti-B, and Anti-Rh antibodies",
    rhFactor: "Negative (-)",
    canReceiveFrom: ["O-"],
    canDonateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    rarity: "Very rare and highest clinical value (~7%)",
    role: "Universal RBC Donor — standard in trauma dispatch and emergency ambulances.",
  },
  "AB+": {
    antigens: "A, B, and Rh (D) antigens (Universal Recipient)",
    antibodies: "None in plasma",
    rhFactor: "Positive (+)",
    canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    canDonateTo: ["AB+"],
    rarity: "Rare (~4%)",
    role: "Universal Red Cell Recipient. Universal Plasma Donor.",
  },
  "AB-": {
    antigens: "A and B antigens, No Rh",
    antibodies: "Anti-Rh antibodies",
    rhFactor: "Negative (-)",
    canReceiveFrom: ["AB-", "A-", "B-", "O-"],
    canDonateTo: ["AB-", "AB+"],
    rarity: "Rarest blood group globally (< 1%)",
    role: "Critically scarce. Immediate hospital match needed upon demand.",
  },
};

/**
 * Returns array of blood groups a patient of `recipientGroup` can receive.
 */
export function getCompatibleDonors(recipientGroup) {
  if (!recipientGroup) return ALL_BLOOD_GROUPS;
  return RECEIVER_COMPATIBILITY[recipientGroup] || [recipientGroup];
}

/**
 * Returns array of blood groups a donor of `donorGroup` can donate to.
 */
export function getCompatibleRecipients(donorGroup) {
  if (!donorGroup) return ALL_BLOOD_GROUPS;
  return DONOR_COMPATIBILITY[donorGroup] || [donorGroup];
}

/**
 * Check if a donor's blood group is compatible with a recipient's blood group.
 */
export function isCompatible(donorGroup, recipientGroup) {
  if (!recipientGroup || !donorGroup) return true;
  const validDonors = RECEIVER_COMPATIBILITY[recipientGroup] || [];
  return validDonors.includes(donorGroup);
}

/**
 * Get match classification details
 */
export function getMatchBadge(donorGroup, recipientGroup) {
  if (!recipientGroup || donorGroup === recipientGroup) {
    return {
      type: "exact",
      label: "Exact Match",
      badgeColor: "#166534",
      bgColor: "#dcfce7",
      borderColor: "#86efac",
      icon: "🎯",
    };
  }

  if (donorGroup === "O-") {
    return {
      type: "universal",
      label: "Universal Donor (O-)",
      badgeColor: "#854d0e",
      bgColor: "#fef9c3",
      borderColor: "#fde047",
      icon: "⭐",
    };
  }

  if (isCompatible(donorGroup, recipientGroup)) {
    return {
      type: "compatible",
      label: "Compatible Alternate",
      badgeColor: "#1e40af",
      bgColor: "#dbeafe",
      borderColor: "#93c5fd",
      icon: "🧬",
    };
  }

  return {
    type: "incompatible",
    label: "Incompatible",
    badgeColor: "#991b1b",
    bgColor: "#fee2e2",
    borderColor: "#fca5a5",
    icon: "⚠️",
  };
}
