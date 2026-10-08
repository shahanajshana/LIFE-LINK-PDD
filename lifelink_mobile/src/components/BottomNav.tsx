import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: '🏠' },
  { path: '/find-blood', label: 'Find Blood', icon: '🩸' },
  { path: '/donate-blood', label: 'Donate', icon: '❤️' },
  { path: '/hospitals', label: 'Hospitals', icon: '🏥' },
  { path: '/emergency', label: 'SOS', icon: '🚨' },
  { path: '/donation-history', label: 'History', icon: '📋' },
  { path: '/notifications', label: 'Alerts', icon: '🔔' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={[styles.navIcon, isActive && styles.activeNavIcon]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 5,
    paddingTop: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  navItem: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    alignItems: 'center',
    minWidth: 60,
  },
  activeNavItem: {
    // Active state styling if needed
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 1,
  },
  activeNavIcon: {
    // Active icon styling if needed
  },
  navLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },
  activeNavLabel: {
    color: '#ef4444',
  },
});