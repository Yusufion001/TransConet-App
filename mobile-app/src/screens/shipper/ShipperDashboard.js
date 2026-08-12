import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ShipperDashboard() {
  const { user, logout } = useAuth();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>SHIPPER WORKSPACE</Text>
      <Text style={styles.title}>Operations Hub</Text>
      <Text style={styles.subtitle}>Everything you need to post cargo, find verified transport, manage shipments and track deliveries.</Text>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Move cargo forward</Text>
        <Text style={styles.heroText}>Find verified transport capacity or post your next shipment.</Text>
      </View>

      <Text style={styles.section}>Quick actions</Text>
      <View style={styles.grid}>
        <Action title="Find Truck" text="Find verified transport capacity." />
        <Action title="Post Cargo" text="Create a live shipment request." />
        <Action title="My Shipments" text="View your cargo and bids." />
        <Action title="Track Shipment" text="Track a waybill or trip." />
      </View>

      <View style={styles.account}>
        <Text style={styles.accountTitle}>Account</Text>
        <Text style={styles.accountText}>{user?.phoneNumber || user?.email}</Text>
        <Pressable onPress={logout}><Text style={styles.logout}>Sign out</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function Action({ title, text }) {
  return <View style={styles.action}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 20, paddingBottom: 110 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#155EEF' },
  title: { marginTop: 7, fontSize: 30, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 8, color: '#667085', lineHeight: 21 },
  hero: { marginTop: 22, padding: 20, minHeight: 150, justifyContent: 'flex-end', borderRadius: 24, backgroundColor: '#0B1F44' },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900' },
  heroText: { marginTop: 7, color: '#D6E4FF', lineHeight: 20 },
  section: { marginTop: 25, marginBottom: 11, fontSize: 18, fontWeight: '900', color: '#0B1F44' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { width: '48%', minHeight: 110, padding: 15, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAECF0' },
  actionTitle: { fontSize: 14, fontWeight: '900', color: '#101828' },
  actionText: { marginTop: 7, fontSize: 11, lineHeight: 16, color: '#667085' },
  account: { marginTop: 22, padding: 17, borderRadius: 17, backgroundColor: '#fff' },
  accountTitle: { fontWeight: '900', color: '#0B1F44' },
  accountText: { marginTop: 5, color: '#667085' },
  logout: { marginTop: 12, color: '#D92D20', fontWeight: '800' },
});
