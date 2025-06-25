// File: app/_layout.tsx (Final Version using @react-native-firebase)

import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

// Import our new NATIVE Firebase and Google Sign-In tools
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// We need to configure Google Sign-in with the Web Client ID
// from our google-services.json file. You can also find this in your Google Cloud Console.
GoogleSignin.configure({
    webClientId: '853937397489-ijljjl3olgk90kvjnojfn3kl7s81vp0h.apps.googleusercontent.com',
});

function LoginScreen() {
  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the user's account information
      const { user } = await GoogleSignin.signIn();

      // --- THIS IS THE CORRECTED PART ---
      // The idToken is a property of the 'user' object
      const idToken = user.idToken;

      if (!idToken) {
        throw new Error("Google Sign-In failed to return an ID token.");
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
            console.log('User cancelled the login flow');
        } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
            console.log('Sign in is in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
            Alert.alert("Error", "Google Play Services is not available or outdated.");
        } else {
            // some other error happened
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
