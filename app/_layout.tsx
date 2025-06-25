// File: app/_layout.tsx

import { Stack } from 'expo-router';
import 'react-native-reanimated';

// Import only the most basic Firebase tools
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebaseConfig';

// We initialize Firebase here once when the app loads.
try {
  initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully!");
} catch (error) {
  console.log("Firebase initialization error:", error);
}

export default function RootLayout() {
  // This layout now just shows our main (tabs) screen immediately.
  // We will add login logic back later using a method that works.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
