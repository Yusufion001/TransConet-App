import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLoginScreen({ navigation }) {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError(''); setBusy(true);
    try {
      const data = await login(email.trim(), password, mfaRequired ? otp.trim() : undefined);
      if (data.requireMfa) setMfaRequired(true);
      else navigation.replace('AdminMain');
    } catch (e) {
      setError(e?.response?.data?.error || 'Administrator authentication failed.');
    } finally { setBusy(false); }
  }

  return <View style={styles.screen}>
    <Text style={styles.eyebrow}>TRANSCONET ADMINISTRATION</Text>
    <Text style={styles.title}>{mfaRequired ? 'Verify administrator login' : 'Administrator sign in'}</Text>
    <Text style={styles.subtitle}>{mfaRequired ? 'Enter the 6-digit OTP sent by the existing admin security service.' : 'Use your existing TransConet administrator credentials.'}</Text>
    {!mfaRequired && <><Text style={styles.label}>Admin email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="admin@example.com"/><Text style={styles.label}>Password</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password"/></>}
    {mfaRequired && <><Text style={styles.label}>6-digit OTP</Text><TextInput style={styles.input} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="000000"/></>}
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Pressable style={styles.button} onPress={submit} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>{mfaRequired?'Verify & Continue':'Continue'}</Text>}</Pressable>
    <Pressable onPress={()=>navigation.goBack()}><Text style={styles.back}>Back to user sign in</Text></Pressable>
  </View>;
}

const styles=StyleSheet.create({screen:{flex:1,justifyContent:'center',padding:24,backgroundColor:'#071A33'},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.5,color:'#7DD3FC'},title:{marginTop:10,fontSize:29,fontWeight:'900',color:'#fff'},subtitle:{marginTop:8,marginBottom:24,fontSize:14,lineHeight:21,color:'#B8C7D9'},label:{marginTop:12,marginBottom:7,fontSize:12,fontWeight:'800',color:'#D7E2EF'},input:{height:53,borderRadius:12,borderWidth:1,borderColor:'#39506B',backgroundColor:'#102B49',paddingHorizontal:15,color:'#fff',fontSize:15},error:{marginTop:12,color:'#FDA29B',fontSize:12,fontWeight:'700'},button:{height:53,borderRadius:12,backgroundColor:'#155EEF',alignItems:'center',justifyContent:'center',marginTop:20},buttonText:{color:'#fff',fontWeight:'900',fontSize:14},back:{textAlign:'center',marginTop:22,color:'#98A2B3',fontWeight:'800'}});
