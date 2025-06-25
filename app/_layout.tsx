    // File: app/_layout.tsx

    import React, { useState, useEffect } from 'react';
    import { View, ActivityIndicator, StyleSheet } from 'react-native';
    import { Stack } from 'expo-router';
    import 'react-native-reanimated';

    import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
    import { GoogleSignin } from '@react-native-google-signin/google-signin';

    // This configures Google Sign-in. The webClientId is crucial.
    // You can find this inside your `google-services.json` file.
    GoogleSignin.configure({
      webClientId: '853937397489-ijljjl3olgk90kvjnojfn3kl7s81vp0h.apps.googleusercontent.com',
    });

    // We will build a proper LoginScreen component later.
    // For now, this component will just show a loading spinner.
    function AuthFlow() {
        // This is where we will add the "Sign in with Google" button.
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
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
        // For now, we will return the loading screen. Next, we'll build the UI.
        return <AuthFlow />;
      }

      // If the user is logged in, show the main app with the tabs.
      return (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      );
    }

    const styles = StyleSheet.create({
        container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    });
    