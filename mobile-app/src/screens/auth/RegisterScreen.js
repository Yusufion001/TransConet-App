import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ onLogin }) {
  const { register } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true); setError('');
    try { await register(phoneNumber.trim(), pin.trim(), email.trim(), role); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>TransConet</Text>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Use the same account system as the TransConet web application.</Text>
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
      <TextInput style={styles.input} placeholder="Email (optional)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="6-digit PIN" keyboardType="number-pad" secureTextEntry value={pin} onChangeText={setPin} maxLength={6} />
      <View style={styles.roles}>
        <Pressable onPress={() => setRole('CUSTOMER')} style={[styles.role, role === 'CUSTOMER' && styles.roleActive]}><Text style={[styles.roleText, role === 'CUSTOMER' && styles.roleTextActive]}>Shipper</Text></Pressable>
        <Pressable onPress={() => setRole('TRANSPORTER')} style={[styles.role, role === 'TRANSPORTER' && styles.roleActive]}><Text style={[styles.roleText, role === 'TRANSPORTER' && styles.roleTextActive]}>Transporter</Text></Pressable>
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={submit} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}</Pressable>
      <Pressable onPress={onLogin} style={styles.link}><Text style={styles.linkText}>Already have an account? Sign in</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F6F8FB' },
  brand: { color: '#155EEF', fontSize: 16, fontWeight: '900', marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 8, marginBottom: 24, color: '#667085', lineHeight: 21 },
  input: { height: 54, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 13, paddingHorizontal: 16, marginBottom: 12, fontSize: 15 },
  roles: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  role: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#D0D5DD', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  roleActive: { backgroundColor: '#155EEF', borderColor: '#155EEF' },
  roleText: { fontWeight: '800', color: '#344054' },
  roleTextActive: { color: '#fff' },
  button: { height: 54, borderRadius: 13, backgroundColor: '#155EEF', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  error: { color: '#D92D20', fontSize: 12, marginBottom: 12 },
  link: { alignItems: 'center', marginTop: 22 },
  linkText: { color: '#155EEF', fontWeight: '800' },
});
