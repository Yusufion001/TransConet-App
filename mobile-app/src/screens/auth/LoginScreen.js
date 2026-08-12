import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    if (!phoneNumber.trim() || pin.length < 6) {
      setError('Enter your phone number and 6-digit PIN.');
      return;
    }
    setBusy(true);
    try { await login(phoneNumber.trim(), pin); }
    catch (e) { setError(e?.response?.data?.error || 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.logo}><Text style={styles.logoText}>TC</Text></View>
      <Text style={styles.brand}>TransConet</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your TransConet account.</Text>
      <Text style={styles.label}>Phone number</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="08012345678" keyboardType="phone-pad" />
      <Text style={styles.label}>6-digit PIN</Text>
      <TextInput style={styles.input} value={pin} onChangeText={setPin} placeholder="••••••" secureTextEntry keyboardType="number-pad" maxLength={6} />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Create an account</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,padding:24,justifyContent:'center',backgroundColor:'#F6F8FB'},
  logo:{width:58,height:58,borderRadius:18,backgroundColor:'#4169E1',alignItems:'center',justifyContent:'center',alignSelf:'center'},
  logoText:{color:'#fff',fontSize:22,fontWeight:'900'}, brand:{textAlign:'center',marginTop:10,fontSize:16,fontWeight:'800',color:'#4169E1'},
  title:{marginTop:34,fontSize:30,fontWeight:'900',color:'#0B1F44'},subtitle:{marginTop:8,marginBottom:28,fontSize:15,color:'#667085'},
  label:{marginBottom:7,marginTop:12,fontSize:13,fontWeight:'800',color:'#344054'},input:{height:54,borderRadius:13,borderWidth:1,borderColor:'#D0D5DD',backgroundColor:'#fff',paddingHorizontal:16,fontSize:16,color:'#101828'},
  error:{marginTop:10,color:'#D92D20',fontSize:13},button:{height:54,borderRadius:13,backgroundColor:'#4169E1',alignItems:'center',justifyContent:'center',marginTop:20},buttonText:{color:'#fff',fontSize:15,fontWeight:'900'},link:{textAlign:'center',marginTop:22,color:'#4169E1',fontWeight:'800'}
});
