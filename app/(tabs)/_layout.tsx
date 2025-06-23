// File: app/_layout.tsx (The Final Native Firebase Auth Code)

import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

// Import our NATIVE Firebase and Google Sign-In tools
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// We need to configure Google Sign-In with the Web Client ID
// from our google-services.json file.
GoogleSignin.configure({
  // This is a default value that often works, but we may need to find your specific one if it fails.
  webClientId: 'YOUR_WEB_CLIENT_ID_IF_NEEDED', 
});

function LoginScreen() {
  async function onGoogleButtonPress() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error("Native Google Sign-In Error:", error);
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