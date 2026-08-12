import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [phoneNumber,setPhoneNumber]=useState(''); const [email,setEmail]=useState(''); const [fullName,setFullName]=useState(''); const [pin,setPin]=useState(''); const [role,setRole]=useState('CUSTOMER'); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function submit(){
    setMessage(''); if(!phoneNumber.trim()||pin.length<6){setMessage('Phone number and a 6-digit PIN are required.');return;} setBusy(true);
    try { await register({phoneNumber:phoneNumber.trim(),email:email.trim(),fullName:fullName.trim(),pin,role}); }
    catch(e){setMessage(e?.response?.data?.error||'Registration failed.');} finally{setBusy(false);}
  }
  return <View style={styles.screen}>
    <Text style={styles.title}>Create account</Text><Text style={styles.subtitle}>Join the TransConet transport network.</Text>
    <Text style={styles.label}>Full name</Text><TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your full name" />
    <Text style={styles.label}>Phone number</Text><TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="08012345678" keyboardType="phone-pad" />
    <Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
    <Text style={styles.label}>Account type</Text><View style={styles.roles}><Pressable style={[styles.role,role==='CUSTOMER'&&styles.roleActive]} onPress={()=>setRole('CUSTOMER')}><Text style={role==='CUSTOMER'?styles.roleTextActive:styles.roleText}>Shipper</Text></Pressable><Pressable style={[styles.role,role==='TRANSPORTER'&&styles.roleActive]} onPress={()=>setRole('TRANSPORTER')}><Text style={role==='TRANSPORTER'?styles.roleTextActive:styles.roleText}>Transporter</Text></Pressable></View>
    <Text style={styles.label}>6-digit PIN</Text><TextInput style={styles.input} value={pin} onChangeText={setPin} placeholder="••••••" secureTextEntry keyboardType="number-pad" maxLength={6} />
    {!!message&&<Text style={styles.error}>{message}</Text>}
    <Pressable style={styles.button} onPress={submit} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>Create account</Text>}</Pressable>
  </View>;
}
const styles=StyleSheet.create({screen:{flex:1,padding:24,justifyContent:'center',backgroundColor:'#F6F8FB'},title:{fontSize:30,fontWeight:'900',color:'#0B1F44'},subtitle:{marginTop:7,marginBottom:18,fontSize:15,color:'#667085'},label:{marginBottom:7,marginTop:10,fontSize:13,fontWeight:'800',color:'#344054'},input:{height:50,borderRadius:12,borderWidth:1,borderColor:'#D0D5DD',backgroundColor:'#fff',paddingHorizontal:15,fontSize:15},roles:{flexDirection:'row',gap:8},role:{flex:1,height:48,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderWidth:1,borderColor:'#D0D5DD'},roleActive:{backgroundColor:'#4169E1',borderColor:'#4169E1'},roleText:{fontWeight:'800',color:'#475467'},roleTextActive:{fontWeight:'800',color:'#fff'},error:{marginTop:10,color:'#D92D20',fontSize:13},button:{height:52,borderRadius:12,backgroundColor:'#4169E1',alignItems:'center',justifyContent:'center',marginTop:18},buttonText:{color:'#fff',fontWeight:'900',fontSize:15}});
