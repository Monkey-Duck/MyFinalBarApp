// File: app/_layout.tsx (Final Corrected Version using getTokens)

import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

// Import our NATIVE Firebase and Google Sign-In tools
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// We need to configure Google Sign-in with the Web Client ID
// This ID comes from your Google Cloud Console.
GoogleSignin.configure({
    webClientId: '853937397489-ijljjl3olgk90kvjnojfn3kl7s81vp0h.apps.googleusercontent.com',
});

function LoginScreen() {
  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Step 1: Complete the sign-in flow
      await GoogleSignin.signIn();
      
      // Step 2: Explicitly get the tokens after sign-in
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) {
        throw new Error("Google Sign-In failed to return an ID token.");
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('User cancelled the login flow');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            Alert.alert("Sign in is already in progress.");
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            Alert.alert("Error", "Google Play Services is not available or outdated.");
        } else {
            console.error("Native Google Sign-In Error:", error);
            Alert.alert("Login Error", "An unexpected error occurred during sign-in.");
        }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bar Inventory</Text>
      <Button
        title="Sign in with Google"
        onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
      />
    </View>
  );
}

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; 
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

  // If the user is logged in, show the main app with the tabs.
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
