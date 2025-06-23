// File: app/_layout.tsx (The new gatekeeper)

import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

// Import our new Firebase and Google Sign-In tools
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// We configure Google Sign-In here. It will automatically use the details 
// from your google-services.json file.
GoogleSignin.configure();

function LoginScreen() {
  async function onGoogleButtonPress() {
    console.log("Login button pressed");
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the user's ID token
      const { idToken } = await GoogleSignin.signIn();
      console.log("Got ID Token from Google");

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error(error);
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
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    // You can return a loading spinner here if you want
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
    );
  }

  // If the user is not logged in, show the LoginScreen
  if (!user) {
    return <LoginScreen />;
  }

  // If the user is logged in, show the main app with the tabs
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