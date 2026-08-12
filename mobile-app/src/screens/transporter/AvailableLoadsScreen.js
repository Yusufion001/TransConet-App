import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

export default function AvailableLoadsScreen() {
  const [loads, setLoads] = useState([]);
  const [busy, setBusy] = useState(true);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadMarketplace = useCallback(async () => {
    setBusy(true);
    try {
      const { data } = await api.get('/loads');
      setLoads(Array.isArray(data) ? data : []);
      setMessage('');
    } catch (e) {
      setMessage(e?.response?.data?.error || 'Unable to load available shipments.');
    } finally {
      setBusy(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadMarketplace(); }, [loadMarketplace]));

  const submitBid = async () => {
    if (!selected || !amount || Number(amount) <= 0) {
      setMessage('Enter a valid offer amount.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bids/submit', {
        loadId: selected.id,
        amount: Number(amount),
        notes: notes.trim() || undefined,
      });
      setMessage('Offer submitted successfully.');
      setSelected(null);
      setAmount('');
      setNotes('');
    } catch (e) {
      setMessage(e?.response?.data?.error || 'Failed to submit offer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>TRANSPORTER</Text>
      <Text style={styles.title}>Available Loads</Text>
      <Text style={styles.subtitle}>Live cargo postings available for transporter bids.</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {busy ? <ActivityIndicator size="large" color="#155EEF" /> : loads.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyTitle}>No available loads</Text><Text style={styles.emptyText}>New shipper postings will appear here.</Text></View>
      ) : loads.map((load) => (
        <Pressable key={load.id} style={styles.card} onPress={() => { setSelected(load); setMessage(''); }}>
          <View style={styles.row}>
            <Text style={styles.loadTitle}>{load.title || 'Cargo Freight'}</Text>
            <Text style={styles.budget}>₦{Number(load.suggestedBudget || 0).toLocaleString()}</Text>
          </View>
          <Text style={styles.route}>{load.origin} → {load.destination}</Text>
          <Text style={styles.meta}>{load.cargoType || 'GENERAL'} · {Number(load.weightKg || 0).toLocaleString()} kg</Text>
          <Text style={styles.action}>Make an offer</Text>
        </Pressable>
      ))}

      {selected ? (
        <View style={styles.offerCard}>
          <Text style={styles.offerTitle}>Offer for {selected.title || 'Cargo Freight'}</Text>
          <Text style={styles.label}>Your offer (₦)</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Enter amount" placeholderTextColor="#98A2B3" style={styles.input} />
          <Text style={styles.label}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Optional message to shipper" placeholderTextColor="#98A2B3" style={[styles.input, styles.notes]} multiline />
          <View style={styles.buttons}>
            <Pressable style={styles.cancel} onPress={() => setSelected(null)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable style={styles.submit} onPress={submitBid} disabled={submitting}><Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit Offer'}</Text></Pressable>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 20, paddingBottom: 110 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#155EEF' },
  title: { marginTop: 6, fontSize: 30, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 7, marginBottom: 18, fontSize: 14, lineHeight: 21, color: '#667085' },
  message: { marginBottom: 12, color: '#155EEF', fontSize: 13, fontWeight: '700' },
  empty: { padding: 24, borderRadius: 20, backgroundColor: '#fff' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0B1F44' },
  emptyText: { marginTop: 6, color: '#667085' },
  card: { marginBottom: 12, padding: 17, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  loadTitle: { flex: 1, fontSize: 16, fontWeight: '900', color: '#0B1F44' },
  budget: { fontSize: 14, fontWeight: '900', color: '#155EEF' },
  route: { marginTop: 10, fontSize: 14, fontWeight: '700', color: '#344054' },
  meta: { marginTop: 6, fontSize: 12, color: '#667085' },
  action: { marginTop: 12, fontSize: 12, fontWeight: '900', color: '#155EEF' },
  offerCard: { marginTop: 6, padding: 18, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D0D5DD' },
  offerTitle: { fontSize: 18, fontWeight: '900', color: '#0B1F44', marginBottom: 16 },
  label: { marginBottom: 7, fontSize: 12, fontWeight: '800', color: '#344054' },
  input: { height: 50, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 12, paddingHorizontal: 14, color: '#101828', marginBottom: 14, backgroundColor: '#fff' },
  notes: { height: 80, paddingTop: 13, textAlignVertical: 'top' },
  buttons: { flexDirection: 'row', gap: 10 },
  cancel: { flex: 1, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F4F7' },
  cancelText: { fontWeight: '800', color: '#344054' },
  submit: { flex: 1, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#155EEF' },
  submitText: { fontWeight: '900', color: '#fff' },
});
