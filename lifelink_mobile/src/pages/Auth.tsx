import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/;

const PASSWORD_RULES = [
  { key: 'noSpaces', label: 'No spaces allowed', test: (v: string) => v.length > 0 && !/\s/.test(v) },
  { key: 'minLen', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { key: 'maxLen', label: 'No more than 64 characters', test: (v: string) => v.length > 0 && v.length <= 64 },
  { key: 'startsCapital', label: 'Starts with a capital letter', test: (v: string) => /^[A-Z]/.test(v) },
  { key: 'hasLower', label: 'Contains a lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { key: 'hasNumber', label: 'Contains a number', test: (v: string) => /[0-9]/.test(v) },
  { key: 'hasSpecial', label: 'Contains a special character', test: (v: string) => SPECIAL_CHAR_REGEX.test(v) },
];

function checkPassword(password: string) {
  const results: any = {};
  let valid = true;
  for (const rule of PASSWORD_RULES) {
    const passed = rule.test(password || '');
    results[rule.key] = passed;
    if (!passed) valid = false;
  }
  return { valid, results };
}

function isValidEmail(email: string) {
  return EMAIL_REGEX.test((email || '').trim());
}

export default function Auth() {
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('A+');
  const [regCity, setRegCity] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleLoginSubmit = async () => {
    setError('');
    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      setError('Please enter both your email and password.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email, loginPassword);
      setLoading(false);
      if (res && res.token && res.user) {
        login(res.user, res.token);
        setLoginSuccess(true);
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'That email or password doesn\'t look right.');
    }
  };

  const handleRegisterSubmit = async () => {
    setError('');
    const name = regName.trim();
    const email = regEmail.trim();
    const phone = regPhone.trim();
    if (!name || !email || !phone || !regPassword || !regConfirm) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords don\'t match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name,
        email,
        phone,
        password: regPassword,
        bloodGroup: regBloodGroup,
        city: regCity,
      });
      setLoading(false);
      setRegSuccess(true);
      setTimeout(() => {
        setTab('login');
        setRegSuccess(false);
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'We couldn\'t create your account. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🩸</Text>
          <Text style={styles.title}>LifeLink</Text>
          <Text style={styles.subtitle}>Smart Blood Network</Text>
        </View>

        {/* Success Screens */}
        {loginSuccess && (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>❤️</Text>
            <Text style={styles.successTitle}>Login Successful!</Text>
            <Text style={styles.successText}>Redirecting to dashboard...</Text>
          </View>
        )}

        {regSuccess && (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Registration Successful!</Text>
            <Text style={styles.successText}>Please login to continue...</Text>
          </View>
        )}

        {/* Tabs */}
        {!loginSuccess && !regSuccess && (
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, tab === 'login' && styles.activeTab]}
                onPress={() => { setError(''); setTab('login'); }}
              >
                <Text style={[styles.tabText, tab === 'login' && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === 'register' && styles.activeTab]}
                onPress={() => { setError(''); setTab('register'); }}
              >
                <Text style={[styles.tabText, tab === 'register' && styles.activeTabText]}>Register</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Login Form */}
            {tab === 'login' && (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLoginSubmit}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Register Form */}
            {tab === 'register' && (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={regName}
                  onChangeText={setRegName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={regCity}
                  onChangeText={setRegCity}
                />
                <Text style={styles.label}>Blood Group</Text>
                <View style={styles.bloodGroupContainer}>
                  {BLOOD_GROUPS.map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={[
                        styles.bloodGroupButton,
                        regBloodGroup === group && styles.selectedBloodGroup,
                      ]}
                      onPress={() => setRegBloodGroup(group)}
                    >
                      <Text
                        style={[
                          styles.bloodGroupText,
                          regBloodGroup === group && styles.selectedBloodGroupText,
                        ]}
                      >
                        {group}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={regConfirm}
                  onChangeText={setRegConfirm}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                    {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the Terms & Privacy Policy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleRegisterSubmit}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Creating Account...' : 'Register'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#0f172a',
  },
  formContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  bloodGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  button: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
  },
  successContainer: {
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});