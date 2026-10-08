import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { api } from '../services/api';

export default function Hospitals() {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const data = await api.getHospitals();
      setHospitals(data);
    } catch (error) {
      console.error('Failed to load hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const filteredHospitals = hospitals.filter((hospital) => {
    const query = searchQuery.toLowerCase();
    return (
      hospital.name?.toLowerCase().includes(query) ||
      hospital.city?.toLowerCase().includes(query) ||
      hospital.address?.toLowerCase().includes(query)
    );
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏥 Hospitals Network</Text>
      <Text style={styles.subtitle}>Partner hospitals in our network</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals by name, city, or address..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={loadHospitals}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading hospitals...</Text>
        </View>
      ) : (
        <View style={styles.hospitalsContainer}>
          {filteredHospitals.length === 0 ? (
            <Text style={styles.noHospitals}>No hospitals found</Text>
          ) : (
            filteredHospitals.map((hospital) => (
              <View key={hospital.id} style={styles.hospitalCard}>
                <View style={styles.hospitalHeader}>
                  <View style={styles.hospitalIcon}>
                    <Text style={styles.hospitalIconText}>🏥</Text>
                  </View>
                  <View style={styles.hospitalInfo}>
                    <Text style={styles.hospitalName}>{hospital.name}</Text>
                    <Text style={styles.hospitalLocation}>📍 {hospital.city}</Text>
                  </View>
                </View>

                <View style={styles.hospitalDetails}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailText}>{hospital.address}</Text>
                  
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailText}>{hospital.phone}</Text>

                  {hospital.email && (
                    <>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailText}>{hospital.email}</Text>
                    </>
                  )}

                  {hospital.blood_bank_available && (
                    <View style={styles.bloodBankBadge}>
                      <Text style={styles.bloodBankText}>🩸 Blood Bank Available</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(hospital.phone)}
                  >
                    <Text style={styles.callButtonText}>📞 Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => handleGetDirections(hospital.address)}
                  >
                    <Text style={styles.directionsButtonText}>🗺️ Directions</Text>
                  </TouchableOpacity>
                </View>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
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
  hospitalsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noHospitals: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 40,
  },
  hospitalCard: {
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
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  hospitalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  hospitalIconText: {
    fontSize: 24,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  hospitalLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  hospitalDetails: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 2,
  },
  bloodBankBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  bloodBankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});