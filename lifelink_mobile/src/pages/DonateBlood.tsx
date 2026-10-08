import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DonateBlood() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [donationHistory, setDonationHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHospitals();
    loadDonationHistory();
  }, []);

  const loadHospitals = async () => {
    try {
      const data = await api.getHospitals();
      setHospitals(data);
    } catch (error) {
      console.error('Failed to load hospitals:', error);
    }
  };

  const loadDonationHistory = async () => {
    try {
      const data = await api.getDonationHistory();
      setDonationHistory(data);
    } catch (error) {
      console.error('Failed to load donation history:', error);
    }
  };

  const handleDonate = async () => {
    if (!selectedHospital) {
      Alert.alert('Error', 'Please select a hospital');
      return;
    }

    setLoading(true);
    try {
      await api.recordDonation({
        hospitalId: selectedHospital.id,
        bloodGroup: user?.bloodGroup || 'A+',
        units: 1,
      });
      Alert.alert('Success', 'Thank you for your donation! Your contribution helps save lives.');
      loadDonationHistory();
      setSelectedHospital(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record donation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>❤️ Donate Blood</Text>
      <Text style={styles.subtitle}>Schedule your blood donation</Text>

      {/* User Info Card */}
      <View style={styles.userInfoCard}>
        <View style={styles.userInfoRow}>
          <Text style={styles.userInfoLabel}>Blood Group:</Text>
          <Text style={styles.userInfoValue}>{user?.bloodGroup || 'A+'}</Text>
        </View>
        <View style={styles.userInfoRow}>
          <Text style={styles.userInfoLabel}>Donor Status:</Text>
          <Text style={[styles.userInfoValue, styles.eligibleText]}>
            {user?.donorStatus || 'Eligible Donor'}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Text style={styles.userInfoLabel}>Total Donations:</Text>
          <Text style={styles.userInfoValue}>{user?.donationsCount || 0}</Text>
        </View>
      </View>

      {/* Hospital Selection */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Select Hospital</Text>
        <ScrollView style={styles.hospitalList} nestedScrollEnabled>
          {hospitals.map((hospital) => (
            <TouchableOpacity
              key={hospital.id}
              style={[
                styles.hospitalCard,
                selectedHospital?.id === hospital.id && styles.selectedHospital,
              ]}
              onPress={() => setSelectedHospital(hospital)}
            >
              <Text style={styles.hospitalName}>{hospital.name}</Text>
              <Text style={styles.hospitalAddress}>{hospital.address}</Text>
              <Text style={styles.hospitalPhone}>📞 {hospital.phone}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Donate Button */}
      <TouchableOpacity
        style={[styles.donateButton, loading && styles.buttonDisabled]}
        onPress={handleDonate}
        disabled={loading}
      >
        <Text style={styles.donateButtonText}>
          {loading ? 'Processing...' : '❤️ Record Donation'}
        </Text>
      </TouchableOpacity>

      {/* Donation History */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Donation History</Text>
        {donationHistory.length === 0 ? (
          <Text style={styles.noHistory}>No donations recorded yet</Text>
        ) : (
          donationHistory.map((donation) => (
            <View key={donation.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.hospitalName}>
                  {donation.hospitals?.name || 'Unknown Hospital'}
                </Text>
                <Text style={styles.bloodGroupBadge}>{donation.blood_group}</Text>
              </View>
              <Text style={styles.historyDate}>
                📅 {formatDate(donation.donation_date)}
              </Text>
              <Text style={styles.historyStatus}>
                Status: <Text style={styles.completedText}>{donation.status}</Text>
              </Text>
            </View>
          ))
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    padding: 20,
    paddingBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userInfoCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  eligibleText: {
    color: '#16a34a',
  },
  sectionContainer: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  hospitalList: {
    maxHeight: 300,
  },
  hospitalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedHospital: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  hospitalPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  donateButton: {
    backgroundColor: '#ef4444',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  donateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noHistory: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bloodGroupBadge: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  historyStatus: {
    fontSize: 14,
    color: '#64748b',
  },
  completedText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
});