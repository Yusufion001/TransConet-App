import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';

const TYPES = ['HEAVY_DUTY', 'PICKUP', 'TRICYCLE', 'COMMERCIAL_CAR'];
const TABS = ['Overview', 'Fleet', 'Loads'];

export default function FleetScreen({ navigation }) {
  const [tab, setTab] = useState('Overview');
  const [vehicles, setVehicles] = useState([]);
  const [bids, setBids] = useState([]);
  const [busy, setBusy] = useState(true);
  const [brand, setBrand] = useState('');
  const [plate, setPlate] = useState('');
  const [tons, setTons] = useState('');
  const [type, setType] = useState('HEAVY_DUTY');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [fleetRes, bidsRes] = await Promise.all([
        api.get('/fleet/carrier-fleet'),
        api.get('/bids/my-bids'),
      ]);
      setVehicles(Array.isArray(fleetRes.data) ? fleetRes.data : []);
      setBids(Array.isArray(bidsRes.data) ? bidsRes.data : []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to synchronize fleet operations.');
    } finally {
      setBusy(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  async function addVehicle() {
    if (!brand.trim() || !plate.trim() || Number(tons) <= 0) {
      setError('Brand, plate number and a positive capacity are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.post('/fleet/register', {
        brand: brand.trim(),
        plateNumber: plate.trim().toUpperCase(),
        capacityTons: Number(tons),
        vehicleType: type,
      });
      setBrand('');
      setPlate('');
      setTons('');
      Alert.alert('Vehicle registered', 'The vehicle was submitted for administrative verification.');
      await refresh();
      setTab('Fleet');
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to register vehicle.');
    } finally {
      setBusy(false);
    }
  }

  const verified = vehicles.filter(v => v.isVerified || v.status === 'AVAILABLE').length;
  const pending = vehicles.length - verified;
  const capacity = vehicles.reduce((sum, v) => sum + Number(v.capacityTons || 0), 0);
  const activeLoads = bids.filter(b => ['ACCEPTED', 'QUOTE_ACCEPTED', 'TRANSIT_ONGOING'].includes(b.load?.status)).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>TRANSPORTER WORKSPACE</Text>
      <Text style={styles.title}>Fleet Operations</Text>
      <Text style={styles.sub}>Live fleet, vehicle verification and your negotiated loads.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map(item => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}>
            <Text style={tab === item ? styles.tabActiveText : styles.tabText}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {busy && !vehicles.length && !bids.length ? <ActivityIndicator size="large" color="#4169E1" /> : null}

      {tab === 'Overview' && (
        <View>
          <View style={styles.metrics}>
            <Metric label="Fleet size" value={vehicles.length} />
            <Metric label="Verified" value={verified} />
            <Metric label="Pending" value={pending} />
            <Metric label="Capacity" value={`${capacity}t`} />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Operations</Text>
            <Row label="Active negotiated loads" value={activeLoads} />
            <Row label="Total bids" value={bids.length} />
            <Row label="Vehicles requiring verification" value={pending} />
          </View>
          <Pressable style={styles.button} onPress={() => setTab('Fleet')}>
            <Text style={styles.buttonText}>Manage Fleet</Text>
          </Pressable>
        </View>
      )}

      {tab === 'Fleet' && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Register vehicle</Text>
            <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Manufacturer / brand" placeholderTextColor="#98A2B3" />
            <TextInput style={styles.input} value={plate} onChangeText={setPlate} autoCapitalize="characters" placeholder="License plate" placeholderTextColor="#98A2B3" />
            <TextInput style={styles.input} value={tons} onChangeText={setTons} keyboardType="numeric" placeholder="Capacity in tons" placeholderTextColor="#98A2B3" />
            <View style={styles.types}>
              {TYPES.map(item => (
                <Pressable key={item} onPress={() => setType(item)} style={[styles.type, type === item && styles.typeActive]}>
                  <Text style={type === item ? styles.typeActiveText : styles.typeText}>{item.replace('_', ' ')}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.button} onPress={addVehicle} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register Vehicle</Text>}
            </Pressable>
          </View>

          {vehicles.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyTitle}>No vehicles registered</Text></View>
          ) : vehicles.map(vehicle => (
            <View style={styles.vehicle} key={vehicle.id}>
              <View style={styles.vehicleTop}>
                <Text style={styles.vehicleTitle}>{vehicle.brand || 'Vehicle'}</Text>
                <Text style={vehicle.isVerified ? styles.verified : styles.pending}>
                  {vehicle.isVerified ? 'VERIFIED' : 'PENDING'}
                </Text>
              </View>
              <Text style={styles.meta}>{vehicle.plateNumber || vehicle.licensePlate || '—'}</Text>
              <Text style={styles.meta}>{vehicle.vehicleType || '—'} • {vehicle.capacityTons || 0} tons</Text>
              {vehicle.status ? <Text style={styles.meta}>Status: {vehicle.status}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {tab === 'Loads' && (
        <View>
          {bids.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No negotiated loads</Text>
              <Text style={styles.emptyText}>Your real bids will appear here after you submit offers from Jobs.</Text>
            </View>
          ) : bids.map(bid => (
            <View style={styles.card} key={bid.id}>
              <Text style={styles.price}>₦{Number(bid.amount || 0).toLocaleString()}</Text>
              <Text style={styles.status}>{String(bid.status || 'PENDING').replace(/_/g, ' ')}</Text>
              <Text style={styles.cardTitle}>{bid.load?.title || 'Cargo shipment'}</Text>
              {bid.load?.origin ? <Text style={styles.route}>{bid.load.origin} → {bid.load.destination}</Text> : null}
              {bid.load?.id && bid.status === 'ACCEPTED' ? (
                <Pressable style={styles.secondary} onPress={() => navigation.getParent()?.navigate('Tracking', { loadId: bid.load.id })}>
                  <Text style={styles.secondaryText}>Track shipment</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function Row({ label, value }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 20, paddingBottom: 120 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#155EEF' },
  title: { marginTop: 6, fontSize: 29, fontWeight: '900', color: '#0B1F44' },
  sub: { marginTop: 7, marginBottom: 15, fontSize: 13, lineHeight: 20, color: '#667085' },
  tabs: { gap: 7, paddingBottom: 14 },
  tab: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#D0D5DD', backgroundColor: '#fff' },
  tabActive: { backgroundColor: '#101828', borderColor: '#101828' },
  tabText: { fontSize: 11, fontWeight: '800', color: '#667085' },
  tabActiveText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  error: { marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: '#FEF3F2', color: '#B42318', fontSize: 12, fontWeight: '700' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 14 },
  metric: { width: '48%', minHeight: 84, padding: 14, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  metricLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', color: '#98A2B3' },
  metricValue: { marginTop: 9, fontSize: 23, fontWeight: '900', color: '#155EEF' },
  card: { padding: 17, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0', marginBottom: 12 },
  cardTitle: { marginTop: 5, fontSize: 16, fontWeight: '900', color: '#101828' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F2F4F7' },
  rowLabel: { fontSize: 12, color: '#667085' },
  rowValue: { fontSize: 13, fontWeight: '900', color: '#101828' },
  input: { height: 50, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 12, paddingHorizontal: 14, marginTop: 9, backgroundColor: '#fff', color: '#101828' },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  type: { paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 10 },
  typeActive: { backgroundColor: '#4169E1', borderColor: '#4169E1' },
  typeText: { fontSize: 10, fontWeight: '800', color: '#475467' },
  typeActiveText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  button: { height: 50, borderRadius: 12, backgroundColor: '#4169E1', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  secondary: { height: 46, borderRadius: 11, borderWidth: 1, borderColor: '#4169E1', alignItems: 'center', justifyContent: 'center', marginTop: 13 },
  secondaryText: { color: '#4169E1', fontWeight: '900', fontSize: 12 },
  empty: { padding: 24, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#EAECF0' },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: '#0B1F44' },
  emptyText: { marginTop: 7, textAlign: 'center', color: '#667085', fontSize: 12, lineHeight: 18 },
  vehicle: { padding: 16, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0', marginBottom: 10 },
  vehicleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleTitle: { fontSize: 16, fontWeight: '900', color: '#101828' },
  meta: { marginTop: 5, fontSize: 11, color: '#667085', fontWeight: '700' },
  verified: { fontSize: 9, fontWeight: '900', color: '#027A48' },
  pending: { fontSize: 9, fontWeight: '900', color: '#B54708' },
  price: { fontSize: 20, fontWeight: '900', color: '#039855' },
  status: { marginTop: 4, fontSize: 10, fontWeight: '900', color: '#155EEF' },
  route: { marginTop: 8, fontSize: 12, color: '#667085' },
});