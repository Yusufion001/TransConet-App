import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function TransporterHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ loads: 0, vehicles: 0, trips: 0, bids: 0 });
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setBusy(true);
    try {
      const [loadsRes, vehiclesRes, bidsRes] = await Promise.all([
        api.get('/loads'),
        api.get('/fleet/my-vehicles'),
        api.get('/bids/my-bids'),
      ]);
      const loads = Array.isArray(loadsRes.data) ? loadsRes.data : [];
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      const bids = Array.isArray(bidsRes.data) ? bidsRes.data : [];
      setStats({
        loads: loads.filter((item) => !item.status || item.status === 'AVAILABLE').length,
        vehicles: vehicles.length,
        trips: bids.filter((item) => item.status === 'ACCEPTED').length,
        bids: bids.filter((item) => item.status === 'PENDING').length,
      });
      setError('');
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load transporter workspace.');
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const actions = [
    ['Find Loads', 'Browse live cargo and submit an offer.', 'Jobs'],
    ['My Fleet', 'View vehicles, verification and location.', 'Fleet'],
    ['Active Trips', 'View accepted loads and track deliveries.', 'Trips'],
    ['My Bids', 'Review pending and completed offers.', 'Trips'],
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#155EEF" />}
    >
      <Text style={styles.eyebrow}>TRANSPORTER WORKSPACE</Text>
      <Text style={styles.title}>Transport Hub</Text>
      <Text style={styles.subtitle}>Find loads, manage your fleet and deliver with confidence.</Text>
      <Text style={styles.welcome}>Welcome{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.</Text>

      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
      {busy ? <ActivityIndicator size="large" color="#155EEF" style={styles.loader} /> : null}

      <View style={styles.stats}>
        <Stat label="Available loads" value={stats.loads} />
        <Stat label="Fleet vehicles" value={stats.vehicles} />
        <Stat label="Active trips" value={stats.trips} />
        <Stat label="Pending bids" value={stats.bids} />
      </View>

      <Text style={styles.sectionTitle}>Operations</Text>
      {actions.map(([title, text, route]) => (
        <Pressable key={title} style={styles.card} onPress={() => navigation.navigate(route)}>
          <View style={styles.icon}><Text style={styles.iconText}>{title === 'Find Loads' ? '📦' : title === 'My Fleet' ? '🚛' : title === 'Active Trips' ? '🛣️' : '💼'}</Text></View>
          <View style={styles.cardBody}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardText}>{text}</Text></View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}

      <Pressable style={styles.support} onPress={() => navigation.navigate('Account')}>
        <Text style={styles.supportTitle}>Account & verification</Text>
        <Text style={styles.supportText}>Manage your profile, KYC and sign-in settings.</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 20, paddingTop: 24, paddingBottom: 110 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#155EEF' },
  title: { marginTop: 6, fontSize: 30, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 7, fontSize: 14, lineHeight: 21, color: '#667085' },
  welcome: { marginTop: 26, marginBottom: 12, fontSize: 22, fontWeight: '900', color: '#101828' },
  loader: { marginVertical: 12 },
  error: { marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: '#FEF3F2' },
  errorText: { color: '#B42318', fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', minHeight: 86, padding: 14, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#155EEF' },
  statLabel: { marginTop: 4, fontSize: 11, fontWeight: '700', color: '#667085' },
  sectionTitle: { marginTop: 26, marginBottom: 10, fontSize: 18, fontWeight: '900', color: '#101828' },
  card: { minHeight: 86, marginBottom: 10, padding: 14, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0', flexDirection: 'row', alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF4FF' },
  iconText: { fontSize: 23 },
  cardBody: { flex: 1, marginLeft: 13 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  cardText: { marginTop: 4, fontSize: 11, lineHeight: 17, color: '#667085' },
  arrow: { marginLeft: 8, fontSize: 28, color: '#98A2B3' },
  support: { marginTop: 8, padding: 16, borderRadius: 16, backgroundColor: '#EFF4FF' },
  supportTitle: { fontSize: 14, fontWeight: '900', color: '#155EEF' },
  supportText: { marginTop: 4, fontSize: 11, lineHeight: 17, color: '#475467' },
});
