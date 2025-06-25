// File: app/_layout.tsx (Final Version with Persistence)

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
  initializeAuth // We need this special function
} from 'firebase/auth';
// THIS is the special import for native storage that we need
import { getReactNativePersistence } from 'firebase/auth/react-native';

import firebaseConfig from '../firebaseConfig'; // Your Firebase config file
import AsyncStorage from '@react-native-async-storage/async-storage';


// This tells the web browser to close automatically after login on mobile
WebBrowser.maybeCompleteAuthSession();

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// THIS IS THE CRUCIAL CHANGE: We initialize Auth with native storage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // PASTE YOUR CLIENT IDs HERE
    webClientId: '853937397489-ijljjl3olgk90kvjnojfn3kl7s81vp0h.apps.googleusercontent.com',
    androidClientId: '853937397489-pgb8h8tgsr9hq536jijlq55r4dfvl466.apps.googleusercontent.com',
  });

  // This effect runs when Google redirects back to the app after login
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      // Use the credential to sign into Firebase
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
          promptAsync(); // This opens the Google Sign-in pop-up
        }}
      />
    </View>
  );
}


export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // This listener checks if the user is logged in or out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });
    return unsubscribe; // Cleanup the listener
  }, []);

  if (initializing) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
    );
  }

  // If there is no user, show the LoginScreen
  if (!user) {
    return <LoginScreen />;
  }

  // If there IS a user, show the main app with the tabs!
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
