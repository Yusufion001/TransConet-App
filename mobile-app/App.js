import React from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView 
        source={{ uri: 'https://transconet.com' }} 
        style={{ flex: 1 }}
        allowsBackForwardNavigationGestures={true}
        geolocationEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
