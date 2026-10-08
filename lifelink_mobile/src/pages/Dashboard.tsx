import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subText: string;
  color: string;
}

const StatCard = ({ icon, label, value, subText, color }: StatCardProps) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statSub, { color }]}>{subText}</Text>
  </View>
);

export default function Dashboard() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<any>(null);
  const [emergencyReqs, setEmergencyReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);

  useEffect(() => {
    api.getEmergencyRequests().then((reqs) => {
      if (reqs) setEmergencyReqs(reqs);
      setLoading(false);
    });
  }, []);

  const pendingCount = emergencyReqs.filter((r) => r.status === 'Pending').length;

  const fmt = (d: string | null) => {
    if (!d) return 'Not recorded';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.userInfo}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeHeading}>Welcome, {user.name} 👋</Text>
            {user.city && <Text style={styles.userMeta}>📍 {user.city}</Text>}
            {user.phone && <Text style={styles.userMeta}>📞 {user.phone}</Text>}
            <Text style={styles.userMeta}>📧 {user.email}</Text>
          </View>
        </View>

        <View style={styles.bloodGroupBadge}>
          <Text style={styles.bloodGroupSymbol}>{user.bloodGroup || 'A+'}</Text>
          <Text style={styles.bloodGroupLabel}>Blood Group</Text>
        </View>

        <View style={styles.eligibilityStatus}>
          <Text style={styles.statusTag}>{user.donorStatus || 'Eligible Donor'}</Text>
          <Text style={styles.statusDetail}>Last Donation: {fmt(user.lastDonation)}</Text>
          <Text style={styles.statusDetail}>Next Eligible: {fmt(user.nextEligible)}</Text>
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="🩸"
          label="Blood Group"
          value={user.bloodGroup || 'A+'}
          subText="Verified Group"
          color="#ef4444"
        />
        <StatCard
          icon="❤️"
          label="Donation Count"
          value={user.donationsCount ?? 0}
          subText="Verified Donations"
          color="#16a34a"
        />
        <StatCard
          icon="🌟"
          label="Lives Helped"
          value={`${user.livesHelped ?? 0} Lives`}
          subText="Community Impact"
          color="#f59e0b"
        />
        <StatCard
          icon="⏳"
          label="Pending Requests"
          value={`${loading ? '...' : pendingCount} Requests`}
          subText="Needs Response"
          color="#dc2626"
        />
        <StatCard
          icon="🏆"
          label="Reward Points"
          value={`${user.rewardPoints ?? 0} Points`}
          subText={
            user.rewardPoints >= 5000
              ? 'Platinum Badge'
              : user.rewardPoints >= 2000
              ? 'Gold Badge'
              : user.rewardPoints >= 500
              ? 'Silver Badge'
              : 'Bronze Badge'
          }
          color="#8b5cf6"
        />
      </View>

      {/* Emergency Alert Card */}
      <View style={styles.alertCard}>
        <View style={styles.alertInfo}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertIcon}>🚨</Text>
            <Text style={styles.alertTag}>URGENT EMERGENCY BROADCAST</Text>
          </View>
          <Text style={styles.alertTitle}>
            Emergency Blood Request{user.city ? ` near ${user.city}` : ''}
          </Text>
          <Text style={styles.alertText}>
            {emergencyReqs.length > 0
              ? `Patient ${emergencyReqs[0].patient_name} urgently needs ${emergencyReqs[0].blood_group} blood at ${emergencyReqs[0].hospital}.`
              : loading
              ? 'Loading emergency requests...'
              : 'No active emergency requests right now. Stay ready to respond.'}
          </Text>
        </View>

        <View style={styles.alertActions}>
          <TouchableOpacity
            style={styles.respondButton}
            onPress={() => router.push('/emergency')}
          >
            <Text style={styles.respondButtonText}>Submit / Respond SOS 🚨</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push('/emergency')}
          >
            <Text style={styles.historyButtonText}>Previous SOS Requests</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/donate-blood')}
          >
            <Text style={styles.quickActionIcon}>❤️</Text>
            <Text style={styles.quickActionLabel}>Donate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/find-blood')}
          >
            <Text style={styles.quickActionIcon}>🩸</Text>
            <Text style={styles.quickActionLabel}>Find Blood</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/donor-list')}
          >
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionLabel}>Donors</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/hospitals')}
          >
            <Text style={styles.quickActionIcon}>🏥</Text>
            <Text style={styles.quickActionLabel}>Hospitals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/emergency')}
          >
            <Text style={styles.quickActionIcon}>🚨</Text>
            <Text style={styles.quickActionLabel}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 70, // Space for bottom navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
  },
  heroBanner: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  userMeta: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  bloodGroupBadge: {
    backgroundColor: '#fee2e2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  bloodGroupSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  bloodGroupLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  eligibilityStatus: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusTag: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 5,
  },
  statusDetail: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertCard: {
    margin: 15,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  alertInfo: {
    marginBottom: 15,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  alertActions: {
    gap: 10,
  },
  respondButton: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  respondButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc2626',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    width: (width - 60) / 3,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
});