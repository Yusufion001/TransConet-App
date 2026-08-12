import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const ID_TYPES = ['NIN', 'BVN', 'DRIVERS_LICENSE', 'VOTER_ID'];

export default function KycScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [document, setDocument] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [idType, setIdType] = useState('NIN');
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadStatus = useCallback(async () => {
    try { const { data } = await api.get('/kyc/status'); setStatus(data); }
    catch (e) { setError(e?.response?.data?.error || 'Unable to load KYC status.'); }
  }, []);
  useFocusEffect(useCallback(() => { loadStatus(); }, [loadStatus]));

  async function pickImage(kind) {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError('Photo library permission is required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8, base64: true });
    if (!result.canceled && result.assets?.[0]) kind === 'document' ? setDocument(result.assets[0]) : setSelfie(result.assets[0]);
  }

  async function takeSelfie() {
    setError('');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { setError('Camera permission is required for biometric verification.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8, base64: true });
    if (!result.canceled && result.assets?.[0]) setSelfie(result.assets[0]);
  }

  async function uploadDocument() {
    if (!document?.base64) { setError('Select your identity document first.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const { data } = await api.post('/kyc/upload-document', { imageBase64: document.base64, mimeType: document.mimeType || 'image/jpeg', userFullName: user?.fullName || `${firstName} ${lastName}`.trim() });
      setMessage(data?.message || 'KYC document processed successfully.'); await loadStatus();
    } catch (e) { setError(e?.response?.data?.message || e?.response?.data?.error || 'KYC document submission failed.'); }
    finally { setBusy(false); }
  }

  async function verifyBiometrics() {
    if (!selfie?.base64 || !idNumber.trim()) { setError('A selfie and valid ID number are required.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const { data } = await api.post('/kyc/verify-biometrics', { selfie: selfie.base64, idType, idNumber: idNumber.trim(), country: 'NG', firstName: firstName.trim(), lastName: lastName.trim(), dob: dob.trim() });
      setMessage(data?.message || 'Biometric verification completed.'); await loadStatus();
    } catch (e) { setError(e?.response?.data?.error || 'Biometric verification failed.'); }
    finally { setBusy(false); }
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>IDENTITY VERIFICATION</Text><Text style={styles.title}>KYC Verification</Text><Text style={styles.subtitle}>Verify your TransConet identity using the existing document and biometric verification services.</Text>
    {status && <View style={styles.statusCard}><Text style={styles.statusTitle}>{status.verified ? '✓ Identity verified' : 'Verification pending'}</Text><Text style={styles.statusMeta}>{status.verificationLevel || 'LEVEL_1'} • {status.status || 'PENDING'}</Text>{!!status.notes && <Text style={styles.statusNotes}>{status.notes}</Text>}</View>}
    {!!error && <Text style={styles.error}>{error}</Text>}{!!message && <Text style={styles.message}>{message}</Text>}
    <View style={styles.card}><Text style={styles.sectionTitle}>Identity details</Text><Text style={styles.label}>ID type</Text><View style={styles.chips}>{ID_TYPES.map(type=><Pressable key={type} onPress={()=>setIdType(type)} style={[styles.chip,idType===type&&styles.chipActive]}><Text style={idType===type?styles.chipActiveText:styles.chipText}>{type.replace(/_/g,' ')}</Text></Pressable>)}</View><Text style={styles.label}>ID number</Text><TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber} placeholder={idType==='NIN'||idType==='BVN'?'11 digits':'ID number'} keyboardType={idType==='NIN'||idType==='BVN'?'number-pad':'default'}/><Text style={styles.label}>First name</Text><TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name"/><Text style={styles.label}>Last name</Text><TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name"/><Text style={styles.label}>Date of birth</Text><TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD"/></View>
    <View style={styles.card}><Text style={styles.sectionTitle}>Identity document</Text>{document?.uri?<Image source={{uri:document.uri}} style={styles.preview}/>:<Text style={styles.helper}>Upload a clear image of the identity document you are submitting.</Text>}<Pressable style={styles.secondary} onPress={()=>pickImage('document')}><Text style={styles.secondaryText}>{document?'Replace document':'Choose document'}</Text></Pressable><Pressable style={styles.button} onPress={uploadDocument} disabled={busy}><Text style={styles.buttonText}>{busy?'Processing…':'Submit document'}</Text></Pressable></View>
    <View style={styles.card}><Text style={styles.sectionTitle}>Biometric verification</Text>{selfie?.uri?<Image source={{uri:selfie.uri}} style={styles.selfie}/>:<Text style={styles.helper}>Take a clear selfie for identity-to-registry comparison.</Text>}<View style={styles.row}><Pressable style={[styles.secondary,styles.half]} onPress={takeSelfie}><Text style={styles.secondaryText}>Take selfie</Text></Pressable><Pressable style={[styles.secondary,styles.half]} onPress={()=>pickImage('selfie')}><Text style={styles.secondaryText}>Choose photo</Text></Pressable></View><Pressable style={styles.button} onPress={verifyBiometrics} disabled={busy}><Text style={styles.buttonText}>{busy?'Verifying…':'Verify identity'}</Text></Pressable></View>
    {busy&&<ActivityIndicator size="small" color="#4169E1" style={{marginTop:6}}/>}<Pressable style={styles.close} onPress={()=>Alert.alert('KYC','KYC status is saved to your TransConet account.')}><Text style={styles.closeText}>KYC status is saved to your TransConet account</Text></Pressable>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#F6F8FB'},content:{padding:20,paddingBottom:120},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:1.4,color:'#4169E1'},title:{marginTop:6,fontSize:30,fontWeight:'900',color:'#0B1F44'},subtitle:{marginTop:8,marginBottom:18,fontSize:14,lineHeight:21,color:'#667085'},statusCard:{padding:16,borderRadius:16,backgroundColor:'#ECFDF3',borderWidth:1,borderColor:'#A6F4C5',marginBottom:14},statusTitle:{fontSize:16,fontWeight:'900',color:'#027A48'},statusMeta:{marginTop:4,fontSize:11,fontWeight:'800',color:'#475467'},statusNotes:{marginTop:7,fontSize:11,lineHeight:17,color:'#667085'},error:{marginBottom:14,padding:12,borderRadius:12,backgroundColor:'#FEF3F2',color:'#B42318',fontSize:12,fontWeight:'700'},message:{marginBottom:14,padding:12,borderRadius:12,backgroundColor:'#ECFDF3',color:'#027A48',fontSize:12,fontWeight:'700'},card:{padding:18,borderRadius:20,backgroundColor:'#fff',borderWidth:1,borderColor:'#EAECF0',marginBottom:14},sectionTitle:{fontSize:16,fontWeight:'900',color:'#101828'},label:{marginTop:12,marginBottom:7,fontSize:12,fontWeight:'800',color:'#344054'},input:{height:50,borderRadius:12,borderWidth:1,borderColor:'#D0D5DD',backgroundColor:'#fff',paddingHorizontal:14,fontSize:15,color:'#101828'},chips:{flexDirection:'row',flexWrap:'wrap',gap:7},chip:{paddingHorizontal:10,paddingVertical:9,borderRadius:10,borderWidth:1,borderColor:'#D0D5DD'},chipActive:{backgroundColor:'#4169E1',borderColor:'#4169E1'},chipText:{fontSize:10,fontWeight:'800',color:'#475467'},chipActiveText:{fontSize:10,fontWeight:'800',color:'#fff'},helper:{fontSize:12,lineHeight:18,color:'#667085',marginTop:8},preview:{width:'100%',height:180,borderRadius:14,marginTop:12,resizeMode:'cover'},selfie:{width:150,height:150,borderRadius:75,alignSelf:'center',marginTop:14},button:{height:50,borderRadius:12,backgroundColor:'#4169E1',alignItems:'center',justifyContent:'center',marginTop:12},buttonText:{color:'#fff',fontSize:13,fontWeight:'900'},secondary:{height:48,borderRadius:12,borderWidth:1,borderColor:'#4169E1',alignItems:'center',justifyContent:'center',marginTop:12},secondaryText:{color:'#4169E1',fontSize:12,fontWeight:'900'},row:{flexDirection:'row',gap:8},half:{flex:1},close:{paddingVertical:16,alignItems:'center'},closeText:{fontSize:11,color:'#98A2B3',fontWeight:'700'}});