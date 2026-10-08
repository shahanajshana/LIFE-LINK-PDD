import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function MobileLayout({ children, title }: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user: authUser, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const user = authUser || {
    name: 'Shahanaj',
    email: 'shahanaj1925@gmail.com',
    bloodGroup: 'A+',
    donorStatus: 'Eligible Donor',
  };

  const navItems = [
    { path: '/dashboard',        label: 'Dashboard',        icon: '🏠' },
    { path: '/donate-blood',     label: 'Donate Blood',     icon: '❤️' },
    { path: '/find-blood',       label: 'Find Blood',       icon: '🩸' },
    { path: '/hospitals',        label: 'Nearby Hospitals', icon: '🏥' },
    { path: '/donation-history', label: 'Donation History', icon: '📋' },
    { path: '/donor-list',       label: 'Verified Donors',  icon: '👥' },
    { path: '/notifications',    label: 'Notifications',    icon: '🔔' },
    { path: '/settings',         label: 'Settings & Profile', icon: '⚙️' },
  ];

  const bottomTabs = [
    { path: '/dashboard',    label: 'Home',      icon: '🏠' },
    { path: '/donate-blood', label: 'Donate',    icon: '❤️' },
    { path: '/emergency',   label: 'SOS',       icon: '🚨', isSOS: true },
    { path: '/find-blood',   label: 'Find Blood',icon: '🩸' },
    { path: '/hospitals',    label: 'Hospitals', icon: '🏥' },
  ];

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerOpen(false);
    });
  };

  const handleNavigate = (path: string) => {
    closeDrawer();
    router.push(path as any);
  };

  const handleLogout = () => {
    closeDrawer();
    Alert.alert('Logout', 'Are you sure you want to log out of LifeLink?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth' as any);
        },
      },
    ]);
  };

  const getPageTitle = () => {
    if (title) return title;
    const matched = navItems.find((i) => i.path === pathname);
    if (matched) return matched.label;
    if (pathname === '/emergency') return '🚨 Emergency SOS';
    return 'LifeLink Mobile';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* ── Native Top Header Bar ── */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          {/* Hamburger Menu Button (Opens Slide Bar) */}
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={openDrawer}
            activeOpacity={0.7}
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {getPageTitle()}
            </Text>
            <Text style={styles.headerSubtitle}>LifeLink Network</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Quick SOS button */}
          <TouchableOpacity
            style={styles.headerSosBtn}
            onPress={() => router.push('/emergency' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.headerSosText}>🚨 SOS</Text>
          </TouchableOpacity>

          {/* User Avatar */}
          <TouchableOpacity
            style={styles.headerAvatar}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitial}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Screen Content ── */}
      <View style={styles.bodyContent}>
        {children}
      </View>

      {/* ── Persistent Bottom Navigation Bar ── */}
      <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {bottomTabs.map((tab) => {
          const isActive = pathname === tab.path;
          if (tab.isSOS) {
            return (
              <TouchableOpacity
                key={tab.path}
                style={styles.bottomNavSosBtn}
                onPress={() => router.push(tab.path as any)}
                activeOpacity={0.85}
              >
                <View style={styles.sosFabCircle}>
                  <Text style={styles.sosFabIcon}>🚨</Text>
                </View>
                <Text style={styles.sosFabLabel}>SOS</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.path}
              style={[styles.bottomNavItem, isActive && styles.bottomNavItemActive]}
              onPress={() => router.push(tab.path as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomNavIcon}>{tab.icon}</Text>
              <Text style={[styles.bottomNavLabel, isActive && styles.bottomNavLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}

        {/* Menu Tab that opens Slide Bar */}
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={openDrawer}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomNavIcon}>☰</Text>
          <Text style={styles.bottomNavLabel}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* ── Slide Bar Navigation Drawer Modal ── */}
      {drawerOpen && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          {/* Backdrop Blur Overlay */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View style={[styles.drawerBackdrop, { opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>

          {/* Animated Slide Drawer */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                paddingTop: insets.top + 10,
                paddingBottom: insets.bottom + 16,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Drawer Header Row */}
            <View style={styles.drawerHeaderRow}>
              <View style={styles.drawerBrand}>
                <View style={styles.drawerBrandBadge}>
                  <Text style={{ fontSize: 22 }}>🩸</Text>
                </View>
                <View>
                  <Text style={styles.drawerBrandTitle}>LifeLink</Text>
                  <Text style={styles.drawerBrandSubtitle}>Mobile Healthcare</Text>
                </View>
              </View>

              {/* Close Drawer Button */}
              <TouchableOpacity
                style={styles.drawerCloseBtn}
                onPress={closeDrawer}
                activeOpacity={0.7}
              >
                <Text style={styles.drawerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.drawerScroll}>
              {/* Section Header */}
              <Text style={styles.drawerSectionLabel}>MAIN MENU</Text>

              {/* Navigation Items */}
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <TouchableOpacity
                    key={item.path}
                    style={[styles.drawerNavItem, isActive && styles.drawerNavItemActive]}
                    onPress={() => handleNavigate(item.path)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.drawerNavIcon}>{item.icon}</Text>
                    <Text style={[styles.drawerNavLabel, isActive && styles.drawerNavLabelActive]}>
                      {item.label}
                    </Text>
                    {isActive && <View style={styles.drawerActiveDot} />}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.drawerDivider} />

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.drawerLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.drawerNavIcon}>🚪</Text>
                <Text style={styles.drawerLogoutLabel}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Drawer Footer */}
            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFooterText}>LifeLink Mobile Pro · v2.4</Text>
              <Text style={styles.drawerLiveText}>● Live Network</Text>
            </View>
          </Animated.View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  /* ── Header ── */
  headerBar: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  hamburgerLine: {
    width: 18,
    height: 2.2,
    backgroundColor: '#0f172a',
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerSosBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerSosText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  /* ── Body ── */
  bodyContent: {
    flex: 1,
  },

  /* ── Bottom Nav ── */
  bottomNavContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    flex: 1,
  },
  bottomNavItemActive: {},
  bottomNavIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomNavLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  bottomNavLabelActive: {
    color: '#ef4444',
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    marginTop: 2,
  },
  bottomNavSosBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    paddingHorizontal: 4,
  },
  sosFabCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sosFabIcon: {
    fontSize: 20,
  },
  sosFabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
    marginTop: 2,
  },

  /* ── Drawer Modal ── */
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  drawerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerBrandBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  drawerBrandSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerCloseText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '800',
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 14,
  },
  drawerProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginTop: 14,
  },
  drawerAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerAvatarInitial: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  drawerUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  drawerUserEmail: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  drawerTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  drawerBloodTag: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  drawerBloodTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
  },
  drawerStatusTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  drawerStatusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  drawerEmergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  drawerEmergencyTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  drawerEmergencySub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10.5,
  },
  drawerEmergencyArrow: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  drawerSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  drawerNavItemActive: {
    backgroundColor: '#ef4444',
  },
  drawerNavIcon: {
    fontSize: 16,
  },
  drawerNavLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  drawerNavLabelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  drawerActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  drawerLogoutLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#dc2626',
  },
  drawerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  drawerFooterText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  drawerLiveText: {
    fontSize: 10.5,
    color: '#16a34a',
    fontWeight: '800',
  },
});
