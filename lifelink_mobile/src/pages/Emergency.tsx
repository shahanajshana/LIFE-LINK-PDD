import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Emergency() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+',
    hospital: '',
    city: user?.city || '',
    urgency: 'Critical',
    contactPhone: user?.phone || '',
  });

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const URGENCY_LEVELS = ['Critical', 'Urgent', 'Normal'];

  const loadEmergencyRequests = async () => {
    try {
      const reqs = await api.getEmergencyRequests();
      setEmergencyRequests(reqs);
    } catch (error) {
      console.error('Failed to load emergency requests:', error);
    }
  };

  useEffect(() => {
    loadEmergencyRequests();
  }, []);

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.hospital || !formData.contactPhone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.createEmergencyRequest(formData);
      Alert.alert('Success', 'Emergency request submitted successfully!');
      setFormData({
        ...formData,
        patientName: '',
        hospital: '',
      });
      loadEmergencyRequests();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit emergency request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🚨 Emergency SOS</Text>
        <Text style={styles.subtitle}>Submit Emergency Blood Request</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Patient Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter patient name"
            value={formData.patientName}
            onChangeText={(text) => setFormData({ ...formData, patientName: text })}
          />

          <Text style={styles.label}>Blood Group Required *</Text>
          <View style={styles.bloodGroupContainer}>
            {BLOOD_GROUPS.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.bloodGroupButton,
                  formData.bloodGroup === group && styles.selectedBloodGroup,
                ]}
                onPress={() => setFormData({ ...formData, bloodGroup: group })}
              >
                <Text
                  style={[
                    styles.bloodGroupText,
                    formData.bloodGroup === group && styles.selectedBloodGroupText,
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Hospital Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter hospital name"
            value={formData.hospital}
            onChangeText={(text) => setFormData({ ...formData, hospital: text })}
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />

          <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.urgencyContainer}>
            {URGENCY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyButton,
                  formData.urgency === level && styles.selectedUrgency,
                ]}
                onPress={() => setFormData({ ...formData, urgency: level })}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    formData.urgency === level && styles.selectedUrgencyText,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Contact Phone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter contact number"
            value={formData.contactPhone}
            onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : '🚨 Submit Emergency Request'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.requestsContainer}>
          <Text style={styles.sectionTitle}>Recent Emergency Requests</Text>
          {emergencyRequests.length === 0 ? (
            <Text style={styles.noRequests}>No emergency requests found</Text>
          ) : (
            emergencyRequests.slice(0, 5).map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.patientName}>{req.patient_name}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      req.status === 'Pending' && styles.pendingBadge,
                      req.status === 'Fulfilled' && styles.fulfilledBadge,
                    ]}
                  >
                    {req.status}
                  </Text>
                </View>
                <Text style={styles.requestDetail}>Blood: {req.blood_group}</Text>
                <Text style={styles.requestDetail}>Hospital: {req.hospital}</Text>
                <Text style={styles.requestDetail}>City: {req.city}</Text>
                <Text style={styles.requestDetail}>
                  Urgency: <Text style={styles.requestUrgencyText}>{req.urgency}</Text>
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 70, // Space for bottom navigation
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  bloodGroupButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedBloodGroup: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  bloodGroupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  selectedBloodGroupText: {
    color: '#ffffff',
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  selectedUrgency: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  selectedUrgencyText: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  noRequests: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 20,
  },
  requestCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  fulfilledBadge: {
    backgroundColor: '#d1fae5',
    color: '#059669',
  },
  requestDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  requestUrgencyText: {
    fontWeight: 'bold',
    color: '#dc2626',
  },
});