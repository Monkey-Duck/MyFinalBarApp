// File: app/_layout.tsx (A simple test to see if Firebase initializes)

import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

// We only import the most basic Firebase functions
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebaseConfig';


// We will try to initialize Firebase right here when the app loads
try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  // If we see this message in the terminal, it's a huge success!
  console.log("Firebase Initialized Successfully on app load!");
} catch (error) {
  // If we see this, there is a problem with our firebaseConfig
  console.error("A critical error occurred during Firebase initialization:", error);
}


// This is a simple component that we will show on the screen
export default function TestScreen() {
  
  // The button doesn't do anything yet. We are only testing if the app loads.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Screen</Text>
      <Text style={styles.subtitle}>If you can see this text, the app loaded!</Text>
      <Button title="Sign in with Google" onPress={() => alert('Button works!')} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, color: 'gray'},
});