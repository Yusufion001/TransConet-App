import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FindTruckScreen from './src/screens/shipper/FindTruckScreen';
import ShipperDashboard from './src/screens/shipper/ShipperDashboard';
import TransporterDashboard from './src/screens/transporter/TransporterDashboard';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [tab, setTab] = useState('home');

  if (!user) {
    return authMode === 'login'
      ? <LoginScreen onRegister={() => setAuthMode('register')} />
      : <RegisterScreen onLogin={() => setAuthMode('login')} />;
  }

  const isTransporter = user.role === 'TRANSPORTER';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FB" />
      <View style={styles.body}>
        {isTransporter ? (
          <TransporterDashboard />
        ) : tab === 'find' ? (
          <FindTruckScreen />
        ) : (
          <ShipperDashboard />
        )}
      </View>

      <View style={styles.nav}>
        <NavButton label="Home" active={tab === 'home'} onPress={() => setTab('home')} />
        {!isTransporter && <NavButton label="Find Truck" active={tab === 'find'} onPress={() => setTab('find')} />}
        <NavButton label="Shipments" active={false} onPress={() => {}} />
        <NavButton label="Track" active={false} onPress={() => {}} />
        <NavButton label="Account" active={false} onPress={() => {}} />
      </View>
    </View>
  );
}

function NavButton({ label, active, onPress }) {
  return (
    <Text onPress={onPress} style={[styles.navText, active && styles.navActive]}>
      {label}
    </Text>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8FB' },
  body: { flex: 1 },
  nav: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  navText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#98A2B3',
    padding: 8,
  },
  navActive: { color: '#155EEF' },
});
