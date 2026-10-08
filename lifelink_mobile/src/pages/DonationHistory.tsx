import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';

export default function DonationHistory() {
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    loadDonationHistory();
  }, []);

  const loadDonationHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getDonationHistory();
      setDonations(data);
    } catch (error) {
      console.error('Failed to load donation history:', error);
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
      <Text style={styles.title}>❤️ Donation History</Text>
      <Text style={styles.subtitle}>Track your blood donation journey</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading donation history...</Text>
        </View>
      ) : (
        <View style={styles.historyContainer}>
          {donations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💝</Text>
              <Text style={styles.emptyText}>No donations yet</Text>
              <Text style={styles.emptySubtext}>Your first donation could save a life!</Text>
            </View>
          ) : (
            donations.map((donation) => (
              <View key={donation.id} style={styles.donationCard}>
                <View style={styles.donationHeader}>
                  <View style={styles.bloodGroupBadge}>
                    <Text style={styles.bloodGroupText}>{donation.blood_group}</Text>
                  </View>
                  <Text style={styles.donationDate}>
                    {formatDate(donation.donation_date)}
                  </Text>
                </View>
                
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName}>
                    {donation.hospitals?.name || 'Unknown Hospital'}
                  </Text>
                  <Text style={styles.unitsText}>
                    {donation.units} {donation.units === 1 ? 'unit' : 'units'} donated
                  </Text>
                </View>

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={[
                    styles.statusBadge,
                    donation.status === 'Completed' && styles.completedBadge
                  ]}>
                    <Text style={styles.statusText}>{donation.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Summary Card */}
      {donations.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Donation Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Donations:</Text>
            <Text style={styles.summaryValue}>{donations.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Units:</Text>
            <Text style={styles.summaryValue}>
              {donations.reduce((sum, d) => sum + (d.units || 0), 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lives Impacted:</Text>
            <Text style={styles.summaryValue}>
              {donations.reduce((sum, d) => sum + (d.units || 0) * 3, 0)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 70,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  donationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  bloodGroupBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  donationDate: {
    fontSize: 14,
    color: '#64748b',
  },
  hospitalInfo: {
    marginBottom: 15,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  unitsText: {
    fontSize: 14,
    color: '#64748b',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});