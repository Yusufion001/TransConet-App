import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_URL = 'https://transconet-app.onrender.com/api';

export default function FindTruckScreen() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchMarketplace() {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/loads`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Marketplace request failed.');
      const all = Array.isArray(data) ? data : [];
      const from = origin.trim().toLowerCase();
      const to = destination.trim().toLowerCase();
      setLoads(all.filter(load =>
        (!from || String(load.origin || '').toLowerCase().includes(from)) &&
        (!to || String(load.destination || '').toLowerCase().includes(to))
      ));
    } catch (e) {
      setLoads([]);
      setError(e.message || 'Unable to load the live marketplace.');
    } finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>SHIPPER</Text>
        <Text style={styles.title}>Find a Truck</Text>
        <Text style={styles.subtitle}>Search the live TransConet marketplace for available transport capacity.</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Pickup location</Text>
          <TextInput style={styles.input} placeholder="e.g. Apapa, Lagos" placeholderTextColor="#98A2B3" value={origin} onChangeText={setOrigin} />
          <Text style={styles.label}>Delivery location</Text>
          <TextInput style={styles.input} placeholder="e.g. Abuja" placeholderTextColor="#98A2B3" value={destination} onChangeText={setDestination} />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={styles.button} onPress={searchMarketplace} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Search Marketplace</Text>}
          </Pressable>
        </View>

        {loads.map(load => (
          <View key={load.id} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{load.title || 'Cargo Freight'}</Text>
                <Text style={styles.meta}>{load.cargoType || 'GENERAL'} • {load.weightKg || 0} kg</Text>
              </View>
              {load.suggestedBudget != null && <Text style={styles.price}>₦{Number(load.suggestedBudget).toLocaleString()}</Text>}
            </View>
            <Text style={styles.routeLabel}>PICKUP</Text>
            <Text style={styles.route}>{load.origin}</Text>
            <Text style={styles.routeLabel}>DESTINATION</Text>
            <Text style={styles.route}>{load.destination}</Text>
            <View style={styles.verified}><Text style={styles.verifiedText}>AVAILABLE MARKETPLACE LOAD</Text></View>
          </View>
        ))}

        {!loading && loads.length === 0 && <View style={styles.empty}><Text style={styles.emptyTitle}>No marketplace results</Text><Text style={styles.emptyText}>Search for a pickup or destination to see live available records.</Text></View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 20, paddingBottom: 110 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#155EEF' },
  title: { marginTop: 7, fontSize: 30, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 8, marginBottom: 22, fontSize: 14, lineHeight: 21, color: '#667085' },
  formCard: { padding: 18, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  label: { marginBottom: 7, fontSize: 13, fontWeight: '800', color: '#344054' },
  input: { height: 52, marginBottom: 16, paddingHorizontal: 15, borderRadius: 13, borderWidth: 1, borderColor: '#D0D5DD', color: '#101828', fontSize: 15 },
  button: { height: 54, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#155EEF' },
  buttonText: { color: '#fff', fontWeight: '900' },
  error: { color: '#D92D20', fontSize: 12, marginBottom: 12 },
  card: { marginTop: 16, padding: 18, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitle: { fontSize: 17, fontWeight: '900', color: '#101828' },
  meta: { marginTop: 5, fontSize: 12, color: '#667085', fontWeight: '700' },
  price: { marginLeft: 10, fontSize: 16, fontWeight: '900', color: '#039855' },
  routeLabel: { marginTop: 16, fontSize: 9, fontWeight: '900', letterSpacing: 1, color: '#667085' },
  route: { marginTop: 3, fontSize: 14, fontWeight: '800', color: '#344054' },
  verified: { marginTop: 15, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: '#ECFDF3' },
  verifiedText: { fontSize: 9, fontWeight: '900', color: '#027A48' },
  empty: { marginTop: 18, padding: 24, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: '#0B1F44' },
  emptyText: { marginTop: 7, textAlign: 'center', color: '#667085', lineHeight: 19 },
});
