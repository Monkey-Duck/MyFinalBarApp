import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { AuthSessionResult } from 'expo-auth-session';

// This component assumes Firebase is already initialized in your root _layout file.

export default function LoginScreen(): JSX.Element {
  const auth = getAuth();

  // The hook now correctly types the response object.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // For Expo Go and web, you must provide the Web Client ID.
    clientId: '256291742876-3h2l0t8taq1stano8ba3b5mgbp85t5vb.apps.googleusercontent.com',
  });

  useEffect(() => {
    const handleSignIn = async (authResponse: AuthSessionResult | null) => {
      if (authResponse?.type === 'success') {
        const { id_token } = authResponse.params;
        const credential = GoogleAuthProvider.credential(id_token);
        try {
          await signInWithCredential(auth, credential);
          // On success, the onAuthStateChanged listener in your root layout
          // will automatically navigate the user to the main app.
          console.log('Firebase sign-in successful!');
        } catch (error) {
          console.error('Firebase sign-in error:', error);
          // You could show an error toast or message to the user here.
        }
      } else if (authResponse?.type === 'error') {
        console.error('Google sign-in error:', authResponse.error);
      }
    };

    handleSignIn(response);
  }, [response]);

  const handlePress = () => {
    // The promptAsync function can be called directly.
    // The disabled state on the button prevents multiple clicks.
    if (promptAsync) {
        promptAsync();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bar Inventory</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        
        <TouchableOpacity 
            style={[styles.button, !request && styles.buttonDisabled]} 
            onPress={handlePress} 
            disabled={!request}
        >
            {!request ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Sign in with Google</Text>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117', // A dark, modern background
  },
  card: {
    width: '90%',
    maxWidth: 400,
    padding: 32,
    backgroundColor: '#161b22', // A slightly lighter card color
    borderRadius: 16,
    borderColor: '#30363d',
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#c9d1d9', // Light text for dark background
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b949e', // Muted text color
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#238636', // A vibrant green for the call to action
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#57606a',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
