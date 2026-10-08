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

export default function FindBlood() {
  const [loading, setLoading] = useState(false);
  const [bloodStock, setBloodStock] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  const loadBloodStock = async () => {
    setLoading(true);
    try {
      const data = await api.getBloodBankStock();
      setBloodStock(data);
    } catch (error) {
      console.error('Failed to load blood stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBloodStock();
  }, []);

  const getStockStatus = (units: number) => {
    if (units <= 0) return { status: 'Critical', color: '#dc2626', icon: '🔴' };
    if (units < 5) return { status: 'Critical', color: '#dc2626', icon: '🔴' };
    if (units < 15) return { status: 'Low', color: '#f59e0b', icon: '🟡' };
    return { status: 'Available', color: '#16a34a', icon: '🟢' };
  };

  const filteredStock = selectedCity
    ? bloodStock.filter((item) => item.city?.toLowerCase() === selectedCity.toLowerCase())
    : bloodStock;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🩸 Blood Bank Stock</Text>
      <Text style={styles.subtitle}>Real-time blood availability across hospitals</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city..."
          value={selectedCity}
          onChangeText={setSelectedCity}
        />
        <TouchableOpacity style={styles.searchButton} onPress={loadBloodStock}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Loading blood stock...</Text>
        </View>
      ) : (
        <View style={styles.stockContainer}>
          {filteredStock.length === 0 ? (
            <Text style={styles.noData}>No blood stock data available</Text>
          ) : (
            filteredStock.map((item) => {
              const status = getStockStatus(item.units || 0);
              return (
                <View key={item.id} style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <Text style={styles.hospitalName}>{item.hospital_name}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusIcon}>{status.icon}</Text>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.hospitalLocation}>📍 {item.city}</Text>
                  
                  <View style={styles.bloodTypesGrid}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => {
                      const units = item[type.toLowerCase().replace('+', '_plus')] || 0;
                      const typeStatus = getStockStatus(units);
                      return (
                        <View key={type} style={styles.bloodTypeCard}>
                          <Text style={styles.bloodType}>{type}</Text>
                          <Text style={[styles.units, { color: typeStatus.color }]}>
                            {units} units
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📋 Blood Stock Status Guide</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🟢</Text>
          </View>
          <Text style={styles.infoText}>Available: 15+ units</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🟡</Text>
          </View>
          <Text style={styles.infoText}>Low: 5-14 units</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔴</Text>
          </View>
          <Text style={styles.infoText}>Critical: Less than 5 units</Text>
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
  stockContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noData: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 40,
  },
  stockCard: {
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
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  hospitalLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  bloodTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodTypeCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  bloodType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  units: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoItem: {
    marginRight: 10,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
});