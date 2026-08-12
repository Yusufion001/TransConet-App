import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import adminApi from '../../api/adminClient';

function renderValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export default function AdminModuleScreen({ route, navigation }) {
  const { name, path } = route.params;
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setBusy(true); setError('');
    try { const response = await adminApi.get(path); setData(response.data); }
    catch (e) { setError(e?.response?.data?.error || `Unable to load ${name}.`); }
    finally { setBusy(false); }
  }, [name, path]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return <View style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={()=>navigation.goBack()}><Text style={styles.back}>‹ Administration</Text></Pressable>
    <Text style={styles.eyebrow}>ADMIN MODULE</Text><Text style={styles.title}>{name}</Text><Text style={styles.endpoint}>{path}</Text>
    <Pressable style={styles.refresh} onPress={load}><Text style={styles.refreshText}>Refresh live data</Text></Pressable>
    {busy ? <ActivityIndicator size="large" color="#155EEF" style={{marginTop:30}}/> : error ? <View style={styles.errorCard}><Text style={styles.error}>{error}</Text><Text style={styles.hint}>The existing admin authorization layer rejected or could not load this module.</Text></View> : <View style={styles.dataCard}>
      <Text style={styles.dataTitle}>Live response</Text><Text selectable style={styles.data}>{renderValue(data)}</Text>
    </View>}
  </ScrollView></View>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#F6F8FB'},content:{padding:20,paddingBottom:110},back:{fontSize:13,fontWeight:'900',color:'#155EEF',marginBottom:22},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.4,color:'#98A2B3'},title:{marginTop:6,fontSize:29,fontWeight:'900',color:'#0B1F44'},endpoint:{marginTop:5,fontSize:11,color:'#667085'},refresh:{alignSelf:'flex-start',marginTop:16,paddingHorizontal:13,paddingVertical:10,borderRadius:10,backgroundColor:'#155EEF'},refreshText:{color:'#fff',fontSize:11,fontWeight:'900'},dataCard:{marginTop:18,padding:16,borderRadius:18,backgroundColor:'#fff',borderWidth:1,borderColor:'#EAECF0'},dataTitle:{fontSize:14,fontWeight:'900',color:'#101828',marginBottom:10},data:{fontSize:11,lineHeight:18,color:'#344054'},errorCard:{marginTop:20,padding:16,borderRadius:16,backgroundColor:'#FEF3F2',borderWidth:1,borderColor:'#FECDCA'},error:{fontSize:13,fontWeight:'800',color:'#B42318'},hint:{marginTop:7,fontSize:11,lineHeight:17,color:'#667085'}});
