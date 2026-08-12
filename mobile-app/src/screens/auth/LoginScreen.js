import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ onRegister }) {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true); setError('');
    try { await login(phoneNumber.trim(), pin.trim()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>TransConet</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to manage your cargo and transport operations.</Text>
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
      <TextInput style={styles.input} placeholder="6-digit PIN" keyboardType="number-pad" secureTextEntry value={pin} onChangeText={setPin} maxLength={6} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </Pressable>
      <Pressable onPress={onRegister} style={styles.link}><Text style={styles.linkText}>Create a TransConet account</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F6F8FB' },
  brand: { color: '#155EEF', fontSize: 16, fontWeight: '900', marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '900', color: '#0B1F44' },
  subtitle: { marginTop: 8, marginBottom: 28, color: '#667085', lineHeight: 21 },
  input: { height: 54, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 13, paddingHorizontal: 16, marginBottom: 14, fontSize: 15 },
  button: { height: 54, borderRadius: 13, backgroundColor: '#155EEF', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  error: { color: '#D92D20', fontSize: 12, marginBottom: 12 },
  link: { alignItems: 'center', marginTop: 22 },
  linkText: { color: '#155EEF', fontWeight: '800' },
});
