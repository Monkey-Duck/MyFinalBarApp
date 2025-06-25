import React, { useState, useEffect } from 'react';
import { Slot, useRouter, useSegments, Href } from 'expo-router';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// --- IMPORTANT ---
// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyDyouzzGWmk2ed_Pnnd92jnDduxmBZtc0w",
  authDomain: "barvision-smfkb.firebaseapp.com",
  projectId: "barvision-smfkb",
  storageBucket: "barvision-smfkb.firebasestorage.app",
  messagingSenderId: "256291742876",
  appId: "1:256291742876:web:35d9cf94da0e46b0e57959"
};
// -----------------

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

/**
 * Custom hook to protect routes based on authentication state.
 * It ensures that unauthenticated users are always sent to the login screen,
 * and authenticated users are sent to the main app content.
 */
const useProtectedRoute = (user: User | null, authLoading: boolean) => {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // We don't want to run navigation logic until Firebase auth has been checked.
    if (authLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is signed in and trying to access an auth screen (like login),
    // redirect them to the home screen of the main app.
    if (user && inAuthGroup) {
      // FIX: Use the Href type from expo-router for better type safety.
      router.replace('/(tabs)/home' as Href); 
    } 
    // If the user is not signed in and is trying to access anything
    // other than the auth screens, redirect them to the login screen.
    else if (!user && !inAuthGroup) {
      // FIX: Use the Href type from expo-router for better type safety.
      router.replace('/(auth)/login' as Href);
    }
  }, [user, segments, authLoading, router]);
};

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Track initial auth check
  
  const auth = getAuth();

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function.
    // This listener checks the user's sign-in state.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // The first time this runs, the initial auth check is complete.
      setAuthLoading(false); 
    });

    // Cleanup subscription on unmount to prevent memory leaks.
    return () => unsubscribe();
  }, [auth]);

  // Use the hook to manage navigation.
  useProtectedRoute(user, authLoading);

  // While the initial authentication check is running, show a loading indicator.
  // This prevents a "flash" of the login screen before redirecting.
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // The <Slot /> component renders the current child route (login or tabs).
  // Our hook has already directed the router to the correct one.
  return <Slot />;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
