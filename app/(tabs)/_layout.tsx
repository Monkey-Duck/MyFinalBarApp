// The Final Version: Using Expo Auth Session + Firebase Web SDK

import React, { useState, useEffect } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

// Import Expo's official auth tools
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Import from the JS-only Firebase library and our config file
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';


// This tells the web browser to close automatically after login on mobile
WebBrowser.maybeCompleteAuthSession();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


function LoginScreen() {
  // We use Expo's official 'useAuthRequest' hook to manage the login flow
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // You need to get these IDs from your Google Cloud Console
    // Go to https://console.cloud.google.com/apis/credentials
    // Find your Web Client ID for the webClientId.
    // Create a new "Android" credential and get the client ID for androidClientId.
    webClientId: "853937397489-ijljjl3olgk90kvjnojfn3kl7s81vp0h.apps.googleusercontent.com",
    androidClientId: "853937397489-pgb8h8tgsr9hq536jijlq55r4dfvl466.apps.googleusercontent.com",
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

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  // Here, you would typically have a loading state, but we'll keep it simple
  // If we have a user, show the app, otherwise show the login button
  return user ? (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  ) : (
    <LoginScreen />
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});