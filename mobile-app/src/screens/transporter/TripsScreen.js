import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

export default function TripsScreen({ navigation }) {
  const [bids, setBids] = useState([]);
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true); else setBusy(true);
    try {
      const { data } = await api.get('/bids/my-bids');
      setBids(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load trips and bids.');
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const active = bids.filter((b) => b.status === 'ACCEPTED');
  const pending = bids.filter((b) => b.status === 'PENDING');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(true)} tintColor="#155EEF" />}
    >
      <Text style={styles.eyebrow}>TRANSPORTER</Text>
      <Text style={styles.title}>Active Trips</Text>
      <Text style={styles.subtitle}>Manage accepted deliveries and your current negotiation offers.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {busy ? <ActivityIndicator size="large" color="#155EEF" style={styles.loader} /> : null}

      <Text style={styles.sectionTitle}>Accepted deliveries</Text>
      {!busy && active.length === 0 ? (
        <Empty title="No active trips" text="Accepted transporter assignments will appear here." />
      ) : active.map((bid) => (
        <View style={styles.card} key={bid.id}>
          <View style={styles.row}><Text style={styles.status}>ACCEPTED</Text><Text style={styles.amount}>₦{Number(bid.amount || 0).toLocaleString()}</Text></View>
          <Text style={styles.cardTitle}>{bid.load?.title || 'Cargo shipment'}</Text>
          <Text style={styles.route}>{bid.load?.origin || 'Pickup'} → {bid.load?.destination || 'Destination'}</Text>
          {bid.load?.id ? <Pressable style={styles.button} onPress={() => navigation.getParent()?.navigate('Tracking', { loadId: bid.load.id })}><Text style={styles.buttonText}>Track delivery</Text></Pressable> : null}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Pending offers</Text>
      {!busy && pending.length === 0 ? (
        <Empty title="No pending offers" text="Offers submitted from Find Loads will appear here." />
      ) : pending.map((bid) => (
        <View style={styles.card} key={bid.id}>
          <View style={styles.row}><Text style={styles.pending}>PENDING</Text><Text style={styles.amount}>₦{Number(bid.amount || 0).toLocaleString()}</Text></View>
          <Text style={styles.cardTitle}>{bid.load?.title || 'Cargo shipment'}</Text>
          <Text style={styles.route}>{bid.load?.origin || 'Pickup'} → {bid.load?.destination || 'Destination'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Empty({ title, text }) {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 20, paddingBottom: 110 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#155EEF' },
  title: { marginTop: 6, fontSize: 30, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 7, marginBottom: 18, fontSize: 14, lineHeight: 21, color: '#667085' },
  loader: { marginVertical: 14 },
  error: { marginBottom: 12, color: '#B42318', fontSize: 12, fontWeight: '700' },
  sectionTitle: { marginTop: 8, marginBottom: 10, fontSize: 18, fontWeight: '900', color: '#101828' },
  card: { marginBottom: 12, padding: 17, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { fontSize: 10, fontWeight: '900', color: '#039855' },
  pending: { fontSize: 10, fontWeight: '900', color: '#155EEF' },
  amount: { fontSize: 17, fontWeight: '900', color: '#101828' },
  cardTitle: { marginTop: 10, fontSize: 14, fontWeight: '900', color: '#344054' },
  route: { marginTop: 6, fontSize: 12, lineHeight: 18, color: '#667085' },
  button: { height: 46, marginTop: 14, borderRadius: 11, backgroundColor: '#155EEF', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  empty: { marginBottom: 16, padding: 20, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  emptyTitle: { fontSize: 15, fontWeight: '900', color: '#101828' },
  emptyText: { marginTop: 5, fontSize: 12, lineHeight: 18, color: '#667085' },
});
