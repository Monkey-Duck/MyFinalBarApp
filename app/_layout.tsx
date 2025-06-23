// File: app/_layout.tsx (Using the Firebase Web SDK)

import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';

// Import from the new JS-only library and our config file
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';

// We still use this native module to get the Google Sign-In pop-up
import { GoogleSignin } from '@react-native-google-signin/google-signin';


// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();

GoogleSignin.configure();

function LoginScreen() {
  async function onGoogleButtonPress() {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(auth, googleCredential);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bar Inventory</Text>
      <Button
        title="Sign in with Google"
        onPress={onGoogleButtonPress}
      />
    </View>
  );
}

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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

  // If logged in, show the main app. We need to recreate the tab layout.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});