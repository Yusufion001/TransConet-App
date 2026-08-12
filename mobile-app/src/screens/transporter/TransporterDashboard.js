import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'https://transconet-app.onrender.com/api';

export default function TransporterDashboard() {
  const { user, token, logout } = useAuth();
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { loadMarketplace(); }, []);

  async function loadMarketplace() {
    setLoading(true); setMessage('');
    try {
      const response = await fetch(`${API_URL}/loads`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load marketplace.');
      setLoads(Array.isArray(data) ? data : []);
    } catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  async function submitBid(load) {
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/bids/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ loadId: load.id, amount: Number(load.suggestedBudget || 0), notes: 'Offer submitted from TransConet mobile app' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit offer.');
      setMessage('Offer submitted successfully.');
    } catch (e) { setMessage(e.message); }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TRANSPORTER WORKSPACE</Text>
        <Text style={styles.title}>Keep your fleet moving.</Text>
        <Text style={styles.subtitle}>Find verified loads, manage trips and keep your vehicles ready for the next job.</Text>

        <View style={styles.status}><Text style={styles.statusText}>LIVE MARKETPLACE</Text><Text style={styles.statusCopy}>Available cargo is loaded directly from TransConet.</Text></View>

        <Text style={styles.section}>Available loads</Text>
        {loading && <ActivityIndicator color="#155EEF" />}
        {!!message && <Text style={styles.message}>{message}</Text>}
        {!loading && loads.length === 0 && <Text style={styles.empty}>No available loads at the moment.</Text>}

        {loads.map(load => (
          <View key={load.id} style={styles.card}>
            <Text style={styles.cardTitle}>{load.title || 'General Freight Consignment'}</Text>
            <Text style={styles.meta}>{load.cargoType || 'GENERAL'} • {load.weightKg || 0} kg</Text>
            <Text style={styles.label}>ROUTE</Text>
            <Text style={styles.route}>{load.origin} → {load.destination}</Text>
            <View style={styles.bottom}>
              <Text style={styles.price}>₦{Number(load.suggestedBudget || 0).toLocaleString()}</Text>
              <Pressable style={styles.bid} onPress={() => submitBid(load)}><Text style={styles.bidText}>Submit Offer</Text></Pressable>
            </View>
          </View>
        ))}

        <Pressable style={styles.logout} onPress={logout}><Text style={styles.logoutText}>Sign out {user?.phoneNumber ? `• ${user.phoneNumber}` : ''}</Text></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { padding: 20, paddingBottom: 110 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#155EEF' },
  title: { marginTop: 7, fontSize: 28, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 8, color: '#667085', lineHeight: 21 },
  status: { marginTop: 20, padding: 15, borderRadius: 16, backgroundColor: '#ECFDF3' },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: '#027A48' },
  statusCopy: { marginTop: 5, color: '#344054', fontSize: 12 },
  section: { marginTop: 23, marginBottom: 11, fontSize: 18, fontWeight: '900', color: '#0B1F44' },
  message: { marginBottom: 10, color: '#155EEF', fontSize: 12, fontWeight: '700' },
  empty: { color: '#667085' },
  card: { padding: 17, marginBottom: 12, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  cardTitle: { fontSize: 17, fontWeight: '900', color: '#101828' },
  meta: { marginTop: 5, fontSize: 12, color: '#667085', fontWeight: '700' },
  label: { marginTop: 15, fontSize: 9, fontWeight: '900', letterSpacing: 1, color: '#98A2B3' },
  route: { marginTop: 4, fontSize: 14, fontWeight: '800', color: '#344054' },
  bottom: { marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: '#F2F4F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 17, fontWeight: '900', color: '#039855' },
  bid: { paddingHorizontal: 14, height: 42, borderRadius: 11, backgroundColor: '#155EEF', justifyContent: 'center' },
  bidText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  logout: { marginTop: 10, alignItems: 'center', padding: 15 },
  logoutText: { color: '#D92D20', fontWeight: '800', fontSize: 12 },
});
