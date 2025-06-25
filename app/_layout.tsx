// File: app/_layout.tsx (The Final, Correct, Web SDK Version)

import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

// Import Expo's official auth tools
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Import the tools we need from the pure JS SDK
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithCredential, 
  User,
  getReactNativePersistence, 
  initializeAuth 
} from 'firebase/auth';
import firebaseConfig from '../firebaseConfig'; // Make sure this file exists with your config
import AsyncStorage from '@react-native-async-storage/async-storage';


// This tells the web browser to close automatically after login on mobile
WebBrowser.maybeCompleteAuthSession();

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// We initialize Auth with native storage persistence, which is required for the JS SDK on mobile
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // IMPORTANT: Make sure your Client IDs from your Google Cloud project are pasted here
    webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID_HERE',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bar Inventory</Text>
      <Button
        disabled={!request}
        title="Sign in with Google"
        onPress={() => {
          promptAsync();
        }}
      />
    </View>
  );
}


export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // If logged in, show the main app.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
