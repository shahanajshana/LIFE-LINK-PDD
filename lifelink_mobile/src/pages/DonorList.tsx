import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';

export default function DonorList() {
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<any[]>([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const loadDonors = async () => {
    setLoading(true);
    try {
      const data = await api.getDonors({
        bloodGroup: selectedBloodGroup || undefined,
        city: selectedCity || undefined,
      });
      setDonors(data);
    } catch (error) {
      console.error('Failed to load donors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, []);

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredDonors = donors.filter((donor) => {
    const matchesBlood = !selectedBloodGroup || donor.blood_group === selectedBloodGroup;
    const matchesCity = !selectedCity || donor.city?.toLowerCase() === selectedCity.toLowerCase();
    return matchesBlood && matchesCity;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👥 Find Donors</Text>
      <Text style={styles.subtitle}>Connect with blood donors in your area</Text>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Filter by Blood Group</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bloodGroupScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedBloodGroup && styles.activeFilterChip]}
            onPress={() => { setSelectedBloodGroup(''); loadDonors(); }}
          >
            <Text style={[styles.filterChipText, !selectedBloodGroup && styles.activeFilterChipText]}>
              All
            </Text>
          </TouchableOpacity>
          {BLOOD_GROUPS.map((group) => (
            <TouchableOpacity
              key={group}
              style={[styles.filterChip, selectedBloodGroup === group && styles.activeFilterChip]}
              onPress={() => { setSelectedBloodGroup(group); loadDonors(); }}
            >
              <Text style={[styles.filterChipText, selectedBloodGroup === group && styles.activeFilterChipText]}>
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Filter by City</Text>
        <TextInput
          style={styles.cityInput}
          placeholder="Enter city name"
          value={selectedCity}
          onChangeText={setSelectedCity}
          onSubmitEditing={loadDonors}
        />
        <TouchableOpacity style={styles.searchButton} onPress={loadDonors}>
          <Text style={styles.searchButtonText}>🔍 Search Donors</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading donors...</Text>
        </View>
      ) : (
        <View style={styles.donorsContainer}>
          {filteredDonors.length === 0 ? (
            <Text style={styles.noDonors}>No donors found matching your criteria</Text>
          ) : (
            filteredDonors.map((donor) => (
              <View key={donor.id} style={styles.donorCard}>
                <View style={styles.donorHeader}>
                  <View style={styles.donorAvatar}>
                    <Text style={styles.donorAvatarText}>
                      {donor.name ? donor.name.charAt(0).toUpperCase() : 'D'}
                    </Text>
                  </View>
                  <View style={styles.donorInfo}>
                    <Text style={styles.donorName}>{donor.name}</Text>
                    <Text style={styles.donorLocation}>📍 {donor.city}</Text>
                  </View>
                  <View style={styles.bloodGroupBadge}>
                    <Text style={styles.bloodGroupText}>{donor.blood_group}</Text>
                  </View>
                </View>
                <View style={styles.donorDetails}>
                  <Text style={styles.donorDetail}>📞 {donor.phone}</Text>
                  <Text style={styles.donorDetail}>
                    Donations: <Text style={styles.donationCount}>{donor.donations_count || 0}</Text>
                  </Text>
                  <View style={styles.statusRow}>
                    <Text style={styles.donorDetail}>Status:</Text>
                    <View style={[styles.statusBadge, donor.status === 'Available' && styles.availableStatus]}>
                      <Text style={styles.statusText}>{donor.status}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.contactButton}>
                  <Text style={styles.contactButtonText}>📞 Contact Donor</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}
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
  filtersContainer: {
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
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  bloodGroupScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  cityInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  donorsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noDonors: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 40,
  },
  donorCard: {
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
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  donorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  donorAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  donorLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  bloodGroupBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bloodGroupText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  donorDetails: {
    marginBottom: 15,
  },
  donorDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  donationCount: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  availableStatus: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  contactButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});